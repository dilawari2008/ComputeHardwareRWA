// const hre = require("hardhat");
// const fs = require("fs");

// async function main() {
//   // Load deployment info
//   const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
  
//   // Verify Marketplace
//   console.log("Verifying RWAMarketplaceDao...");
//   try {
//     await hre.run("verify:verify", {
//       address: deploymentInfo.RWAMarketplaceDao.address,
//       constructorArguments: deploymentInfo.RWAMarketplaceDao.constructorArgs,
//     });
//     console.log("✅ RWAMarketplaceDao verified successfully");
//   } catch (error) {
//     console.error("❌ Error verifying RWAMarketplaceDao:", error.message);
//   }
  
//   // Verify each DAO and its child contracts
//   for (let i = 0; i < deploymentInfo.DAOs.length; i++) {
//     const dao = deploymentInfo.DAOs[i];
    
//     console.log(`\nVerifying DAO at ${dao.address}...`);
    
//     try {
//       await hre.run("verify:verify", {
//         address: dao.address,
//         constructorArguments: dao.constructorArgs,
//       });
//       console.log(`✅ DAO at ${dao.address} verified successfully`);
//     } catch (error) {
//       console.error(`❌ Error verifying DAO at ${dao.address}:`, error.message);
//     }
    
//     // Verify NFT contract
//     console.log(`\nVerifying NFT contract at ${dao.childContracts.NFT.address}...`);
//     try {
//       await hre.run("verify:verify", {
//         address: dao.childContracts.NFT.address,
//         constructorArguments: dao.childContracts.NFT.constructorArgs,
//       });
//       console.log(`✅ NFT contract verified successfully`);
//     } catch (error) {
//       console.error(`❌ Error verifying NFT contract:`, error.message);
//     }
    
//     // Verify Token contract
//     console.log(`\nVerifying Token contract at ${dao.childContracts.Token.address}...`);
//     try {
//       await hre.run("verify:verify", {
//         address: dao.childContracts.Token.address,
//         constructorArguments: dao.childContracts.Token.constructorArgs,
//       });
//       console.log(`✅ Token contract verified successfully`);
//     } catch (error) {
//       console.error(`❌ Error verifying Token contract:`, error.message);
//     }
    
//     // Verify PriceOracle contract
//     console.log(`\nVerifying PriceOracle at ${dao.childContracts.PriceOracle.address}...`);
//     try {
//       await hre.run("verify:verify", {
//         address: dao.childContracts.PriceOracle.address,
//         constructorArguments: dao.childContracts.PriceOracle.constructorArgs,
//       });
//       console.log(`✅ PriceOracle contract verified successfully`);
//     } catch (error) {
//       console.error(`❌ Error verifying PriceOracle contract:`, error.message);
//     }
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });