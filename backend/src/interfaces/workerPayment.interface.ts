import { Document, Types } from "mongoose";

export interface IWorkerPayment extends Document {
  paymentId: Types.ObjectId;
  workerId: Types.ObjectId;
  roleId: Types.ObjectId;
  basePay: number;
  bonus: number;
  totalPay: number;
  paymentStatus: "pending" | "paid";
  createdAt: Date;
  updatedAt: Date;
}
