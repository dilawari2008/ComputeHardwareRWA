import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMarketplace: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy RWAMarketplaceDao
  const marketplaceDeployment = await deploy("RWAMarketplaceDao", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: 1,
  });

  console.log("📄 Marketplace Contract deployed:", marketplaceDeployment.address);
};

export default deployMarketplace;

deployMarketplace.tags = ["RWAMarketplaceDao"];
