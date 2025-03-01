import ComputeService from "@/services/compute";
import { Request, Response } from "express";

const updateProfile = async (req: Request, res: Response) => {
  const { query, body } = req;

  res.sendFormatted("Hello");
};

const ComputeController = {
  updateProfile,
};

export default ComputeController;
