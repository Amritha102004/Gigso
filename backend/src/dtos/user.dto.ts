import type { UserRole } from "../interfaces/user.interface";

export interface UserResponseDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  isApproved: boolean;
  isSuspended: boolean;
  isProfileCompleted: boolean;
  stripeAccountId?: string;
  stripeOnboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterUserRequestDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUserRequestDTO {
  email: string;
  password: string;
}

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
  type: "registration" | "password-reset";
}

export interface ResendOtpRequestDTO {
  email: string;
  type: "registration" | "password-reset";
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleLoginRequestDTO {
  credential: string;
  role?: UserRole;
}
