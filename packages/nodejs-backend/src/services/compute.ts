import { PinataSDK } from "pinata";
import { HttpStatusCodes } from "@/common/constants";
import LOGGER from "@/common/logger";
import createHttpError from "http-errors";
import axios from "axios";
import { Readable } from "stream";
import FormData from "form-data";
import Config from "@/config";
import fs from "fs";
import { ethers } from "ethers";
import EChain from "@/common/chain.enum";
import { MARKETPLACE_ABI } from "@/common/constants/abi/marketplace.abi";

const provider = new ethers.providers.JsonRpcProvider(
  Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
);

interface ICreateListing {
  hardwareName: string;
  totalTokens: number;
  tokenPrice: number;
  rentalPrice: number;
  imageUrl: string;
  cpu: string;
  memory: string;
  location: string;
  userAddress: string;
}

// Fix 2: Use Axios directly for reliable uploads
const uploadToPinata = async (file: Express.Multer.File) => {
  try {
    const data = new FormData();

    // Append file as a readable stream
    data.append("file", fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await axios.post(Config.pinata.pinataUrl, data, {
      maxContentLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${
          (data as any)._boundary
        }`,
        Authorization: `Bearer ${Config.pinata.jwt}`,
      },
    });

    // Clean up
    fs.unlinkSync(file.path);

    // Return standard gateway URL instead of custom gateway
    const res = {
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      customGatewayUrl: `https://${Config.pinata.gateway}/ipfs/${response.data.IpfsHash}`,
    };

    return res;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

const createListing = async (listing: ICreateListing) => {
  if (!listing.hardwareName || !listing.userAddress) {
    throw createHttpError.BadRequest(
      "Hardware name and user address are required"
    );
  }

  const {
    hardwareName,
    userAddress,
    imageUrl,
    cpu,
    memory,
    location,
    totalTokens,
    tokenPrice,
    rentalPrice,
  } = listing;

  const hardwareMetadata = {
    name: hardwareName,
    image: imageUrl,
    cpu: cpu || "",
    memory: memory || "",
    location: location || "",
  };

  const contractAddress =
    Config.contractAddress[(process.env.CHAIN as EChain) || EChain.hardhat]
      .marketplace;

  const requestConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${Config.pinata.pinataUrl}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Config.pinata.jwt}`,
    },
    data: JSON.stringify(hardwareMetadata),
  };

  const response = await axios.request(requestConfig);

  const metadataUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

  const nftName = `${hardwareName} NFT`;
  const nftSymbol =
    hardwareName
      .replace(/[^A-Z0-9]/gi, "")
      .substring(0, 5)
      .toUpperCase() + "NFT";
  const tokenName = `${hardwareName} Token`;
  const tokenSymbol =
    hardwareName
      .replace(/[^A-Z0-9]/gi, "")
      .substring(0, 5)
      .toUpperCase() + "TKN";

  // 4. Create contract interface
  const contract = new ethers.utils.Interface(MARKETPLACE_ABI);

  // 5. Encode function data for createListing
  const data = contract.encodeFunctionData("createListing", [
    nftName,
    nftSymbol,
    tokenName,
    tokenSymbol,
    ethers.BigNumber.from(totalTokens || "1000"),
    ethers.utils.parseUnits(tokenPrice.toString(), "ether"),
    ethers.utils.parseUnits(rentalPrice.toString(), "ether"),
    metadataUrl,
  ]);

  // 6. Estimate gas (this will be paid by the user)
  const gasEstimate = await provider.estimateGas({
    from: userAddress,
    to: contractAddress,
    data,
  });

  // 7. Get current gas price
  const gasPrice = await provider.getGasPrice();

  // 8. Get nonce for the user
  const nonce = await provider.getTransactionCount(userAddress);

  // 9. Get chainId
  const network = await provider.getNetwork();
  const chainId = network.chainId;

  // 10. Create transaction object
  const txObject = {
    from: userAddress,
    to: contractAddress,
    data,
    gasLimit: gasEstimate,
    gasPrice,
    nonce,
    chainId,
  };

  // Return the transaction for the frontend to sign
  const res = {
    tx: txObject,
    message: "Transaction created successfully. Please sign and submit.",
  };

  return res;
};

const ComputeService = {
  uploadToPinata,
  createListing,
};

export default ComputeService;
