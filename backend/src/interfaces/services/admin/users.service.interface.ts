import type { UserResponseDTO } from "../../../dtos/user.dto";
import type { UserFilter } from "../../repositories/user.repository.interface";

export interface IUsersService {
  getUsers(filter: UserFilter, page: number, limit: number): Promise<{ users: UserResponseDTO[]; total: number }>;
  getUser(id: string): Promise<UserResponseDTO>;
  updateUserStatus(id: string, isSuspended: boolean): Promise<UserResponseDTO>;
  approveOwner(id: string): Promise<UserResponseDTO>;
}
