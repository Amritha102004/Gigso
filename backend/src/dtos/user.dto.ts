import { UserRole } from "../interfaces/user.interface";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  isSuspended: boolean;
}
