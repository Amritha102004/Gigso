import apiClient from '../../../api/client';
import { PROFILE_ROUTES } from '../../../constants/apiRoutes';
import type { WorkerProfileResponseDTO } from '../../../types/api.types';

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
    const response = await apiClient.post<ApiResponse>(PROFILE_ROUTES.WORKER_SETUP, data);
    return response.data;
  },

  getWorkerProfile: async () => {
    const response = await apiClient.get<ApiResponse>(PROFILE_ROUTES.WORKER_ME);
    return response.data.data?.profile as WorkerProfileResponseDTO | undefined;
  },
};

export default workerProfileService;
