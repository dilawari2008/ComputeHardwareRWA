import DB from "@/db/db";
import { IDeployment, IUser } from "@/interfaces/model";
import { Schema, Types } from "mongoose";

const deploymentSchema: Schema = new Schema<IDeployment>(
  {
    userAddress: { type: String, required: true },
    daoAddress: { type: String, required: true },
    script: { type: String, required: true },
    instanceId: { type: String, required: false },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const Deployment = DB.model<IDeployment>("Deployment", deploymentSchema);
