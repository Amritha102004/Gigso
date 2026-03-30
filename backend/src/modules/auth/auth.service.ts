import { IAuthRepository } from "./auth.repository";
import { IOtpRepository } from "../otp/otp.repository";
import { ICreateUser, IUser } from "../../interfaces/user.interface";
import { hashPassword, comparePasswords, hashOtp, compareOtp } from "../../utils/hash";
import { generateOtp } from "../../utils/otp";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";

export interface IAuthService {
  sendRegistrationOtp(userData: ICreateUser): Promise<void>;
  verifyRegistrationOtp(email: string, otp: string): Promise<IUser>;
  login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
  refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
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
    
    // Hash password before saving to OTP temporary storage
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

    // Mock sending email
    console.log(`[MOCK EMAIL] Registration OTP for ${userData.email} is: ${otp}`);
  }

  async verifyRegistrationOtp(email: string, otp: string): Promise<IUser> {
    const otpDoc = await this.otpRepo.findOtpByEmailAndType(email, "registration");
    
    if (!otpDoc) {
      throw new Error("OTP not found or expired");
    }

    const isValid = await compareOtp(otp, otpDoc.hashedOtp);
    if (!isValid) {
      throw new Error("Invalid OTP");
    }

    if (!otpDoc.userData) {
      throw new Error("User data not found in OTP record");
    }

    // Create user (password is already hashed)
    const user = await this.authRepo.createUser(otpDoc.userData as ICreateUser);

    // Delete OTP
    await this.otpRepo.deleteOtp(email, "registration");

    return user;
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
      // Don't throw error to prevent email enumeration, but in this case we can log or just return
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

    // Mock sending email
    console.log(`[MOCK EMAIL] Password Reset OTP for ${email} is: ${otp}`);
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

    // Delete OTP
    await this.otpRepo.deleteOtp(email, "password-reset");
  }
}
