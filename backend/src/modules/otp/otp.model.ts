import mongoose, { Document, Schema } from "mongoose";

export type OtpType = "registration" | "password-reset";

// Generic record type for the user data cached during registration
export type IOtpUserData = Record<string, any>;

export interface IOtp extends Document {
  email: string;
  hashedOtp: string;
  type: OtpType;
  userData?: IOtpUserData;
  otpExpiresAt: Date;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["registration", "password-reset"],
      required: true,
    },
    userData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index just in case we need fast lookup by email + type
otpSchema.index({ email: 1, type: 1 }, { unique: true });

// TTL index to auto-delete the document after expiresAt passes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);
