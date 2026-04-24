import { UserModel } from "../models/user.model";
import { IUser, ICreateUser } from "../interfaces/user.interface";
import { IUserRepository, UserFilter } from "../interfaces/repositories/user.repository.interface";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async createUser(userData: ICreateUser): Promise<IUser> {
    return this.create(userData as Partial<IUser>);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select("+password");
  }

  async findUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).select("-password");
  }

  async updateUserPassword(email: string, hashedPass: string): Promise<IUser | null> {
    return UserModel.findOneAndUpdate(
      { email },
      { password: hashedPass },
      { new: true }
    );
  }

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

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
  }
}
