import mongoose, { Schema } from "mongoose";
import { IAdminProfile } from "../interfaces/user.interface";

const adminProfileSchema: Schema<IAdminProfile> =
  new Schema<IAdminProfile>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      permissions: {
        type: [String],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

export const AdminProfileModel = mongoose.model<IAdminProfile>(
  "AdminProfile",
  adminProfileSchema
);