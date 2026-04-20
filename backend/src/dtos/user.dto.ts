import { UserRole } from "../interfaces/user.interface";

export interface UserResponseDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  isSuspended: boolean;
}
