import { UserRole } from "../interfaces/user.interface";

export interface UserResponseDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  isApproved: boolean;
  isSuspended: boolean;
  isProfileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
