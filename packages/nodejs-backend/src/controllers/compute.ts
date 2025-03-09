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

const buyTokens = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.buyTokens(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in buyTokens controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getListing = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getListing();

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getListing controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getDaoTokenInfo = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getDaoTokenInfo(
      req?.query?.daoAddress as string
    );

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getDaoTokenInfo controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getDaoDetails = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getDaoDetails(
      req?.query?.daoAddress as string
    );

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getDaoDetails controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const proposeNewRentalPrice = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.proposeNewRentalPrice(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in proposeNewRentalPrice controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const voteOnProposal = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.voteOnProposal(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in voteOnProposal controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getCurrentProposal = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getCurrentProposal(req.body.daoAddress);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getCurrentProposal controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const becomeTenant = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.becomeTenant(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in becomeTenant controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getDaoBalance = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.getDaoBalance(req.body.daoAddress);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in getDaoBalance controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const isDAOMember = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.isDAOMember(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in isDAOMember controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const isTenant = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.isTenant(req.body);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in isTenant controller:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const isMarketplaceOwner = async (req: Request, res: Response) => {
  try {
    const result = await ComputeService.isMarketplaceOwner(req.body?.userAddress);

    res.sendFormatted(result);
  } catch (error) {
    LOGGER.error("Error in isMarketplaceOwner controller:", error);
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
  buyTokens,
  getListing,
  getDaoTokenInfo,
  getDaoDetails,
  proposeNewRentalPrice,
  voteOnProposal,
  getCurrentProposal,
  becomeTenant,
  getDaoBalance,
  isDAOMember,
  isTenant,
  isMarketplaceOwner,
};

export default ComputeController;
