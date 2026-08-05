import mongoose, { Schema } from "mongoose";
import type { IWorkerPayment } from "../interfaces/workerPayment.interface";

const workerPaymentSchema = new Schema<IWorkerPayment>(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "GigRole",
      required: true,
    },
    basePay: {
      type: Number,
      required: true,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    totalPay: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

workerPaymentSchema.index({ paymentId: 1, workerId: 1 }, { unique: true });

export const WorkerPaymentModel = mongoose.model<IWorkerPayment>(
  "WorkerPayment",
  workerPaymentSchema
);
