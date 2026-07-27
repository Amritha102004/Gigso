import apiClient from '../../../api/client';
import { GIG_ROUTES } from '../../../constants/apiRoutes';
import type { GigResponseDTO, GigListItemDTO, CategoryDTO, GigApplicationDTO } from '../../../types/api.types';

interface ApiResponse<T = unknown> {
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
    const response = await apiClient.post<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIGS, data);
    return response.data;
  },

  getMyGigs: async (status?: string) => {
    const url = status ? `${GIG_ROUTES.OWNER_GIGS}?status=${status}` : GIG_ROUTES.OWNER_GIGS;
    const response = await apiClient.get<ApiResponse<GigListItemDTO[]>>(url);
    return response.data;
  },

  getGigById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_BY_ID(id));
    return response.data;
  },

  updateGig: async (id: string, data: UpdateGigPayload) => {
    const response = await apiClient.put<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_BY_ID(id), data);
    return response.data;
  },

  deleteGig: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(GIG_ROUTES.OWNER_GIG_BY_ID(id));
    return response.data;
  },

  publishGig: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_PUBLISH(id));
    return response.data;
  },

  markAsCompleted: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<GigResponseDTO>>(GIG_ROUTES.OWNER_GIG_COMPLETE(id));
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(GIG_ROUTES.CATEGORIES);
    return response.data;
  },

  getGigApplications: async (gigId: string) => {
    const response = await apiClient.get<ApiResponse<GigApplicationDTO[]>>(GIG_ROUTES.OWNER_GIG_APPLICATIONS(gigId));
    return response.data;
  },

  updateApplicationStatus: async (gigId: string, applicationId: string, status: 'accepted' | 'rejected') => {
    const response = await apiClient.patch<ApiResponse<GigApplicationDTO>>(
      GIG_ROUTES.OWNER_GIG_APPLICATION_STATUS(gigId, applicationId),
      { status }
    );
    return response.data;
  },
};

export default gigService;
