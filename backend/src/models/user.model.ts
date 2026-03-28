import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["worker", "owner", "admin"],
      required: true,
    },

    phone: {
      type: String,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    isProfileCompleted: {
        type: Boolean,
        default: false
    }
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);