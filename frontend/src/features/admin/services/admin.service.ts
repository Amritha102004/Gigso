import apiClient from '../../../api/client';
import { ADMIN_ROUTES } from '../../../constants/apiRoutes';
import type { 
  PaginatedUsersResponse, 
  UserDTO, 
  GigResponseDTO, 
  GigRoleDTO, 
  OwnerProfileResponseDTO, 
  GigApplicationDTO 
} from '../../../types/api.types';

export interface GetUsersParams {
  role?: 'owner' | 'worker';
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminGigRole extends GigRoleDTO {
  filledSpots?: number;
}

export interface AdminGig extends Omit<GigResponseDTO, 'roles'> {
  roles: AdminGigRole[];
  isFlagged?: boolean;
}

export interface AdminGigDetails {
  gig: AdminGig;
  ownerProfile: OwnerProfileResponseDTO;
  applications: GigApplicationDTO[];
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const adminService = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedUsersResponse>>(ADMIN_ROUTES.USERS, { params });
    return response.data.data!;
  },

  getUsersByRole: async (role: 'owner' | 'worker', params?: Omit<GetUsersParams, 'role'>): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedUsersResponse>>(ADMIN_ROUTES.USERS, {
      params: { role, ...params },
    });
    return response.data.data!;
  },

  approveUser: async (userId: string): Promise<{ message: string; user: UserDTO }> => {
    const response = await apiClient.patch<ApiResponse<{ user: UserDTO }>>(ADMIN_ROUTES.APPROVE_USER(userId));
    return { message: response.data.message, user: response.data.data!.user };
  },

  suspendUser: async (userId: string): Promise<{ message: string; user: UserDTO }> => {
    const response = await apiClient.patch<ApiResponse<{ user: UserDTO }>>(ADMIN_ROUTES.SUSPEND_USER(userId));
    return { message: response.data.message, user: response.data.data!.user };
  },

  getGigs: async (params?: {
    search?: string;
    categoryId?: string;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ gigs: AdminGig[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get<ApiResponse<{ gigs: AdminGig[]; total: number; page: number; totalPages: number }>>(
      ADMIN_ROUTES.GIGS,
      { params }
    );
    return response.data.data!;
  },

  getGigById: async (gigId: string): Promise<AdminGigDetails> => {
    const response = await apiClient.get<ApiResponse<AdminGigDetails>>(
      ADMIN_ROUTES.GIG_BY_ID(gigId)
    );
    return response.data.data!;
  },

  toggleFlagGig: async (gigId: string, isFlagged: boolean): Promise<AdminGig> => {
    const response = await apiClient.patch<ApiResponse<AdminGig>>(
      ADMIN_ROUTES.FLAG_GIG(gigId),
      { isFlagged }
    );
    return response.data.data!;
  },

  deleteGig: async (gigId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      ADMIN_ROUTES.DELETE_GIG(gigId)
    );
    return { success: response.data.success, message: response.data.message };
  },

  updateApplicationStatus: async (gigId: string, applicationId: string, status: 'accepted' | 'rejected'): Promise<GigApplicationDTO> => {
    const response = await apiClient.patch<ApiResponse<GigApplicationDTO>>(
      `${ADMIN_ROUTES.GIGS}/${gigId}/applications/${applicationId}`,
      { status }
    );
    return response.data.data!;
  },
};

export default adminService;
