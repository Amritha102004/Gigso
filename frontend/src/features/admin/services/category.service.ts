import apiClient from '../../../api/client';
import { ADMIN_ROUTES } from '../../../constants/apiRoutes';
import type { PaginatedCategoriesResponse, CategoryDTO } from '../../../types/api.types';

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
    const response = await apiClient.get<ApiResponse<PaginatedCategoriesResponse>>(ADMIN_ROUTES.CATEGORIES, { params });
    return response.data.data!;
  },

  getCategoryById: async (id: string): Promise<CategoryDTO> => {
    const response = await apiClient.get<ApiResponse<{ category: CategoryDTO }>>(ADMIN_ROUTES.CATEGORY_BY_ID(id));
    return response.data.data!.category;
  },

  createCategory: async (payload: { name: string; description: string; icon: string }): Promise<CategoryDTO> => {
    const response = await apiClient.post<ApiResponse<{ category: CategoryDTO }>>(ADMIN_ROUTES.CATEGORIES, payload);
    return response.data.data!.category;
  },

  updateCategory: async (id: string, payload: Partial<{ name: string; description: string; icon: string }>): Promise<CategoryDTO> => {
    const response = await apiClient.put<ApiResponse<{ category: CategoryDTO }>>(ADMIN_ROUTES.CATEGORY_BY_ID(id), payload);
    return response.data.data!.category;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<any>>(ADMIN_ROUTES.CATEGORY_BY_ID(id));
  },
};

export default categoryService;
