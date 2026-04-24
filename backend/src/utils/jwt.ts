import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config";

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, ENV.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
};
