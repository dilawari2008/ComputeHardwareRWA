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

const convertMulterFileToFile = (multerFile: Express.Multer.File) => {
  LOGGER.info(
    `Converting multer file to regular file: ${multerFile.originalname}`
  );
  const fileBuffer = fs.readFileSync(multerFile.path);
  LOGGER.info(`Read file buffer for ${multerFile.originalname}`);
  const blob = new Blob([fileBuffer], { type: multerFile.mimetype });
  LOGGER.info(`Created blob for ${multerFile.originalname}`);

  return blob;
};

const uploadToPinata = async (file: Express.Multer.File) => {
  try {
    // Upload to Pinata
    // @ts-ignore
    const result = await pinata.upload.file(convertMulterFileToFile(file));

    // Clean up - delete temp file after upload
    fs.unlinkSync(file.path);

    // Return the IPFS hash and gateway URL
    return {
      pinataUrl: `https://${Config.pinata.gateway}/ipfs/${result.cid}`,
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
