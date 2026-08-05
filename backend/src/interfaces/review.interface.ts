import { Document, Types } from "mongoose";

export interface IReview extends Document {
  gigId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  reviewedUserId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
