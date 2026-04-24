import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "access_secret_dev",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_secret_dev",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL || "",
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD || "",
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
};
