import mongoose, { Schema } from "mongoose";
import { IOwnerProfile } from "../interfaces/user.interface";

const ownerProfileSchema: Schema<IOwnerProfile> =
  new Schema<IOwnerProfile>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      businessName: String,
      industry: String,
      companySize: String,
      website: String,
      description: String,
      location: String,
    },
    {
      timestamps: true,
    }
  );

export const OwnerProfileModel = mongoose.model<IOwnerProfile>(
  "OwnerProfile",
  ownerProfileSchema
);