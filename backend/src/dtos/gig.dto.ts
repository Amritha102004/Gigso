import { CategoryDTO } from "./category.dto";

export interface GigRoleDTO {
  id: string;
  gigId: string;
  roleName: string;
  spots: number;
  payPerPerson: number;
}

export interface GigResponseDTO {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: CategoryDTO;
  location: string;
  eventDate: string;
  startTime: string;
  roles: GigRoleDTO[];
  totalBudget: number;
  status: "draft" | "active" | "completed" | "cancelled" | "paid";
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
  updatedAt: string;
}

export interface GigListItemDTO {
  id: string;
  title: string;
  category: CategoryDTO;
  eventDate: string;
  status: "draft" | "active" | "completed" | "cancelled" | "paid";
  totalRoles: number;
  filledSpots: number;
  totalSpots: number;
}
