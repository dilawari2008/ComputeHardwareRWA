// const hre = require("hardhat");
// const fs = require("fs");

// async function main() {
//   console.log("Deploying RWAMarketplaceDao...");
  
//   const RWAMarketplaceDao = await hre.ethers.getContractFactory("RWAMarketplaceDao");
//   const marketplaceDao = await RWAMarketplaceDao.deploy();
  
//   await marketplaceDao.deploymentTransaction().wait();
  
//   const marketplaceDaoAddress = await marketplaceDao.getAddress();
//   console.log(`RWAMarketplaceDao deployed to: ${marketplaceDaoAddress}`);
  
//   // Store deployment info
//   const deploymentInfo = {
//     RWAMarketplaceDao: {
//       address: marketplaceDaoAddress,
//       constructorArgs: []
//     },
//     DAOs: []
//   };
  
//   // Create a listing to test the full flow
//   console.log("Creating a listing...");
  
//   // Example listing parameters
//   const nftName = "Test NFT";
//   const nftSymbol = "TNFT";
//   const tokenName = "Test Token";
//   const tokenSymbol = "TTK";
//   const metadataUrl = "ipfs://metadata/uri";
//   const initialSupply = 100;
//   const initialTokenPrice = ethers.parseEther("0.01");
//   const initialRentalPrice = ethers.parseEther("0.05");
  
//   const tx = await marketplaceDao.createListing(
//     nftName,
//     nftSymbol,
//     tokenName,
//     tokenSymbol,
//     metadataUrl,
//     initialSupply,
//     initialTokenPrice,
//     initialRentalPrice
//   );
  
//   await tx.wait();
  
//   // Get the created DAO address
//   const listings = await marketplaceDao.getListings();
//   const daoAddress = listings[0];
  
//   console.log("DAO contract created at:", daoAddress);
  
//   // Get marketplace constants to record constructor args
//   const PERCENTAGE_DECIMALS = await marketplaceDao.getPercentageDecimals();
//   const FEE_PERCENTAGE = await marketplaceDao.getFeePercentage();
//   const RENTAL_FEE_PERCENTAGE = await marketplaceDao.getRentalFeePercentage();
//   const VOTE_THRESHOLD = await marketplaceDao.getVoteThreshold();
  
//   // Get deployer address
//   const [deployer] = await ethers.getSigners();
  
//   // Store DAO constructor arguments for verification
//   deploymentInfo.DAOs.push({
//     address: daoAddress,
//     constructorArgs: [
//       nftName,
//       nftSymbol,
//       tokenName,
//       tokenSymbol,
//       metadataUrl,
//       initialSupply,
//       initialTokenPrice.toString(),
//       initialRentalPrice.toString(),
//       deployer.address,
//       PERCENTAGE_DECIMALS.toString(),
//       FEE_PERCENTAGE.toString(),
//       RENTAL_FEE_PERCENTAGE.toString(),
//       VOTE_THRESHOLD.toString()
//     ]
//   });
  
//   // Get addresses of contracts created by DAO
//   const RWADao = await hre.ethers.getContractFactory("RWADao");
//   const dao = RWADao.attach(daoAddress);
  
//   const nftAddress = await dao.NFT_CONTRACT();
//   const tokenAddress = await dao.TOKEN_CONTRACT();
//   const priceOracleAddress = await dao.PRICE_ORACLE();
  
//   console.log(`NFT contract: ${nftAddress}`);
//   console.log(`Token contract: ${tokenAddress}`);
//   console.log(`Price Oracle: ${priceOracleAddress}`);
  
//   // Store child contract info
//   deploymentInfo.DAOs[0].childContracts = {
//     NFT: {
//       address: nftAddress,
//       constructorArgs: [nftName, nftSymbol]
//     },
//     Token: {
//       address: tokenAddress,
//       constructorArgs: [tokenName, tokenSymbol, "0"]
//     },
//     PriceOracle: {
//       address: priceOracleAddress,
//       constructorArgs: []
//     }
//   };

//   console.log(deploymentInfo, "deploymentInfo");
  
//   // Save deployment info to file
//   fs.writeFileSync(
//     "deployment-info.json",
//     JSON.stringify(deploymentInfo, null, 2)
//   );
  
//   console.log("Deployment info saved to deployment-info.json");
//   console.log("Use verify-all.js to verify contracts");
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });