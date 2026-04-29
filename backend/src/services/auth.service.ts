import { IUserRepository } from "../interfaces/repositories/user.repository.interface";
import { IOtpRepository } from "../interfaces/repositories/otp.repository.interface";
import { ICreateUser, IUser } from "../interfaces/user.interface";
import { passwordHashService, otpHashService } from "../utils/hash";
import { generateOtp } from "../utils/otp";
import { IEmailService } from "../interfaces/services/email.service.interface";
import { jwtService } from "../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { IAuthService } from "../interfaces/services/auth.service.interface";
import { ENV } from "../config/env.config";
import { MESSAGES } from "../constants/messages";
import { EmailTemplates } from "../constants/email.templates";

const ALLOWED_ROLES: ReadonlyArray<string> = ["worker", "owner"];

export class AuthService implements IAuthService {
  private readonly _OTP_EXPIRY_MINUTES = ENV.OTP_EXPIRY_MINUTES;
  private readonly _googleClient: OAuth2Client;

  constructor(
    private _authRepo: IUserRepository,
    private _otpRepo: IOtpRepository,
    private _emailService: IEmailService,
    private _googleClientId: string
  ) {
    this._googleClient = new OAuth2Client(this._googleClientId);
  }

  async sendRegistrationOtp(userData: ICreateUser): Promise<void> {
    if (!ALLOWED_ROLES.includes(userData.role)) {
      throw new Error(MESSAGES.INVALID_ROLE);
    }

    const existingUser = await this._authRepo.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const otp = generateOtp();
    const hashedOtp = await otpHashService.hash(otp);

    const hashedPassword = await passwordHashService.hash(userData.password);
    const temporaryUserData = { ...userData, password: hashedPassword };

    const expiresAt = new Date(Date.now() + this._OTP_EXPIRY_MINUTES * 60000);

    await this._otpRepo.upsertOtp(
      userData.email,
      hashedOtp,
      "registration",
      expiresAt,
      temporaryUserData
    );

    const { subject, html } = EmailTemplates.otp(otp);
    await this._emailService.sendEmail(userData.email, subject, html);
    // console
    console.log(`Registration OTP for ${userData.email} is: ${otp}`);
  }

  async verifyOtp(email: string, otp: string, type: "registration" | "password-reset"): Promise<IUser | void> {
    const otpDoc = await this._otpRepo.findOtpByEmailAndType(email, type);

    if (!otpDoc) {
      throw new Error(MESSAGES.OTP_EXPIRED);
    }

    const isValid = await otpHashService.compare(otp, otpDoc.hashedOtp);
    if (!isValid) {
      throw new Error(MESSAGES.OTP_INVALID);
    }

    if (type === "registration") {
      if (!otpDoc.userData) {
        throw new Error(MESSAGES.USER_DATA_MISSING);
      }

      const user = await this._authRepo.createUser(otpDoc.userData as ICreateUser);
      await this._otpRepo.deleteOtp(email, "registration");
      return user;
    }

    if (type === "password-reset") {
      return;
    }
  }

  async resendOtp(email: string, type: "registration" | "password-reset"): Promise<void> {
    const existingOtp = await this._otpRepo.findOtpByEmailAndType(email, type);

    if (!existingOtp) {
      throw new Error(MESSAGES.NO_PENDING_OTP);
    }

    const otp = generateOtp();
    const hashedOtp = await otpHashService.hash(otp);
    const expiresAt = new Date(Date.now() + this._OTP_EXPIRY_MINUTES * 60000);

    await this._otpRepo.upsertOtp(email, hashedOtp, type, expiresAt, existingOtp.userData);

    const { subject, html } = EmailTemplates.otp(otp);
    await this._emailService.sendEmail(email, subject, html);
     // console
    console.log(`Resent ${type} OTP for ${email} is: ${otp}`);
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this._authRepo.findUserByEmail(email);

    if (!user) {
      throw new Error(MESSAGES.INVALID_CREDENTIALS);
    }

    const isValidPassword = await passwordHashService.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error(MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.isSuspended) {
      throw new Error(MESSAGES.USER_SUSPENDED);
    }

    const accessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = jwtService.generateRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
  }

  async googleLogin(token: string, role?: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const ticket = await this._googleClient.verifyIdToken({
      idToken: token,
      audience: this._googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    const { email, name } = payload;
    let user = await this._authRepo.findUserByEmail(email);

    if (!user) {
      if (!role) {
        throw new Error(MESSAGES.ROLE_REQUIRED);
      }

      if (!ALLOWED_ROLES.includes(role)) {
        throw new Error(MESSAGES.INVALID_ROLE);
      }

      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await passwordHashService.hash(randomPassword);

      const newUserData: ICreateUser = {
        name: name || "Google User",
        email: email,
        password: hashedPassword,
        role: role as "worker" | "owner",
      };

      user = await this._authRepo.createUser(newUserData);
    }

    if (user.isSuspended) {
      throw new Error(MESSAGES.USER_SUSPENDED);
    }

    const accessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = jwtService.generateRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwtService.verifyRefreshToken(token) as { userId: string };
      const user = await this._authRepo.findById(decoded.userId);

      if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
      const newRefreshToken = jwtService.generateRefreshToken(user._id.toString());

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new Error(MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this._authRepo.findUserByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const otp = generateOtp();
    const hashedOtp = await otpHashService.hash(otp);
    const expiresAt = new Date(Date.now() + this._OTP_EXPIRY_MINUTES * 60000);

    await this._otpRepo.upsertOtp(email, hashedOtp, "password-reset", expiresAt);

    const { subject, html } = EmailTemplates.otp(otp);
    await this._emailService.sendEmail(email, subject, html);
    // console
    console.log(`Password Reset OTP for ${email} is: ${otp}`);
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const otpDoc = await this._otpRepo.findOtpByEmailAndType(email, "password-reset");

    if (!otpDoc) {
      throw new Error(MESSAGES.OTP_EXPIRED);
    }

    const isValid = await otpHashService.compare(otp, otpDoc.hashedOtp);
    if (!isValid) {
      throw new Error(MESSAGES.OTP_INVALID);
    }

    const hashedPassword = await passwordHashService.hash(newPassword);
    const user = await this._authRepo.updateUserPassword(email, hashedPassword);

    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    await this._otpRepo.deleteOtp(email, "password-reset");
  }
}
