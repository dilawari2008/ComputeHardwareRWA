// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWANft.sol";
import "./RWAToken.sol";
import "./PriceOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWADao is Ownable {
    RWANft public immutable NFT_CONTRACT;
    RWAToken public immutable TOKEN_CONTRACT;
    PriceOracle public immutable PRICE_ORACLE;
    uint256 public tokenPrice;
    uint256 public rentalPrice;
    address public currentTenant;

    // the following shall be decided upon by the MarketplaceDAO
    uint256 public immutable PERCENTAGE_DECIMALS;
    uint256 public immutable FEE_PERCENTAGE;
    uint256 public immutable RENTAL_FEE_PERCENTAGE;
    uint256 public immutable VOTE_THRESHOLD;

    struct ApprovedSale {
        address seller;
        uint256 amount;
        uint256 timestamp;
    }

    struct RentProposal {
        uint256 proposedPrice;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        bool isActive;
        uint256 timestamp;
    }

    RentProposal public currentProposal;
    ApprovedSale[] public approvedSales;
    mapping(address => uint256) public sellerToAvailableTokens;

    constructor(
        string memory nftName,
        string memory nftSymbol,
        string memory tokenName,
        string memory tokenSymbol,
        string memory metadataUrl,
        uint256 initialSupply,
        uint256 initialTokenPrice,
        uint256 initialRentalPrice,
        address initialOwnerAddress,
        uint256 initialPercentageDecimals,
        uint256 initialFeePercentage,
        uint256 initialRentalFeePercentage,
        uint256 initialVoteThreshold
    ) Ownable(msg.sender) {
        require(initialOwnerAddress != address(0), "Invalid initial owner address");
        require(initialTokenPrice > 0, "Price must be greater than 0");
        require(initialSupply > 0, "Supply must be greater than 0");
        require(initialRentalPrice > 0, "Rental price must be greater than 0");

        NFT_CONTRACT = new RWANft(nftName, nftSymbol);
        NFT_CONTRACT.mintNft(metadataUrl);
        TOKEN_CONTRACT = new RWAToken(tokenName, tokenSymbol, 0);
        TOKEN_CONTRACT.mintToAddress(initialOwnerAddress, initialSupply);
        PRICE_ORACLE = new PriceOracle();

        tokenPrice = initialTokenPrice;
        rentalPrice = initialRentalPrice;
        PERCENTAGE_DECIMALS = initialPercentageDecimals;
        FEE_PERCENTAGE = initialFeePercentage;
        RENTAL_FEE_PERCENTAGE = initialRentalFeePercentage;
        VOTE_THRESHOLD = initialVoteThreshold;
    }

    function unlockNFT() external {
        uint256 totalSupply = TOKEN_CONTRACT.totalSupply();

        // Check if sender has all tokens
        require(TOKEN_CONTRACT.balanceOf(msg.sender) == totalSupply, "Must own all tokens");

        // Transfer tokens to contract
        require(TOKEN_CONTRACT.transferFrom(msg.sender, address(this), totalSupply), "Transfer failed");

        // Get NFT from current owner (should be initial owner/DAO creator)
        address nftOwner = NFT_CONTRACT.ownerOf(0);
        NFT_CONTRACT.transferFrom(nftOwner, msg.sender, 0);

        // Burn all tokens
        TOKEN_CONTRACT.burn(totalSupply);
    }

    function becomeTenant() external payable {
        require(currentTenant == address(0), "Property already rented");
        require(msg.value == rentalPrice, "Incorrect rent amount");

        uint256 daoFee = (msg.value * RENTAL_FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;

        currentTenant = msg.sender;
        _distributeRent(msg.value - daoFee); // Inline calculation to save gas
    }

    function quitTenancy() external {
        require(msg.sender == currentTenant, "Not the current tenant");
        currentTenant = address(0); // Move after the event to save gas on cold storage read
    }

    function payRent() external payable {
        require(msg.sender == currentTenant, "Not the current tenant");
        require(msg.value == rentalPrice, "Incorrect rent amount");

        uint256 daoFee = (msg.value * RENTAL_FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;
        _distributeRent(msg.value - daoFee); // Inline calculation to save gas
    }

    function proposeNewRent(uint256 newRentalPrice) external {
        require(!currentProposal.isActive, "Active proposal exists");
        require(TOKEN_CONTRACT.balanceOf(msg.sender) > 0, "Not a token holder");
        require(newRentalPrice > 0, "Invalid rental price");

        // Batch storage writes to save gas
        RentProposal storage proposal = currentProposal;
        proposal.proposedPrice = newRentalPrice;
        proposal.isActive = true;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.timestamp = block.timestamp;
    }

    function vote(bool inFavor) external {
        // Read from storage once to save gas
        RentProposal storage proposal = currentProposal;
        require(proposal.isActive, "No active proposal");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(TOKEN_CONTRACT.balanceOf(msg.sender) > 0, "Not a token holder");

        // Cache totalSupply to avoid multiple calls
        uint256 totalSupply = TOKEN_CONTRACT.totalSupply();
        uint256 voterWeight = (TOKEN_CONTRACT.balanceOf(msg.sender) * PERCENTAGE_DECIMALS) / totalSupply;

        if (inFavor) {
            proposal.votesFor += voterWeight;
        } else {
            proposal.votesAgainst += voterWeight;
        }

        proposal.hasVoted[msg.sender] = true;

        _checkAndFinalizeVote();
    }

    function _checkAndFinalizeVote() private {
        // Read from storage once to save gas
        RentProposal storage proposal = currentProposal;

        if (proposal.votesFor >= VOTE_THRESHOLD) {
            rentalPrice = proposal.proposedPrice;
            _resetProposal();
        } else if (proposal.votesAgainst > (PERCENTAGE_DECIMALS - VOTE_THRESHOLD)) {
            _resetProposal();
        }
    }

    function _resetProposal() private {
        // Cache holders array to avoid repeated calls
        address[] memory holders = TOKEN_CONTRACT.getHolders();
        // Use direct storage reference to save gas on repeated access
        RentProposal storage proposal = currentProposal;

        // Clear mapping efficiently
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            if (proposal.hasVoted[holder]) {
                proposal.hasVoted[holder] = false;
            }
        }

        // Batch clears to save gas
        proposal.proposedPrice = 0;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.timestamp = 0;
        proposal.isActive = false;
    }

    function _distributeRent(uint256 amount) private {
        // Cache these values to save gas
        address[] memory holders = TOKEN_CONTRACT.getHolders();
        uint256 totalSupply = TOKEN_CONTRACT.totalSupply();
        uint256 holdersLength = holders.length;

        for (uint256 i = 0; i < holdersLength; i++) {
            address holder = holders[i];
            uint256 holderBalance = TOKEN_CONTRACT.balanceOf(holder);

            // Calculate share and fee in one step to save gas
            uint256 holderShare = (amount * holderBalance) / totalSupply;
            uint256 finalAmount = holderShare - ((holderShare * FEE_PERCENTAGE) / PERCENTAGE_DECIMALS);

            payable(holder).transfer(finalAmount);
        }
    }

    function approveTokensForSale(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(TOKEN_CONTRACT.balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Cache these values to save gas
        uint256 currentlyQueued = sellerToAvailableTokens[msg.sender];
        uint256 approved = TOKEN_CONTRACT.allowance(msg.sender, address(this));
        uint256 totalAfterRequest = currentlyQueued + amount;

        require(
            totalAfterRequest <= approved,
            string(
                abi.encodePacked(
                    "Total would exceed approval. Currently queued: ",
                    toString(currentlyQueued),
                    ", Requested: ",
                    toString(amount),
                    ", Total approval: ",
                    toString(approved)
                )
            )
        );

        approvedSales.push(ApprovedSale({ seller: msg.sender, amount: amount, timestamp: block.timestamp }));

        sellerToAvailableTokens[msg.sender] = totalAfterRequest; // Use cached value
    }

    function buyTokens(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value == amount * tokenPrice, "Incorrect payment amount");

        uint256 remainingToBuy = amount;
        uint256 i = 0;
        uint256 salesLength = approvedSales.length; // Cache array length

        while (remainingToBuy > 0 && i < salesLength) {
            ApprovedSale storage sale = approvedSales[i];
            if (sale.amount > 0) {
                // Use temp variables to minimize storage operations
                uint256 buyAmount = remainingToBuy > sale.amount ? sale.amount : remainingToBuy;
                address seller = sale.seller;

                uint256 payment = buyAmount * tokenPrice;
                uint256 fee = (payment * FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;

                require(TOKEN_CONTRACT.transferFrom(seller, msg.sender, buyAmount), "Token transfer failed");

                payable(seller).transfer(payment - fee);

                // Update storage once with final values
                sale.amount -= buyAmount;
                sellerToAvailableTokens[seller] -= buyAmount;
                remainingToBuy -= buyAmount;
            }
            i++;
        }

        require(remainingToBuy == 0, "Not enough tokens available");
        _cleanupEmptySales();
    }

    function updateTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        tokenPrice = newPrice;
    }

    function getAvailableTokensForSale() external view returns (uint256) {
        uint256 total = 0;
        uint256 salesLength = approvedSales.length; // Cache array length

        for (uint256 i = 0; i < salesLength; i++) {
            total += approvedSales[i].amount;
        }
        return total;
    }

    function _cleanupEmptySales() private {
        uint256 i = 0;
        while (i < approvedSales.length) {
            if (approvedSales[i].amount == 0) {
                // Swap with last element and pop - gas efficient removal
                approvedSales[i] = approvedSales[approvedSales.length - 1];
                approvedSales.pop();
            } else {
                i++;
            }
        }
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);

        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
