import DB from "@/db/db";
import { Schema } from "mongoose";

interface ICPUMetric {
  daoAddress: string;
  cpuUtilization: { percentage: number; timestamp: Date }[];
}

const cpuMetricSchema: Schema = new Schema<ICPUMetric>(
  {
    daoAddress: { type: String, required: true },
    cpuUtilization: {
      type: [
        { percentage: { type: Number, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const CPUMetric = DB.model<ICPUMetric>("CPUMetric", cpuMetricSchema);
