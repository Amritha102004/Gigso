import mongoose, { Schema } from "mongoose";
import { IGig } from "../interfaces/gig.interface";

const gigSchema: Schema<IGig> = new Schema<IGig>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Gig title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Gig description is required"],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "GigRole",
      },
    ],
    totalBudget: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled", "paid"],
      default: "draft",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
gigSchema.index({ ownerId: 1, isDeleted: 1 });
gigSchema.index({ status: 1, isDeleted: 1 });

export const GigModel = mongoose.model<IGig>("Gig", gigSchema);
