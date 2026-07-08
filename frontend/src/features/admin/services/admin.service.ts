import axios from 'axios';
import { ADMIN_ROUTES } from '../../../constants/apiRoutes';
import type { PaginatedUsersResponse, UserDTO } from '../../../types/api.types';

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

export interface GetUsersParams {
  role?: 'owner' | 'worker';
  page?: number;
  limit?: number;
  search?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const adminService = {
  getUsers: async (params: GetUsersParams): Promise<PaginatedUsersResponse> => {
    const response = await adminApi.get<ApiResponse<PaginatedUsersResponse>>(ADMIN_ROUTES.USERS, { params });
    return response.data.data!;
  },

  getUsersByRole: async (role: 'owner' | 'worker', params?: Omit<GetUsersParams, 'role'>): Promise<PaginatedUsersResponse> => {
    const response = await adminApi.get<ApiResponse<PaginatedUsersResponse>>(ADMIN_ROUTES.USERS, {
      params: { role, ...params },
    });
    return response.data.data!;
  },

  approveUser: async (userId: string): Promise<{ message: string; user: UserDTO }> => {
    const response = await adminApi.patch<ApiResponse<{ user: UserDTO }>>(ADMIN_ROUTES.APPROVE_USER(userId));
    return { message: response.data.message, user: response.data.data!.user };
  },

  suspendUser: async (userId: string): Promise<{ message: string; user: UserDTO }> => {
    const response = await adminApi.patch<ApiResponse<{ user: UserDTO }>>(ADMIN_ROUTES.SUSPEND_USER(userId));
    return { message: response.data.message, user: response.data.data!.user };
  },

  getGigs: async (params?: {
    search?: string;
    categoryId?: string;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ gigs: any[]; total: number; page: number; totalPages: number }> => {
    const response = await adminApi.get<ApiResponse<{ gigs: any[]; total: number; page: number; totalPages: number }>>(
      ADMIN_ROUTES.GIGS,
      { params }
    );
    return response.data.data!;
  },

  getGigById: async (gigId: string): Promise<{ gig: any; ownerProfile: any; applications: any[] }> => {
    const response = await adminApi.get<ApiResponse<{ gig: any; ownerProfile: any; applications: any[] }>>(
      ADMIN_ROUTES.GIG_BY_ID(gigId)
    );
    return response.data.data!;
  },

  toggleFlagGig: async (gigId: string, isFlagged: boolean): Promise<any> => {
    const response = await adminApi.patch<ApiResponse<any>>(
      ADMIN_ROUTES.FLAG_GIG(gigId),
      { isFlagged }
    );
    return response.data.data!;
  },

  deleteGig: async (gigId: string): Promise<any> => {
    const response = await adminApi.delete<ApiResponse<any>>(
      ADMIN_ROUTES.DELETE_GIG(gigId)
    );
    return response.data.data!;
  },

  updateApplicationStatus: async (gigId: string, applicationId: string, status: 'accepted' | 'rejected'): Promise<any> => {
    const response = await adminApi.patch<ApiResponse<any>>(
      `${ADMIN_ROUTES.GIGS}/${gigId}/applications/${applicationId}`,
      { status }
    );
    return response.data.data!;
  },
};

export default adminService;
