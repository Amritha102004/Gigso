import mongoose, { Schema } from "mongoose";
import type { IGigApplication } from "../interfaces/application.interface";

const gigApplicationSchema: Schema<IGigApplication> = new Schema<IGigApplication>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "GigRole",
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  }
);

// Indexes for common queries and uniqueness constraint
gigApplicationSchema.index({ gigId: 1, roleId: 1 });
gigApplicationSchema.index({ workerId: 1, status: 1 });
gigApplicationSchema.index({ gigId: 1, workerId: 1, roleId: 1 }, { unique: true });

export const GigApplicationModel = mongoose.model<IGigApplication>("GigApplication", gigApplicationSchema);
