import axios from 'axios';
import { PROFILE_ROUTES } from '../../../constants/apiRoutes';
import type { OwnerProfileResponseDTO } from '../../../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const profileApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

profileApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export interface OwnerProfilePayload {
  name: string;
  phone?: string;
  profileImage?: string;
  businessName: string;
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  location: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const ownerProfileService = {
  setupOwnerProfile: async (data: OwnerProfilePayload) => {
    const response = await profileApi.post<ApiResponse>(PROFILE_ROUTES.OWNER_SETUP, data);
    return response.data;
  },

  getOwnerProfile: async () => {
    const response = await profileApi.get<ApiResponse>(PROFILE_ROUTES.OWNER_ME);
    return response.data.data?.profile as OwnerProfileResponseDTO | undefined;
  },
};

export default ownerProfileService;
