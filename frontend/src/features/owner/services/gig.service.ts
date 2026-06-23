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

export interface CreateGigPayload {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  eventDate: string;
  startTime: string;
  roles: {
    roleName: string;
    spots: number;
    payPerPerson: number;
  }[];
  status?: 'draft' | 'active';
}

export interface UpdateGigPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  location?: string;
  eventDate?: string;
  startTime?: string;
  roles?: {
    roleName: string;
    spots: number;
    payPerPerson: number;
  }[];
}

export const gigService = {
  createGig: async (data: CreateGigPayload) => {
    const response = await gigApi.post<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIGS, data);
    return response.data;
  },

  getMyGigs: async (status?: string) => {
    const url = status ? `${GIG_ROUTES.OWNER_GIGS}?status=${status}` : GIG_ROUTES.OWNER_GIGS;
    const response = await gigApi.get<ApiResponse<GigListItemDTO[]>>(url);
    return response.data;
  },

  getGigById: async (id: string) => {
    const response = await gigApi.get<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_BY_ID(id));
    return response.data;
  },

  updateGig: async (id: string, data: UpdateGigPayload) => {
    const response = await gigApi.put<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_BY_ID(id), data);
    return response.data;
  },

  deleteGig: async (id: string) => {
    const response = await gigApi.delete<ApiResponse>(GIG_ROUTES.OWNER_GIG_BY_ID(id));
    return response.data;
  },

  publishGig: async (id: string) => {
    const response = await gigApi.patch<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_PUBLISH(id));
    return response.data;
  },

  markAsCompleted: async (id: string) => {
    const response = await gigApi.patch<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_COMPLETE(id));
    return response.data;
  },

  getCategories: async () => {
    const response = await gigApi.get<ApiResponse<CategoryDTO[]>>(GIG_ROUTES.CATEGORIES);
    return response.data;
  },
};

export default gigService;
