import { IAuthRepository } from "./auth.repository";
import { IOtpRepository } from "../otp/otp.repository";
import { ICreateUser, IUser } from "../../interfaces/user.interface";
import { hashPassword, comparePasswords, hashOtp, compareOtp } from "../../utils/hash";
import { generateOtp } from "../../utils/otp";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface IAuthService {
  sendRegistrationOtp(userData: ICreateUser): Promise<void>;
  verifyOtp(email: string, otp: string, type: "registration" | "password-reset"): Promise<IUser | void>;
  resendOtp(email: string, type: "registration" | "password-reset"): Promise<void>;
  login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
  refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
  googleLogin(token: string, role?: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
}

export class AuthService implements IAuthService {
  private readonly OTP_EXPIRY_MINUTES = 5;

  constructor(
    private authRepo: IAuthRepository,
    private otpRepo: IOtpRepository
  ) {}

  async sendRegistrationOtp(userData: ICreateUser): Promise<void> {
    const existingUser = await this.authRepo.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    
    const hashedPassword = await hashPassword(userData.password);
    const temporaryUserData = { ...userData, password: hashedPassword };

    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

    await this.otpRepo.upsertOtp(
      userData.email,
      hashedOtp,
      "registration",
      expiresAt,
      temporaryUserData
    );

    // console
    console.log(`MOCK EMAIL Registration OTP for ${userData.email} is: ${otp}`);
  }

  async verifyOtp(email: string, otp: string, type: "registration" | "password-reset"): Promise<IUser | void> {
    const otpDoc = await this.otpRepo.findOtpByEmailAndType(email, type);
    
    if (!otpDoc) {
      throw new Error("OTP not found or expired");
    }

    const isValid = await compareOtp(otp, otpDoc.hashedOtp);
    if (!isValid) {
      throw new Error("Invalid OTP");
    }

    if (type === "registration") {
      if (!otpDoc.userData) {
        throw new Error("User data not found in OTP record");
      }
      
      const user = await this.authRepo.createUser(otpDoc.userData as ICreateUser);
      
      await this.otpRepo.deleteOtp(email, "registration");
      return user;
    }

    if (type === "password-reset") {
      
      return;
    }
  }

  async resendOtp(email: string, type: "registration" | "password-reset"): Promise<void> {
    const existingOtp = await this.otpRepo.findOtpByEmailAndType(email, type);
    
    if (!existingOtp) {
      throw new Error(`No pending ${type} request found for this email.`);
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

    await this.otpRepo.upsertOtp(
      email,
      hashedOtp,
      type,
      expiresAt,
      existingOtp.userData
    );

    // console
    console.log(`MOCK EMAIL Resent ${type} OTP for ${email} is: ${otp}`);
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.authRepo.findUserByEmail(email);
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
  }

  async googleLogin(token: string, role?: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    const { email, name } = payload;
    let user = await this.authRepo.findUserByEmail(email);

    if (!user) {
      if (!role) {
        throw new Error("Role must be selected before Google login.");
      }

      // Create new user with fallback credentials
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      const newUserData: ICreateUser = {
        name: name || "Google User",
        email: email,
        password: hashedPassword,
        role: role as "worker" | "owner" | "admin",
      };

      user = await this.authRepo.createUser(newUserData);
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(token) as { userId: string };
      const user = await this.authRepo.findUserById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      const newAccessToken = generateAccessToken(user._id.toString(), user.role);
      const newRefreshToken = generateRefreshToken(user._id.toString());

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      return; 
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

    await this.otpRepo.upsertOtp(
      email,
      hashedOtp,
      "password-reset",
      expiresAt
    );

    // console
    console.log(`MOCK EMAIL Password Reset OTP for ${email} is: ${otp}`);
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const otpDoc = await this.otpRepo.findOtpByEmailAndType(email, "password-reset");
    
    if (!otpDoc) {
      throw new Error("OTP not found or expired");
    }

    const isValid = await compareOtp(otp, otpDoc.hashedOtp);
    if (!isValid) {
      throw new Error("Invalid OTP");
    }

    const hashedPassword = await hashPassword(newPassword);
    const user = await this.authRepo.updateUserPassword(email, hashedPassword);

    if (!user) {
      throw new Error("User not found");
    }

    await this.otpRepo.deleteOtp(email, "password-reset");
  }
}
