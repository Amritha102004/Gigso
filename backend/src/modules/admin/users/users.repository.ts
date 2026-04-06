import { UserModel } from "../../../models/user.model";
import { IUser } from "../../../interfaces/user.interface";

export interface UserFilter {
  role?: string | { $nin: string[] };
  $or?: Array<{ name?: RegExp; email?: RegExp }>;
}

export interface IAdminUsersRepository {
  findUsers(filter: UserFilter, skip: number, limit: number): Promise<{ users: IUser[], total: number }>;
  findUserById(id: string): Promise<IUser | null>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
}

export class AdminUsersRepository implements IAdminUsersRepository {
  async findUsers(filter: UserFilter, skip: number, limit: number): Promise<{ users: IUser[], total: number }> {
    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(filter)
    ]);

    return { users, total };
  }

  async findUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).select("-password");
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
  }
}
