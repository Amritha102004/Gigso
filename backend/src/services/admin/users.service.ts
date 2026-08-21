import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IUsersService } from "../../interfaces/services/admin/users.service.interface";
import type { UserFilter } from "../../interfaces/repositories/user.repository.interface";
import type { UserResponseDTO } from "../../dtos/user.dto";
import { toUserResponse } from "../../mappers/user.mapper";

export class UsersService implements IUsersService {
  constructor(private _usersRepo: IUserRepository) {}

  async getUsers(filter: UserFilter, page: number, limit: number): Promise<{ users: UserResponseDTO[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const { users, total } = await this._usersRepo.findUsers(filter, skip, limit);
    return {
      users: users.map(toUserResponse),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: string): Promise<UserResponseDTO> {
    const user = await this._usersRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return toUserResponse(user);
  }

  async updateUserStatus(id: string, isSuspended: boolean): Promise<UserResponseDTO> {
    const user = await this._usersRepo.updateUser(id, { isSuspended });
    if (!user) {
      throw new Error("User not found");
    }
    return toUserResponse(user);
  }

  async approveOwner(id: string): Promise<UserResponseDTO> {
    const user = await this._usersRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "owner") {
      throw new Error("Only owners can be approved");
    }

    const updatedUser = await this._usersRepo.updateUser(id, { isApproved: true });
    if (!updatedUser) {
      throw new Error("User not found during update");
    }
    return toUserResponse(updatedUser);
  }
}
