import { config } from "dotenv";
import EChain from "@/common/chain.enum";
config({ path: ".env.dev" });

const Config = {
  db: {
    mongo: {
      url: process.env.MONGO_URL || "",
    },
  },
  environment: process.env.ENVIRONMENT || "",
  jwtSecret: process.env.JWT_SECRET || "",
  rpcUrl: {
    [EChain.hardhat]: "http://127.0.0.1:8545",
    [EChain.scrollSepolia]: "https://sepolia-rpc.scroll.io",
  },
  contractAddress: {
    [EChain.hardhat]: {
      marketplace: process.env.MARKETPLACE_ADDRESS_HARDHAT || "",
    },
    [EChain.scrollSepolia]: {
      marketplace: process.env.MARKETPLACE_ADDRESS_SCROLL_SEPOLIA || "",
    },
  },
  pinata: {
    pinataUrl: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    apiKey: process.env.PINATA_API_KEY || "",
    apiSecret: process.env.PINATA_API_SECRET || "",
    jwt: process.env.PINATA_JWT || "",
    gateway: process.env.PINATA_GATEWAY || "",
  },
};

export default Config;
