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
    }

    Listing[] public listings;
    mapping(address => bool) public registeredDaos;

    event ListingCreated(address indexed daoAddress);
    event ListingRemoved(address indexed daoAddress);

    constructor() Ownable(msg.sender) {}

    function createListing(
        string memory nftName,
        string memory nftSymbol,
        string memory tokenName,
        string memory tokenSymbol,
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
            initialSupply,
            initialTokenPrice,
            initialRentalPrice,
            msg.sender,
            PERCENTAGE_DECIMALS,
            FEE_PERCENTAGE,
            RENTAL_FEE_PERCENTAGE,
            VOTE_THRESHOLD
        );

        // Add to listings
        listings.push(Listing({ daoAddress: address(newDao) }));

        registeredDaos[address(newDao)] = true;

        emit ListingCreated(address(newDao));

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
}
