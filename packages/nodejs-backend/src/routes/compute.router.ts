import { forwardRequest } from "@/common";
import ComputeController from "@/controllers/compute";

import { Router } from "express";

const ComputeRouter = Router({ mergeParams: true });

ComputeRouter.put("/profile", forwardRequest(ComputeController.updateProfile));

export default ComputeRouter;
