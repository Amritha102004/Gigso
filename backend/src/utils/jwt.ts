import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env.config";

export interface IJwtService {
  generateAccessToken(userId: string, role: string): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(token: string): unknown;
  verifyRefreshToken(token: string): unknown;
}

export class JwtService implements IJwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;

  constructor() {
    this.accessSecret = ENV.JWT_SECRET;
    this.refreshSecret = ENV.JWT_REFRESH_SECRET;
    this.accessExpiry = ENV.JWT_ACCESS_EXPIRY;
    this.refreshExpiry = ENV.JWT_REFRESH_EXPIRY;
  }

  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.accessSecret, {
      expiresIn: this.accessExpiry,
    } as SignOptions);
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    } as SignOptions);
  }

  verifyAccessToken(token: string): unknown {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): unknown {
    return jwt.verify(token, this.refreshSecret);
  }
}

export const jwtService = new JwtService();
