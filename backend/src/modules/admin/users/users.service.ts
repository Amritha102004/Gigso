import { IAdminUsersRepository, UserFilter } from "./users.repository";
import { IUser } from "../../../interfaces/user.interface";

export interface IAdminUsersService {
  getPaginatedUsers(role?: string, page?: number, limit?: number, search?: string): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getUserDetails(id: string): Promise<IUser>;
  approveOwner(id: string): Promise<IUser>;
  toggleUserSuspension(id: string): Promise<IUser>;
}

export class AdminUsersService implements IAdminUsersService {
  constructor(private usersRepo: IAdminUsersRepository) {}

  async getPaginatedUsers(role?: string, page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const filter: UserFilter = {};

    if (role) {
      filter.role = role;
    } else {
      filter.role = { $nin: ["admin"] };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const { users, total } = await this.usersRepo.findUsers(filter, skip, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
    };
  }

  async getUserDetails(id: string): Promise<IUser> {
    const user = await this.usersRepo.findUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  async approveOwner(id: string): Promise<IUser> {
    const user = await this.usersRepo.findUserById(id);
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    if (user.role !== "owner") {
      throw new Error("Only users with the 'owner' role can be approved.");
    }

    if (user.isApproved) {
      throw new Error("Owner is already approved.");
    }

    const updatedUser = await this.usersRepo.updateUser(id, { isApproved: true });
    
    if (!updatedUser) {
      throw new Error("Failed to update user approval status");
    }

    return updatedUser;
  }

  async toggleUserSuspension(id: string): Promise<IUser> {
    const user = await this.usersRepo.findUserById(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = await this.usersRepo.updateUser(id, { 
      isSuspended: !user.isSuspended 
    });

    if (!updatedUser) {
      throw new Error("Failed to update user suspension status");
    }

    return updatedUser;
  }
}
