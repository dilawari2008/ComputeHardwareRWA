import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, save } = hre.deployments;

  // Your existing constructor arguments
  const nftName = "RWANft";
  const nftSymbol = "RWNFT";
  const tokenName = "RWAToken";
  const tokenSymbol = "RWTK";
  const initialSupply = "1000";
  const initialTokenPrice = "100000000000000000";
  const initialRentalPrice = "50000000000000000";
  const initialOwnerAddress = deployer;

  // Deploy RWADao
  const rwaDaoDeployment = await deploy("RWADao", {
    from: deployer,
    args: [
      nftName,
      nftSymbol,
      tokenName,
      tokenSymbol,
      initialSupply,
      initialTokenPrice,
      initialRentalPrice,
      initialOwnerAddress,
    ],
    log: true,
    autoMine: true,
    waitConfirmations: 1,
  });

  // Get the deployed RWADao contract
  const rwaDaoContract = await hre.ethers.getContractAt("RWADao", rwaDaoDeployment.address);

  // Get addresses of the NFT and Token contracts
  const nftAddress = await rwaDaoContract.NFT_CONTRACT();
  const tokenAddress = await rwaDaoContract.TOKEN_CONTRACT();

  // Deploy the artifacts for NFT and Token contracts
  await deploy("RWANft", {
    from: deployer,
    contract: "RWANft",
    args: [nftName, nftSymbol],
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
    waitConfirmations: 1,
  });

  await deploy("RWAToken", {
    from: deployer,
    contract: "RWAToken",
    args: [tokenName, tokenSymbol, 0], // Initial supply is 0 since RWADao will mint
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
    waitConfirmations: 1,
  });

  // Save the actual deployed instances
  await save("RWANft", {
    abi: (await hre.artifacts.readArtifact("RWANft")).abi,
    address: nftAddress,
  });

  await save("RWAToken", {
    abi: (await hre.artifacts.readArtifact("RWAToken")).abi,
    address: tokenAddress,
  });

  console.log("📄 Contracts deployed:");
  console.log("RWADao:", rwaDaoDeployment.address);
  console.log("RWANft:", nftAddress);
  console.log("RWAToken:", tokenAddress);
};

export default deployYourContract;

deployYourContract.tags = ["RWADao"];
