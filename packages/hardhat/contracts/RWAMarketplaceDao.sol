// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWADao.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWAMarketplaceDao is Ownable {
    // Constants that will be passed to each RWADao
    uint256 public constant PERCENTAGE_DECIMALS = 10000;
    uint256 public constant FEE_PERCENTAGE = 300; // 3%
    uint256 public constant RENTAL_FEE_PERCENTAGE = 200; // 2%
    uint256 public constant VOTE_THRESHOLD = 6000; // 60%

    struct Listing {
        address daoAddress;
        string nftName;
        string nftSymbol;
        string tokenName;
        string tokenSymbol;
        string metadataUrl;
        uint256 initialSupply;
        uint256 initialTokenPrice;
        uint256 initialRentalPrice;
        address creator;
    }

    Listing[] public listings;
    mapping(address => bool) public registeredDaos;

    event ListingCreated(address indexed daoAddress, address indexed creator);
    event ListingRemoved(address indexed daoAddress);

    constructor() Ownable(msg.sender) {}

    function createListing(
        string memory nftName,
        string memory nftSymbol,
        string memory tokenName,
        string memory tokenSymbol,
        string memory metadataUrl,
        uint256 initialSupply,
        uint256 initialTokenPrice,
        uint256 initialRentalPrice
    ) external returns (address) {
        // Create new RWADao contract with marketplace-defined parameters
        RWADao newDao = new RWADao(
            nftName,
            nftSymbol,
            tokenName,
            tokenSymbol,
            metadataUrl,
            initialSupply,
            initialTokenPrice,
            initialRentalPrice,
            msg.sender,
            PERCENTAGE_DECIMALS,
            FEE_PERCENTAGE,
            RENTAL_FEE_PERCENTAGE,
            VOTE_THRESHOLD
        );

        // Add to listings with all the information
        Listing memory newListing = Listing({
            daoAddress: address(newDao),
            nftName: nftName,
            nftSymbol: nftSymbol,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            metadataUrl: metadataUrl,
            initialSupply: initialSupply,
            initialTokenPrice: initialTokenPrice,
            initialRentalPrice: initialRentalPrice,
            creator: msg.sender
        });

        listings.push(newListing);
        registeredDaos[address(newDao)] = true;

        emit ListingCreated(address(newDao), msg.sender);

        return address(newDao);
    }

    function removeListing(address daoAddress) external onlyOwner {
        require(registeredDaos[daoAddress], "DAO not registered");

        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].daoAddress == daoAddress) {
                // Remove the listing by swapping with the last element and popping
                listings[i] = listings[listings.length - 1];
                listings.pop();
                registeredDaos[daoAddress] = false;

                emit ListingRemoved(daoAddress);
                return;
            }
        }

        revert("Listing not found");
    }

    function getListings() external view returns (address[] memory) {
        address[] memory daoAddresses = new address[](listings.length);

        for (uint i = 0; i < listings.length; i++) {
            daoAddresses[i] = listings[i].daoAddress;
        }

        return daoAddresses;
    }

    function getListingDetails(address daoAddress) external view returns (Listing memory) {
        require(registeredDaos[daoAddress], "DAO not registered");

        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].daoAddress == daoAddress) {
                return listings[i];
            }
        }

        revert("Listing not found");
    }

    function getListingCount() external view returns (uint256) {
        return listings.length;
    }
}
