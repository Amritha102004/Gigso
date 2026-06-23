import axios from 'axios';
import { PROFILE_ROUTES } from '../../../constants/apiRoutes';
import type { WorkerProfileResponseDTO } from '../../../types/api.types';

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

export interface WorkerProfilePayload {
  name: string;
  phone?: string;
  profileImage?: string;
  skills: string[];
  portfolio?: string[];
  age: number;
  bio: string;
  location: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const workerProfileService = {
  setupWorkerProfile: async (data: WorkerProfilePayload) => {
    const response = await profileApi.post<ApiResponse>(PROFILE_ROUTES.WORKER_SETUP, data);
    return response.data;
  },

  getWorkerProfile: async () => {
    const response = await profileApi.get<ApiResponse>(PROFILE_ROUTES.WORKER_ME);
    return response.data.data?.profile as WorkerProfileResponseDTO | undefined;
  },
};

export default workerProfileService;
