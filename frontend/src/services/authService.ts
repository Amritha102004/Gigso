import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export const authService = {
  sendOtp: async (data: any) => {
    const response = await authApi.post('/auth/signup', data);
    return response.data;
  },

  verifyOtp: async (data: any) => {
    const response = await authApi.post('/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (data: any) => {
    const response = await authApi.post('/auth/resend-otp', data);
    return response.data;
  },

  login: async (data: any) => {
    const response = await authApi.post('/auth/login', data);
    return response.data;
  },

  forgotPassword: async (data: any) => {
    const response = await authApi.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await authApi.post('/auth/reset-password', data);
    return response.data;
  },
};

export default authService;
