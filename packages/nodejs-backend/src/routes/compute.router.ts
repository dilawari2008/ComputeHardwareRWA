import { forwardRequest, upload } from "@/common";
import ComputeController from "@/controllers/compute";

import { Router } from "express";

const ComputeRouter = Router({ mergeParams: true });

ComputeRouter.post(
  "/upload-to-pinata",
  // @ts-ignore
  upload.single("file"),
  forwardRequest(ComputeController.uploadToPinata)
);

ComputeRouter.post(
  "/create-listing",
  forwardRequest(ComputeController.createListing)
);

ComputeRouter.post(
  "/get-token-approval-tx",
  forwardRequest(ComputeController.getTokenApprovalTx)
);

ComputeRouter.post(
  "/get-fractionalize-tokens-tx",
  forwardRequest(ComputeController.getFractionalizeTokensTx)
);

ComputeRouter.post("/buy-tokens", forwardRequest(ComputeController.buyTokens));

ComputeRouter.get("/listing", forwardRequest(ComputeController.getListing));

ComputeRouter.get(
  "/dao-token-info",
  forwardRequest(ComputeController.getDaoTokenInfo)
);

ComputeRouter.get(
  "/dao-details",
  forwardRequest(ComputeController.getDaoDetails)
);

ComputeRouter.post(
  "/propose-new-rental-price",
  forwardRequest(ComputeController.proposeNewRentalPrice)
);

ComputeRouter.post(
  "/vote-on-proposal",
  forwardRequest(ComputeController.voteOnProposal)
);

ComputeRouter.post(
  "/current-proposal",
  forwardRequest(ComputeController.getCurrentProposal)
);

ComputeRouter.post(
  "/become-tenant",
  forwardRequest(ComputeController.becomeTenant)
);

ComputeRouter.post(
  "/dao-balance",
  forwardRequest(ComputeController.getDaoBalance)
);

ComputeRouter.post(
  "/is-dao-member",
  forwardRequest(ComputeController.isDAOMember)
);

ComputeRouter.post("/is-tenant", forwardRequest(ComputeController.isTenant));

ComputeRouter.post(
  "/is-marketplace-owner",
  forwardRequest(ComputeController.isMarketplaceOwner)
);

export default ComputeRouter;
