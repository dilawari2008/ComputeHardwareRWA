import LOGGER from "@/common/logger";
import ComputeService from "@/services/compute";
import { Request, Response } from "express";
const uploadToPinata = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await ComputeService.uploadToPinata(file);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in uploadToPinata controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const createListing = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.createListing(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in createListing controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getTokenApprovalTx = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getTokenApprovalTx(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getTokenApprovalTx controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getFractionalizeTokensTx = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getFractionalizeTokensTx(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getFractionalizeTokensTx controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const ComputeController = {
  uploadToPinata,
  createListing,
  getTokenApprovalTx,
  getFractionalizeTokensTx,
};

export default ComputeController;
