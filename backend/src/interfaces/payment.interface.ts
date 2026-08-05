import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  gigId: Types.ObjectId;
  ownerId: Types.ObjectId;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  transactionId: string;
  paymentMethod: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
