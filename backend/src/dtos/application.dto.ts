import type { UserResponseDTO } from "./user.dto";
import type { GigResponseDTO, GigRoleDTO } from "./gig.dto";

export interface WorkerProfileInfoDTO {
  skills: string[];
  portfolio: string[];
  age?: number;
  bio?: string;
  location?: string;
}

export interface GigApplicationDTO {
  id: string;
  gigId: string;
  roleId: string;
  workerId: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
  gig?: GigResponseDTO;
  role?: GigRoleDTO;
  worker?: UserResponseDTO & { profile?: WorkerProfileInfoDTO };
}
