import type {
  RegisterUserRequestDTO,
  LoginUserRequestDTO,
  UserResponseDTO,
} from "../../../dtos/user.dto";

export interface IAuthService {
  sendRegistrationOtp(userData: RegisterUserRequestDTO): Promise<void>;
  verifyOtp(email: string, otp: string, type: "registration" | "password-reset"): Promise<UserResponseDTO | void>;
  resendOtp(email: string, type: "registration" | "password-reset"): Promise<void>;
  login(loginData: LoginUserRequestDTO): Promise<{ user: UserResponseDTO; accessToken: string; refreshToken: string }>;
  refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
  googleLogin(token: string, role?: string): Promise<{ user: UserResponseDTO; accessToken: string; refreshToken: string }>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}
