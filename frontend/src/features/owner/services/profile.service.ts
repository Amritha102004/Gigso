import apiClient from '../../../api/client';
import { PROFILE_ROUTES } from '../../../constants/apiRoutes';
import type { OwnerProfileResponseDTO } from '../../../types/api.types';

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
    const response = await apiClient.post<ApiResponse>(PROFILE_ROUTES.OWNER_SETUP, data);
    return response.data;
  },

  getOwnerProfile: async () => {
    const response = await apiClient.get<ApiResponse>(PROFILE_ROUTES.OWNER_ME);
    return response.data.data?.profile as OwnerProfileResponseDTO | undefined;
  },
};

export default ownerProfileService;
