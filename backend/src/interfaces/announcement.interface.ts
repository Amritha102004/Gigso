import type { Document, Types } from "mongoose";

export interface IGigAnnouncement extends Document {
  gigId: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
