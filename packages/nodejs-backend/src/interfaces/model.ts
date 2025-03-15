import { Types } from "mongoose";
import { Document } from "mongodb";

export interface IUserObj {
  userId: Types.ObjectId;
  code?: string;
}

export interface IMongooseDocument extends Document {
  deleted?: boolean;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IUser extends IMongooseDocument {
  name?: string;
  email: string;
  hash: string;
  salt: string;
}

export interface IDeployment extends IMongooseDocument {
  userAddress: string;
  daoAddress: string;
  script: string;
  instanceId?: string;
}
