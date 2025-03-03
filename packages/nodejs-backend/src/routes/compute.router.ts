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

export default ComputeRouter;
