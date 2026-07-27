import apiClient from '../../../api/client';
import { GIG_ROUTES } from '../../../constants/apiRoutes';
import type { GigResponseDTO, GigListItemDTO, CategoryDTO, GigApplicationDTO } from '../../../types/api.types';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface BrowseGigsFilters {
  search?: string;
  category?: string;
  location?: string;
  minPay?: number;
  date?: string;
}

export const workerGigService = {
  browseGigs: async (filters?: BrowseGigsFilters) => {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.minPay !== undefined && filters.minPay > 0) params.minPay = filters.minPay;
      if (filters.date) params.date = filters.date;
    }

    const response = await apiClient.get<ApiResponse<GigListItemDTO[]>>(GIG_ROUTES.WORKER_GIGS, { params });
    return response.data;
  },

  getGigById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<GigResponseDTO>>(GIG_ROUTES.WORKER_GIG_BY_ID(id));
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(`${GIG_ROUTES.WORKER_GIGS}/categories`);
    return response.data;
  },

  applyForGigRole: async (gigId: string, roleId: string) => {
    const response = await apiClient.post<ApiResponse<GigApplicationDTO>>(GIG_ROUTES.WORKER_GIG_APPLY(gigId), { roleId });
    return response.data;
  },

  getWorkerApplications: async (status?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const response = await apiClient.get<ApiResponse<GigApplicationDTO[]>>(GIG_ROUTES.WORKER_MY_GIGS, { params });
    return response.data;
  },

  withdrawApplication: async (applicationId: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`${GIG_ROUTES.WORKER_MY_GIGS}/${applicationId}`);
    return response.data;
  },
};

export default workerGigService;
