import axios from 'axios';
import { AUTH_ROUTES } from '../constants/apiRoutes';
import type {
  AuthResponse,
  SignupOtpResponse,
  VerifyOtpResponse,
} from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpPayload {
  email: string;
  otp: string;
  type: 'registration' | 'password-reset';
}

export interface ResendOtpPayload {
  email: string;
  type: 'registration' | 'password-reset';
}

export interface GoogleLoginPayload {
  token: string;
  role?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const authService = {
  sendOtp: async (data: SignupPayload): Promise<SignupOtpResponse> => {
    const response = await authApi.post<SignupOtpResponse>(AUTH_ROUTES.SIGNUP, data);
    return response.data;
  },

  verifyOtp: async (data: OtpPayload): Promise<VerifyOtpResponse> => {
    const response = await authApi.post<VerifyOtpResponse>(AUTH_ROUTES.VERIFY_OTP, data);
    return response.data;
  },

  resendOtp: async (data: ResendOtpPayload): Promise<SignupOtpResponse> => {
    const response = await authApi.post<SignupOtpResponse>(AUTH_ROUTES.RESEND_OTP, data);
    return response.data;
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>(AUTH_ROUTES.LOGIN, data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginPayload): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>(AUTH_ROUTES.GOOGLE_LOGIN, data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordPayload): Promise<SignupOtpResponse> => {
    const response = await authApi.post<SignupOtpResponse>(AUTH_ROUTES.FORGOT_PASSWORD, data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<SignupOtpResponse> => {
    const response = await authApi.post<SignupOtpResponse>(AUTH_ROUTES.RESET_PASSWORD, data);
    return response.data;
  },
};

export default authService;
