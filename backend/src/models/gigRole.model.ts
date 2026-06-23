import mongoose, { Schema } from "mongoose";
import { IGigRole } from "../interfaces/gig.interface";

const gigRoleSchema: Schema<IGigRole> = new Schema<IGigRole>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    roleName: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    spots: {
      type: Number,
      required: [true, "Number of spots is required"],
      min: [1, "Spots must be at least 1"],
    },
    payPerPerson: {
      type: Number,
      required: [true, "Pay per person is required"],
      min: [0, "Pay cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

export const GigRoleModel = mongoose.model<IGigRole>("GigRole", gigRoleSchema);
