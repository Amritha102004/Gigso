import axios from 'axios';
import { GIG_ROUTES } from '../../../constants/apiRoutes';
import type { GigResponseDTO, GigListItemDTO, CategoryDTO } from '../../../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const gigApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

gigApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

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

    const response = await gigApi.get<ApiResponse<GigListItemDTO[]>>(GIG_ROUTES.WORKER_GIGS, { params });
    return response.data;
  },

  getGigById: async (id: string) => {
    const response = await gigApi.get<ApiResponse<GigResponseDTO>>(GIG_ROUTES.WORKER_GIG_BY_ID(id));
    return response.data;
  },

  getCategories: async () => {
    const response = await gigApi.get<ApiResponse<CategoryDTO[]>>(`${GIG_ROUTES.WORKER_GIGS}/categories`);
    return response.data;
  },
};

export default workerGigService;
