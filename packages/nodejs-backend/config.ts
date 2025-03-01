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
};

export default Config;
