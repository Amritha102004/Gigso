import type { CategoryDTO } from "./category.dto";

export interface GigRoleDTO {
  id: string;
  gigId: string;
  roleName: string;
  spots: number;
  payPerPerson: number;
  filledSpots: number;
}

export interface GigResponseDTO {
  id: string;
  ownerId: string | { id: string; name: string; email: string; };
  title: string;
  description: string;
  category: CategoryDTO;
  location: string;
  eventDate: string;
  startTime: string;
  roles: GigRoleDTO[];
  totalBudget: number;
  status: "draft" | "active" | "completed" | "cancelled" | "closed" | "paid";
  paymentStatus: "unpaid" | "paid";
  isFlagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GigListItemDTO {
  id: string;
  title: string;
  category: CategoryDTO;
  eventDate: string;
  status: "draft" | "active" | "completed" | "cancelled" | "closed" | "paid";
  totalRoles: number;
  filledSpots: number;
  totalSpots: number;
  location: string;
  totalBudget: number;
  isFlagged?: boolean;
  ownerId?: string | { id: string; name: string; email: string; };
  pendingApplicationsCount?: number;
}

export interface CreateGigRoleInputDTO {
  roleName: string;
  spots: number;
  payPerPerson: number;
}

export interface CreateGigRequestDTO {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  eventDate: string;
  startTime: string;
  roles: CreateGigRoleInputDTO[];
  status?: "draft" | "active";
}

export interface UpdateGigRequestDTO {
  title?: string;
  description?: string;
  categoryId?: string;
  location?: string;
  eventDate?: string;
  startTime?: string;
  roles?: CreateGigRoleInputDTO[];
  status?: "draft" | "active";
}

export interface BrowseGigsQueryDTO {
  search?: string;
  categoryId?: string;
  location?: string;
  minPay?: number;
  date?: string;
}

export interface AdminGigsQueryDTO {
  search?: string;
  categoryId?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}
