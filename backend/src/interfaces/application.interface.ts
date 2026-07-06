import type { Document, Types } from "mongoose";

export interface IGigApplication extends Document {
  gigId: Types.ObjectId;
  roleId: Types.ObjectId;
  workerId: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  appliedAt: Date;
}
