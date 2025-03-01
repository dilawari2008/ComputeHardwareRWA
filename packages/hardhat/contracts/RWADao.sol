// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWANft.sol";
import "./RWAToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWADao is Ownable {
    RWANft public immutable NFT_CONTRACT;
    RWAToken public immutable TOKEN_CONTRACT;
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

    event DaoCreated(address nftAddress, address tokenAddress);
    event TokensApprovedForSale(address seller, uint256 amount);
    event TokensPurchased(address seller, address buyer, uint256 amount, uint256 price);
    event NFTUnlocked(address unlocker);
    event TenantChanged(address oldTenant, address newTenant);
    event RentPaid(address tenant, uint256 amount);
    event RentDistributed(address holder, uint256 amount);
    event RentProposalCreated(address proposer, uint256 newPrice);
    event VoteCast(address voter, bool inFavor, uint256 weight);
    event ProposalCompleted(bool approved, uint256 newPrice);

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
        // the following shall be decided upon by the MarketplaceDAO
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

        tokenPrice = initialTokenPrice;
        rentalPrice = initialRentalPrice;
        // the following shall be decided upon by the MarketplaceDAO
        PERCENTAGE_DECIMALS = initialPercentageDecimals;
        FEE_PERCENTAGE = initialFeePercentage;
        RENTAL_FEE_PERCENTAGE = initialRentalFeePercentage;
        VOTE_THRESHOLD = initialVoteThreshold;
        emit DaoCreated(address(NFT_CONTRACT), address(TOKEN_CONTRACT));
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

        // Burn all tokens - first need to add burn function to RWAToken
        TOKEN_CONTRACT.burn(totalSupply);

        emit NFTUnlocked(msg.sender);
    }

    function becomeTenant() external payable {
        require(currentTenant == address(0), "Property already rented");
        require(msg.value == rentalPrice, "Incorrect rent amount");

        uint256 daoFee = (msg.value * RENTAL_FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;
        uint256 rentToDistribute = msg.value - daoFee;

        currentTenant = msg.sender;
        _distributeRent(rentToDistribute);

        emit TenantChanged(address(0), msg.sender);
        emit RentPaid(msg.sender, msg.value);
    }

    function quitTenancy() external {
        require(msg.sender == currentTenant, "Not the current tenant");
        currentTenant = address(0);
        emit TenantChanged(msg.sender, address(0));
    }

    function payRent() external payable {
        require(msg.sender == currentTenant, "Not the current tenant");
        require(msg.value == rentalPrice, "Incorrect rent amount");

        uint256 daoFee = (msg.value * RENTAL_FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;
        uint256 rentToDistribute = msg.value - daoFee;

        _distributeRent(rentToDistribute);
        emit RentPaid(msg.sender, msg.value);
    }

    function proposeNewRent(uint256 newRentalPrice) external {
        require(!currentProposal.isActive, "Active proposal exists");
        require(TOKEN_CONTRACT.balanceOf(msg.sender) > 0, "Not a token holder");
        require(newRentalPrice > 0, "Invalid rental price");

        currentProposal.proposedPrice = newRentalPrice;
        currentProposal.isActive = true;
        currentProposal.votesFor = 0;
        currentProposal.votesAgainst = 0;
        currentProposal.timestamp = block.timestamp;

        emit RentProposalCreated(msg.sender, newRentalPrice);
    }

    function vote(bool inFavor) external {
        require(currentProposal.isActive, "No active proposal");
        require(!currentProposal.hasVoted[msg.sender], "Already voted");
        require(TOKEN_CONTRACT.balanceOf(msg.sender) > 0, "Not a token holder");

        uint256 voterWeight = (TOKEN_CONTRACT.balanceOf(msg.sender) * PERCENTAGE_DECIMALS) /
            TOKEN_CONTRACT.totalSupply(); // fix it

        if (inFavor) {
            currentProposal.votesFor += voterWeight;
        } else {
            currentProposal.votesAgainst += voterWeight;
        }

        currentProposal.hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, inFavor, voterWeight);

        _checkAndFinalizeVote();
    }

    function _checkAndFinalizeVote() private {
        if (currentProposal.votesFor >= VOTE_THRESHOLD) {
            rentalPrice = currentProposal.proposedPrice;
            _resetProposal(true);
        } else if (currentProposal.votesAgainst > (PERCENTAGE_DECIMALS - VOTE_THRESHOLD)) {
            // fix it
            _resetProposal(false);
        }
    }

    function _resetProposal(bool approved) private {
        emit ProposalCompleted(approved, approved ? currentProposal.proposedPrice : rentalPrice);
        delete currentProposal.proposedPrice;
        delete currentProposal.votesFor;
        delete currentProposal.votesAgainst;
        currentProposal.isActive = false;
    }

    function _distributeRent(uint256 amount) private {
        address[] memory holders = TOKEN_CONTRACT.getHolders();
        uint256 totalSupply = TOKEN_CONTRACT.totalSupply();

        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 holderBalance = TOKEN_CONTRACT.balanceOf(holder);
            uint256 holderShare = (amount * holderBalance) / totalSupply;
            uint256 holderFee = (holderShare * FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;
            uint256 finalAmount = holderShare - holderFee;

            payable(holder).transfer(finalAmount);
            emit RentDistributed(holder, finalAmount);
        }
    }

    function approveTokensForSale(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(TOKEN_CONTRACT.balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 currentlyQueued = sellerToAvailableTokens[msg.sender];
        uint256 totalAfterRequest = currentlyQueued + amount;
        uint256 approved = TOKEN_CONTRACT.allowance(msg.sender, address(this));

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

        sellerToAvailableTokens[msg.sender] += amount;
        emit TokensApprovedForSale(msg.sender, amount);
    }

    function buyTokens(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value == amount * tokenPrice, "Incorrect payment amount");

        uint256 remainingToBuy = amount;
        uint256 i = 0;

        while (remainingToBuy > 0 && i < approvedSales.length) {
            ApprovedSale storage sale = approvedSales[i];
            if (sale.amount > 0) {
                uint256 buyAmount = remainingToBuy > sale.amount ? sale.amount : remainingToBuy;

                uint256 payment = buyAmount * tokenPrice;
                uint256 fee = (payment * FEE_PERCENTAGE) / PERCENTAGE_DECIMALS;
                uint256 sellerPayment = payment - fee;

                require(TOKEN_CONTRACT.transferFrom(sale.seller, msg.sender, buyAmount), "Token transfer failed");

                payable(sale.seller).transfer(sellerPayment);

                sale.amount -= buyAmount;
                sellerToAvailableTokens[sale.seller] -= buyAmount;
                remainingToBuy -= buyAmount;

                emit TokensPurchased(sale.seller, msg.sender, buyAmount, buyAmount * tokenPrice);
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
        for (uint256 i = 0; i < approvedSales.length; i++) {
            total += approvedSales[i].amount;
        }
        return total;
    }

    function _cleanupEmptySales() private {
        uint256 i = 0;
        while (i < approvedSales.length) {
            if (approvedSales[i].amount == 0) {
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
