import { IUserRepository } from "../interfaces/repositories/user.repository.interface";
import { IUsersService } from "../interfaces/services/users.service.interface";
import { UserFilter } from "../interfaces/repositories/user.repository.interface";
import { IUser } from "../interfaces/user.interface";

export class UsersService implements IUsersService {
  constructor(private _usersRepo: IUserRepository) {}

  async getUsers(filter: UserFilter, page: number, limit: number): Promise<{ users: IUser[], total: number }> {
    const skip = (page - 1) * limit;
    return this._usersRepo.findUsers(filter, skip, limit);
  }

  async getUser(id: string): Promise<IUser> {
    const user = await this._usersRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUserStatus(id: string, isSuspended: boolean): Promise<IUser> {
    const user = await this._usersRepo.updateUser(id, { isSuspended });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async approveOwner(id: string): Promise<IUser> {
    const user = await this._usersRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.role !== 'owner') {
      throw new Error("Only owners can be approved");
    }

    const updatedUser = await this._usersRepo.updateUser(id, { isApproved: true });
    if (!updatedUser) {
        throw new Error("User not found during update");
    }
    return updatedUser;
  }
}
