import apiClient from '../../../api/client';
import { AUTH_ROUTES } from '../../../constants/apiRoutes';
import type {
  AuthResponse,
  SignupOtpResponse,
  VerifyOtpResponse,
  UserDTO,
} from '../../../types/api.types';

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

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const authService = {
  sendOtp: async (data: SignupPayload): Promise<SignupOtpResponse> => {
    const response = await apiClient.post<ApiResponse<unknown>>(AUTH_ROUTES.SIGNUP, data);
    return { message: response.data.message };
  },

  verifyOtp: async (data: OtpPayload): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<ApiResponse<{ user?: UserDTO }>>(AUTH_ROUTES.VERIFY_OTP, data);
    return { message: response.data.message, user: response.data.data?.user };
  },

  resendOtp: async (data: ResendOtpPayload): Promise<SignupOtpResponse> => {
    const response = await apiClient.post<ApiResponse<unknown>>(AUTH_ROUTES.RESEND_OTP, data);
    return { message: response.data.message };
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<{ user: UserDTO; accessToken: string }>>(AUTH_ROUTES.LOGIN, data);
    return { message: response.data.message, ...response.data.data! };
  },

  googleLogin: async (data: GoogleLoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<{ user: UserDTO; accessToken: string; requiresRole?: boolean }>>(AUTH_ROUTES.GOOGLE_LOGIN, data);
    return { message: response.data.message, ...response.data.data! };
  },

  forgotPassword: async (data: ForgotPasswordPayload): Promise<SignupOtpResponse> => {
    const response = await apiClient.post<ApiResponse<unknown>>(AUTH_ROUTES.FORGOT_PASSWORD, data);
    return { message: response.data.message };
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<SignupOtpResponse> => {
    const response = await apiClient.post<ApiResponse<unknown>>(AUTH_ROUTES.RESET_PASSWORD, data);
    return { message: response.data.message };
  },

  changePassword: async (data: ChangePasswordPayload): Promise<SignupOtpResponse> => {
    const response = await apiClient.post<ApiResponse<unknown>>(AUTH_ROUTES.CHANGE_PASSWORD, data);
    return { message: response.data.message };
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>('/auth/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },
};

export default authService;
