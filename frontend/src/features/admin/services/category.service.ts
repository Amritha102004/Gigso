import axios from 'axios';
import { ADMIN_ROUTES } from '../../../constants/apiRoutes';
import type { PaginatedCategoriesResponse, CategoryDTO } from '../../../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const categoryService = {
  getCategories: async (params?: GetCategoriesParams): Promise<PaginatedCategoriesResponse> => {
    const response = await adminApi.get<ApiResponse<PaginatedCategoriesResponse>>(ADMIN_ROUTES.CATEGORIES, { params });
    return response.data.data!;
  },

  getCategoryById: async (id: string): Promise<CategoryDTO> => {
    const response = await adminApi.get<ApiResponse<{ category: CategoryDTO }>>(ADMIN_ROUTES.CATEGORY_BY_ID(id));
    return response.data.data!.category;
  },

  createCategory: async (payload: { name: string; description: string; icon: string }): Promise<CategoryDTO> => {
    const response = await adminApi.post<ApiResponse<{ category: CategoryDTO }>>(ADMIN_ROUTES.CATEGORIES, payload);
    return response.data.data!.category;
  },

  updateCategory: async (id: string, payload: Partial<{ name: string; description: string; icon: string }>): Promise<CategoryDTO> => {
    const response = await adminApi.put<ApiResponse<{ category: CategoryDTO }>>(ADMIN_ROUTES.CATEGORY_BY_ID(id), payload);
    return response.data.data!.category;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await adminApi.delete<ApiResponse<any>>(ADMIN_ROUTES.CATEGORY_BY_ID(id));
  },
};

export default categoryService;
