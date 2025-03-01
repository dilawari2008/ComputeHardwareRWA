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
    console.error("Error in uploadToPinata controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const ComputeController = {
  uploadToPinata,
};

export default ComputeController;
