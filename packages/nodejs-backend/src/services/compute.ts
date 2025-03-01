import { PinataSDK } from "pinata";
import { HttpStatusCodes } from "@/common/constants";
import LOGGER from "@/common/logger";
import createHttpError from "http-errors";
import axios from "axios";
import { Readable } from "stream";
import FormData from "form-data";
import Config from "@/config";
import fs from "fs";

const pinata = new PinataSDK({
  pinataJwt: Config.pinata.jwt,
  pinataGateway: Config.pinata.gateway,
});

// Fix 1: Use the correct Blob/File format
const convertMulterFileToFile = (multerFile: Express.Multer.File) => {
  const fileBuffer = fs.readFileSync(multerFile.path);
  // Return as a File-like object with the required properties
  return {
    name: multerFile.originalname,
    buffer: fileBuffer,
    size: multerFile.size,
    type: multerFile.mimetype
  };
};

// Fix 2: Use Axios directly for reliable uploads
const uploadToPinata = async (file: Express.Multer.File) => {
  try {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    
    // Append file as a readable stream
    data.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });
    
    const response = await axios.post(url, data, {
      maxContentLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${(data as any)._boundary}`,
        'Authorization': `Bearer ${Config.pinata.jwt}`
      }
    });
    
    // Clean up
    fs.unlinkSync(file.path);
    
    // Return standard gateway URL instead of custom gateway
    return {
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      customGatewayUrl: `https://${Config.pinata.gateway}/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

const ComputeService = {
  uploadToPinata,
};

export default ComputeService;
