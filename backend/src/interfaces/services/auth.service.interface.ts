import { ICreateUser, IUser } from "../../interfaces/user.interface";

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
