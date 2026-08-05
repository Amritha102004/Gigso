import mongoose, { Schema } from "mongoose";
import type { IPayment } from "../interfaces/payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ ownerId: 1 });
paymentSchema.index({ gigId: 1 });
paymentSchema.index({ transactionId: 1 });

export const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);
