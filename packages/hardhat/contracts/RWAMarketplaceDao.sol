// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWADao.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWAMarketplaceDao is Ownable {
    // Constants that will be passed to each RWADao
    uint256 private constant PERCENTAGE_DECIMALS = 10000;
    uint256 private constant FEE_PERCENTAGE = 300; // 3%
    uint256 private constant RENTAL_FEE_PERCENTAGE = 200; // 2%
    uint256 private constant VOTE_THRESHOLD = 6000; // 60%

    struct Listing {
        address daoAddress;
        string metadataUrl;
    }

    // Array approach uses less gas than mappings for iteration
    Listing[] private listings;
    // More gas efficient than searching through array
    mapping(address => uint256) private daoToIndex;

    event ListingCreated(address indexed daoAddress, address indexed creator);
    event ListingRemoved(address indexed daoAddress);

    constructor() Ownable(msg.sender) {}

    function createListing(
        string calldata nftName,
        string calldata nftSymbol,
        string calldata tokenName,
        string calldata tokenSymbol,
        string calldata metadataUrl,
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

        address daoAddress = address(newDao);

        // Add to listings with all the information
        listings.push(Listing({ daoAddress: daoAddress, metadataUrl: metadataUrl }));

        // Store the index + 1 (0 means not found)
        daoToIndex[daoAddress] = listings.length;

        emit ListingCreated(daoAddress, msg.sender);

        return daoAddress;
    }

    function removeListing(address daoAddress) external onlyOwner {
        uint256 index = daoToIndex[daoAddress];
        require(index > 0, "DAO not registered");

        // Get actual array index (stored as index+1)
        index--;

        // If not the last element, swap with the last one
        uint256 lastIndex = listings.length - 1;
        if (index != lastIndex) {
            Listing memory lastListing = listings[lastIndex];
            listings[index] = lastListing;
            // Update the index for the moved listing
            daoToIndex[lastListing.daoAddress] = index + 1;
        }

        // Remove the last element and the mapping
        listings.pop();
        delete daoToIndex[daoAddress];

        emit ListingRemoved(daoAddress);
    }

    function getListings() external view returns (address[] memory) {
        address[] memory daoAddresses = new address[](listings.length);

        for (uint256 i = 0; i < listings.length; i++) {
            daoAddresses[i] = listings[i].daoAddress;
        }

        return daoAddresses;
    }

    function getListingDetails(address daoAddress) external view returns (Listing memory) {
        uint256 index = daoToIndex[daoAddress];
        require(index > 0, "DAO not registered");

        return listings[index - 1];
    }

    function isRegisteredDao(address daoAddress) external view returns (bool) {
        return daoToIndex[daoAddress] > 0;
    }

    function getListingCount() external view returns (uint256) {
        return listings.length;
    }

    // Getters for constants
    function getPercentageDecimals() external pure returns (uint256) {
        return PERCENTAGE_DECIMALS;
    }

    function getFeePercentage() external pure returns (uint256) {
        return FEE_PERCENTAGE;
    }

    function getRentalFeePercentage() external pure returns (uint256) {
        return RENTAL_FEE_PERCENTAGE;
    }

    function getVoteThreshold() external pure returns (uint256) {
        return VOTE_THRESHOLD;
    }
}
