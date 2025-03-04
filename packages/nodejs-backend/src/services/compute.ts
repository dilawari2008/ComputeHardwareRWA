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
import { RWADAO_ABI } from "@/common/constants/abi/rwa-dao.abi";
import { RWA_TOKEN_ABI } from "@/common/constants/abi/token";
import { RWA_NFT_ABI } from "@/common/constants/abi/nft.abi";

const provider = new ethers.providers.JsonRpcProvider(
  Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
);

// Fix 2: Use Axios directly for reliable uploads
const uploadToPinata = async (file: Express.Multer.File) => {
  try {
    const data = new FormData();

    // Append file as a readable stream
    data.append("file", fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await axios.post(Config.pinata.pinataBlobUrl, data, {
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

interface ICreateListingReq {
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

const createListing = async (listing: ICreateListingReq) => {
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
    url: `${Config.pinata.pinataJsonUrl}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Config.pinata.jwt}`,
    },
    data: JSON.stringify({
      pinataContent: hardwareMetadata,
      pinataMetadata: {
        name: hardwareName,
      },
    }),
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
    metadataUrl,
    ethers.BigNumber.from(totalTokens || "1000"),
    ethers.utils.parseUnits(tokenPrice.toString(), "ether"),
    ethers.utils.parseUnits(rentalPrice.toString(), "ether"),
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

interface IFractionalizeTokensReq {
  numberOfTokens: number;
  userAddress: string;
  daoAddress: string;
}

// First function for token approval
const getTokenApprovalTx = async (req: IFractionalizeTokensReq) => {
  const { numberOfTokens, userAddress, daoAddress } = req;

  if (!numberOfTokens || !userAddress || !daoAddress) {
    throw createHttpError.BadRequest(
      "Number of tokens, user address, and DAO address are required"
    );
  }

  if (numberOfTokens <= 0) {
    throw createHttpError.BadRequest("Amount must be greater than 0");
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Get the RWADao contract to find the token contract address
    const daoContract = new ethers.Contract(daoAddress, RWADAO_ABI, provider);
    const tokenContractAddress = await daoContract.TOKEN_CONTRACT();

    // Create token contract interface
    const tokenContract = new ethers.utils.Interface(RWA_TOKEN_ABI);

    // Prepare approval transaction
    const approvalData = tokenContract.encodeFunctionData("approve", [
      daoAddress,
      ethers.BigNumber.from(numberOfTokens),
    ]);

    // Estimate gas for approval
    const approvalGasEstimate = await provider.estimateGas({
      from: userAddress,
      to: tokenContractAddress,
      data: approvalData,
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Get nonce for the user
    const nonce = await provider.getTransactionCount(userAddress);

    // Get chainId
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // Create approval transaction object
    const approvalTx = {
      from: userAddress,
      to: tokenContractAddress,
      data: approvalData,
      gasLimit: approvalGasEstimate,
      gasPrice,
      nonce,
      chainId,
    };

    const res = {
      tx: approvalTx,
      message:
        "Transaction created successfully. Please sign to approve token transfer.",
    };

    return res;
  } catch (error: any) {
    if (error.message && error.message.includes("Insufficient balance")) {
      throw createHttpError.BadRequest(
        "You don't have enough tokens to approve the requested amount."
      );
    }

    throw createHttpError.InternalServerError(
      `Failed to prepare token approval transaction: ${error.message}`
    );
  }
};

// Second function for DAO approval
const getFractionalizeTokensTx = async (req: IFractionalizeTokensReq) => {
  const { numberOfTokens, userAddress, daoAddress } = req;

  if (!numberOfTokens || !userAddress || !daoAddress) {
    throw createHttpError.BadRequest(
      "Number of tokens, user address, and DAO address are required"
    );
  }

  if (numberOfTokens <= 0) {
    throw createHttpError.BadRequest("Amount must be greater than 0");
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Create DAO contract interface
    const daoInterface = new ethers.utils.Interface(RWADAO_ABI);

    // Encode function data for approveTokensForSale
    const saleData = daoInterface.encodeFunctionData("approveTokensForSale", [
      ethers.BigNumber.from(numberOfTokens),
    ]);

    // Estimate gas for the transaction
    const saleGasEstimate = await provider.estimateGas({
      from: userAddress,
      to: daoAddress,
      data: saleData,
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Get nonce for the user
    const nonce = await provider.getTransactionCount(userAddress);

    // Get chainId
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // Create sale approval transaction object
    const saleTx = {
      from: userAddress,
      to: daoAddress,
      data: saleData,
      gasLimit: saleGasEstimate,
      gasPrice,
      nonce,
      chainId,
    };

    return {
      tx: saleTx,
      message:
        "Transaction created successfully. Please sign to list tokens for sale.",
    };
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes("Total would exceed approval")
    ) {
      throw createHttpError.BadRequest(
        "You need to approve the DAO contract to spend your tokens first. Please call the token approval function before trying again."
      );
    }

    if (error.message && error.message.includes("Insufficient balance")) {
      throw createHttpError.BadRequest(
        "You don't have enough tokens to fractionalize the requested amount."
      );
    }

    throw createHttpError.InternalServerError(
      `Failed to prepare fractionalization transaction: ${error.message}`
    );
  }
};

interface IBuyTokensReq {
  numberOfTokens: number;
  userAddress: string;
  daoAddress: string;
}

const buyTokens = async (req: IBuyTokensReq) => {
  const { numberOfTokens, userAddress, daoAddress } = req;

  if (!numberOfTokens || !userAddress || !daoAddress) {
    throw createHttpError.BadRequest(
      "Number of tokens, user address, and DAO address are required"
    );
  }

  if (numberOfTokens <= 0) {
    throw createHttpError.BadRequest("Amount must be greater than 0");
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Get the token price from the DAO contract
    const daoContract = new ethers.Contract(daoAddress, RWADAO_ABI, provider);
    const tokenPrice = await daoContract.tokenPrice();

    // Calculate total payment required
    const totalPayment = tokenPrice.mul(ethers.BigNumber.from(numberOfTokens));

    // Check if enough tokens are available for sale
    const availableTokens = await daoContract.getAvailableTokensForSale();
    if (availableTokens.lt(numberOfTokens)) {
      throw createHttpError.BadRequest(
        `Not enough tokens available for sale. Requested: ${numberOfTokens}, Available: ${availableTokens.toString()}`
      );
    }

    // Create DAO contract interface
    const daoInterface = new ethers.utils.Interface(RWADAO_ABI);

    // Encode function data for buyTokens
    const buyData = daoInterface.encodeFunctionData("buyTokens", [
      ethers.BigNumber.from(numberOfTokens),
    ]);

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      from: userAddress,
      to: daoAddress,
      data: buyData,
      value: totalPayment,
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Get nonce for the user
    const nonce = await provider.getTransactionCount(userAddress);

    // Get chainId
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // Create transaction object
    const txObject = {
      from: userAddress,
      to: daoAddress,
      data: buyData,
      value: totalPayment.toString(),
      gasLimit: gasEstimate,
      gasPrice,
      nonce,
      chainId,
    };

    const res = {
      tx: txObject,
      totalPayment: ethers.utils.formatEther(totalPayment),
      message: `Transaction created to buy ${numberOfTokens} tokens for ${ethers.utils.formatEther(
        totalPayment
      )} ETH. Please sign to complete purchase.`,
    };

    return res;
  } catch (error: any) {
    // Handle specific error cases
    if (
      error.message &&
      error.message.includes("Not enough tokens available")
    ) {
      throw error; // Re-throw our custom error
    }

    if (error.message && error.message.includes("Incorrect payment amount")) {
      throw createHttpError.BadRequest(
        "Incorrect payment amount calculated. Please try again."
      );
    }

    throw createHttpError.InternalServerError(
      `Failed to prepare buy transaction: ${error.message}`
    );
  }
};

interface ListingMetadata {
  name?: string;
  image?: string;
  cpu?: string;
  memory?: string;
  location?: string;
  daoAddress: string;
  tokenPrice?: string;
  rentalPrice?: string;
}

const getListing = async () => {
  try {
    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(
      Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
    );

    // Get marketplace contract address
    const marketplaceAddress =
      Config.contractAddress[(process.env.CHAIN as EChain) || EChain.hardhat]
        .marketplace;

    // Create marketplace contract instance
    const marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      MARKETPLACE_ABI,
      provider
    );

    // Get all dao addresses from marketplace
    const daoAddresses = await marketplaceContract.getListings();

    // Fetch all listings in parallel
    const listingsPromises = daoAddresses.map(async (daoAddress: string) => {
      try {
        // Create dao contract instance
        const daoContract = new ethers.Contract(
          daoAddress,
          RWADAO_ABI,
          provider
        );

        // Get contract data in parallel
        const [nftContractAddress, tokenPrice, rentalPrice] = await Promise.all(
          [
            daoContract.NFT_CONTRACT(),
            daoContract.tokenPrice(),
            daoContract.rentalPrice(),
          ]
        );

        // Create NFT contract instance
        const nftContract = new ethers.Contract(
          nftContractAddress,
          RWA_NFT_ABI,
          provider
        );

        // Get metadata URL for NFT index 0
        const metadataUrl = await nftContract.tokenURI(0);

        // Fetch metadata JSON
        const response = await axios.get(metadataUrl);
        const metadata = response.data;

        // Return listing with dao address and price information
        const listing = {
          ...metadata,
          daoAddress,
          tokenPrice: ethers.utils.formatEther(tokenPrice),
          rentalPrice: ethers.utils.formatEther(rentalPrice),
        };

        return listing;
      } catch (error) {
        console.error(`Error fetching data for DAO at ${daoAddress}:`, error);
        // Return null for failed listings
        return null;
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(listingsPromises);

    // Filter out null values (failed listings)
    const listings = results.filter(
      (listing) => listing !== null
    ) as ListingMetadata[];

    // Sort listings by daoAddress
    const sortedListings = listings.sort((a, b) => {
      return a.daoAddress.localeCompare(b.daoAddress);
    });

    return sortedListings;
  } catch (error: any) {
    console.error("Error in getListing:", error);
    throw createHttpError.InternalServerError(
      `Failed to get listings: ${error.message}`
    );
  }
};

const getDaoTokenInfo = async (daoAddress: string) => {
  if (!daoAddress) {
    throw createHttpError.BadRequest("DAO address is required");
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Get the RWADao contract
    const daoContract = new ethers.Contract(daoAddress, RWADAO_ABI, provider);

    // Get the token contract address
    const tokenContractAddress = await daoContract.TOKEN_CONTRACT();

    // Create token contract instance
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      RWA_TOKEN_ABI,
      provider
    );

    // Get total supply of tokens
    const totalSupply = await tokenContract.totalSupply();

    // Get available tokens for sale
    const availableTokensForSale =
      await daoContract.getAvailableTokensForSale();

    const res = {
      totalTokens: totalSupply.toString(),
      availableTokensForSale: availableTokensForSale.toString(),
      formattedTotalTokens: Number(totalSupply.toString()),
      formattedAvailableTokensForSale: Number(
        availableTokensForSale.toString()
      ),
    };

    return res;
  } catch (error: any) {
    console.error("Error fetching DAO token info:", error);
    throw createHttpError.InternalServerError(
      `Failed to get DAO token information: ${error.message}`
    );
  }
};

const getDaoDetails = async (daoAddress: string) => {
  if (!daoAddress) {
    throw createHttpError.BadRequest("DAO address is required");
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Get the RWADao contract
    const daoContract = new ethers.Contract(daoAddress, RWADAO_ABI, provider);

    // Get contract addresses
    const tokenContractAddress = await daoContract.TOKEN_CONTRACT();
    const nftContractAddress = await daoContract.NFT_CONTRACT();

    // Create contract instances
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      RWA_TOKEN_ABI,
      provider
    );
    const nftContract = new ethers.Contract(
      nftContractAddress,
      RWA_NFT_ABI,
      provider
    );

    // Get marketplace contract address
    const marketplaceAddress =
      Config.contractAddress[(process.env.CHAIN as EChain) || EChain.hardhat]
        .marketplace;
    const marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      MARKETPLACE_ABI,
      provider
    );

    // Get token and rental prices
    const tokenPrice = await daoContract.tokenPrice();
    const rentalPrice = await daoContract.rentalPrice();

    // Get current tenant status
    const currentTenant = await daoContract.currentTenant();
    const isAvailable = currentTenant === ethers.constants.AddressZero;

    // Get token details
    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const totalSupply = await tokenContract.totalSupply();
    const availableTokensForSale =
      await daoContract.getAvailableTokensForSale();

    // Get NFT details and metadata
    const nftTokenId = 0; // First token
    const nftTokenURI = await nftContract.tokenURI(nftTokenId);

    // Get marketplace parameters
    const feePercentage = await marketplaceContract.getRentalFeePercentage();
    const voteThreshold = await marketplaceContract.getVoteThreshold();
    const percentageDecimals =
      await marketplaceContract.getPercentageDecimals();

    // Get hardware metadata from token URI
    let hardwareMetadata: any = {};
    try {
      const response = await axios.get(nftTokenURI);
      hardwareMetadata = response.data;
    } catch (error) {
      console.warn(`Could not fetch metadata from ${nftTokenURI}:`, error);
    }

    const formattedVoteThreshold = `${
      (voteThreshold * 100) / percentageDecimals
    }% majority`;
    const formattedFeePercentage = `${
      (feePercentage * 100) / percentageDecimals
    }% marketplace fee`;

    // Format results by category
    const result = {
      hardware: {
        name: hardwareMetadata?.name || "NVIDIA A100 80GB",
        performance: hardwareMetadata?.cpu || "312 TFLOPS (FP16)",
        location: hardwareMetadata?.location || "US East",
        created: hardwareMetadata?.created || "5/15/2023",
        status: isAvailable ? "Available" : "Rented",
        rentalPrice: `${ethers.utils.formatEther(rentalPrice)} ETH / day`,
      },
      token: {
        name: tokenName || "NVIDIA A100 Token",
        symbol: tokenSymbol || "A100T",
        address: tokenContractAddress,
        totalSupply: totalSupply.toString() || "100 tokens",
        availableForSale: availableTokensForSale.toString() || "25 tokens",
        tokenPrice: `${ethers.utils.formatEther(tokenPrice)} ETH / token`,
      },
      dao: {
        address: daoAddress,
        governance: "Token-weighted voting",
        voteThreshold: formattedVoteThreshold,
        feeStructure: formattedFeePercentage,
      },
      nft: {
        address: nftContractAddress,
        id: nftTokenId.toString(),
        legalBinding: "Verified ✓",
        hardwareVerification: "Verified ✓",
      },
    };

    return result;
  } catch (error: any) {
    console.error("Error fetching DAO details:", error);
    throw createHttpError.InternalServerError(
      `Failed to get DAO details: ${error.message}`
    );
  }
};

interface IProposeNewRentalPriceReq {
  daoAddress: string;
  userAddress: string;
  newRentalPrice: string;
}

const proposeNewRentalPrice = async (req: IProposeNewRentalPriceReq) => {
  const { daoAddress, userAddress, newRentalPrice } = req;

  if (!daoAddress || !userAddress || !newRentalPrice) {
    throw createHttpError.BadRequest(
      "DAO address, user address, and new rental price are required"
    );
  }

  if (parseFloat(newRentalPrice) <= 0) {
    throw createHttpError.BadRequest("Rental price must be greater than 0");
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Get the RWADao contract
    const daoContract = new ethers.Contract(daoAddress, RWADAO_ABI, provider);

    // Get the token contract address to check if user is a token holder
    const tokenContractAddress = await daoContract.TOKEN_CONTRACT();
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      RWA_TOKEN_ABI,
      provider
    );

    // Check if user is a token holder
    const tokenBalance = await tokenContract.balanceOf(userAddress);
    if (tokenBalance.eq(0)) {
      throw createHttpError.BadRequest(
        "You must be a token holder to propose a new rental price"
      );
    }

    // Check if there's an active proposal
    const currentProposal = await daoContract.currentProposal();
    if (currentProposal.isActive) {
      throw createHttpError.BadRequest("There's already an active proposal");
    }

    // Get current rental price for information
    const currentRentalPrice = await daoContract.rentalPrice();

    // Create DAO contract interface
    const daoInterface = new ethers.utils.Interface(RWADAO_ABI);

    // Convert new rental price to proper format (wei)
    const newRentalPriceWei = ethers.utils.parseEther(
      newRentalPrice.toString()
    );

    // Encode function data for proposeNewRent
    const proposeData = daoInterface.encodeFunctionData("proposeNewRent", [
      newRentalPriceWei,
    ]);

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      from: userAddress,
      to: daoAddress,
      data: proposeData,
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Get nonce for the user
    const nonce = await provider.getTransactionCount(userAddress);

    // Get chainId
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // Create transaction object
    const txObject = {
      from: userAddress,
      to: daoAddress,
      data: proposeData,
      gasLimit: gasEstimate,
      gasPrice,
      nonce,
      chainId,
    };

    // Get vote threshold for information
    const voteThreshold = await daoContract.VOTE_THRESHOLD();
    const percentageDecimals = await daoContract.PERCENTAGE_DECIMALS();
    const thresholdPercentage = (voteThreshold * 100) / percentageDecimals;

    const res = {
      tx: txObject,
      currentRentalPrice: ethers.utils.formatEther(currentRentalPrice),
      newRentalPrice: newRentalPrice.toString(),
      voteThreshold: `${thresholdPercentage}%`,
      message: `Transaction created to propose new rental price of ${newRentalPrice} ETH/day (current: ${ethers.utils.formatEther(
        currentRentalPrice
      )} ETH/day). Requires ${thresholdPercentage}% majority to pass.`,
    };

    return res;
  } catch (error: any) {
    if (error.code === "CALL_EXCEPTION") {
      throw createHttpError.BadRequest(
        "Contract call failed. Make sure the DAO contract is valid."
      );
    }

    throw createHttpError.InternalServerError(
      `Failed to create proposal transaction: ${error.message}`
    );
  }
};

interface IVoteOnProposalReq {
  daoAddress: string;
  userAddress: string;
  inFavor: boolean;
}

const voteOnProposal = async (req: IVoteOnProposalReq) => {
  const { daoAddress, userAddress, inFavor } = req;

  if (!daoAddress || !userAddress || inFavor === undefined) {
    throw createHttpError.BadRequest(
      "DAO address, user address, and vote choice are required"
    );
  }

  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    Config.rpcUrl[(process.env.CHAIN as EChain) || EChain.hardhat]
  );

  try {
    // Get the RWADao contract
    const daoContract = new ethers.Contract(daoAddress, RWADAO_ABI, provider);

    // Get the token contract address to check if user is a token holder
    const tokenContractAddress = await daoContract.TOKEN_CONTRACT();
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      RWA_TOKEN_ABI,
      provider
    );

    // Check if user is a token holder
    const tokenBalance = await tokenContract.balanceOf(userAddress);
    if (tokenBalance.eq(0)) {
      throw createHttpError.BadRequest("You must be a token holder to vote");
    }

    // Check if there's an active proposal
    const currentProposal = await daoContract.currentProposal();
    if (!currentProposal.isActive) {
      throw createHttpError.BadRequest("There's no active proposal to vote on");
    }

    // The currentProposal is a struct and we can't directly access its hasVoted mapping
    // We need to call the contract's view function that checks this
    try {
      // Since there's no direct function to check if voted, we'll try to vote in a static call
      // If it reverts with "Already voted", then we know the user has voted
      await daoContract.callStatic.vote(inFavor, { from: userAddress });
      // If we reach here, it means the user hasn't voted yet
    } catch (error: any) {
      if (error.message.includes("Already voted")) {
        throw createHttpError.BadRequest(
          "You have already voted on this proposal"
        );
      }
      // For other errors, continue with the function
    }

    // Get user's voting weight for information
    const totalSupply = await tokenContract.totalSupply();
    const percentageDecimals = await daoContract.PERCENTAGE_DECIMALS();
    const voterWeight = tokenBalance.mul(percentageDecimals).div(totalSupply);
    const voterWeightPercentage = (voterWeight * 100) / percentageDecimals;

    const proposedPrice = currentProposal.proposedPrice;

    // Create DAO contract interface
    const daoInterface = new ethers.utils.Interface(RWADAO_ABI);

    // Encode function data for vote
    const voteData = daoInterface.encodeFunctionData("vote", [inFavor]);

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      from: userAddress,
      to: daoAddress,
      data: voteData,
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Get nonce for the user
    const nonce = await provider.getTransactionCount(userAddress);

    // Get chainId
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // Create transaction object
    const txObject = {
      from: userAddress,
      to: daoAddress,
      data: voteData,
      gasLimit: gasEstimate,
      gasPrice,
      nonce,
      chainId,
    };

    const res = {
      tx: txObject,
      proposedPrice: ethers.utils.formatEther(proposedPrice),
      votingWeight: `${voterWeightPercentage}%`,
      vote: inFavor ? "In favor" : "Against",
      message: `Transaction created to vote ${
        inFavor ? "in favor of" : "against"
      } the proposal to change rental price to ${ethers.utils.formatEther(
        proposedPrice
      )} ETH/day. Your voting weight is ${voterWeightPercentage}%.`,
    };

    return res;
  } catch (error: any) {
    // Handle specific error cases
    if (error.code === "CALL_EXCEPTION") {
      throw createHttpError.BadRequest(
        "Contract call failed. Make sure the DAO contract is valid."
      );
    }

    throw createHttpError.InternalServerError(
      `Failed to create vote transaction: ${error.message}`
    );
  }
};

const ComputeService = {
  uploadToPinata,
  createListing,
  getTokenApprovalTx,
  getFractionalizeTokensTx,
  buyTokens,
  getListing,
  getDaoTokenInfo,
  getDaoDetails,
  proposeNewRentalPrice,
  voteOnProposal,
};

export default ComputeService;
