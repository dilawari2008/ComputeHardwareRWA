import Environments from "@/common/constants/environments";
import { config } from "dotenv";

config({ path: ".env.dev" });

const Config = {
  db: {
    mongo: {
      url: process.env.MONGO_URL || "",
    },
  },
  jwtSecret: process.env.JWT_SECRET || "",
  environment: process.env.ENV || Environments.development,
  rpcUrl: {
    hardhat: "http://127.0.0.1:8545",
    scrollSepolia: "https://sepolia-rpc.scroll.io",
  },
  contractAddress: {
    hardhat: {
      marketplace: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    },
    scrollSepolia: {
      marketplace: "",
    },
  },
  pinata: {
    apiKey: process.env.PINATA_API_KEY || "",
    apiSecret: process.env.PINATA_API_SECRET || "",
    jwt: process.env.PINATA_JWT || "",
    gateway: process.env.PINATA_GATEWAY || "",
  },
};

export default Config;
