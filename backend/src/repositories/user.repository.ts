import { UserModel } from "../models/user.model";
import type { IUser, ICreateUser } from "../interfaces/user.interface";
import type { IUserRepository, UserFilter } from "../interfaces/repositories/user.repository.interface";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async createUser(userData: ICreateUser): Promise<IUser> {
    return this.create(userData as Partial<IUser>);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this._model.findOne({ email }).select("+password").exec();
  }

  async findUserById(id: string): Promise<IUser | null> {
    return this._model.findById(id).select("-password").exec();
  }

  async updateUserPassword(email: string, hashedPass: string): Promise<IUser | null> {
    return this._model.findOneAndUpdate(
      { email },
      { password: hashedPass },
      { new: true }
    ).exec();
  }

  async findUsers(filter: UserFilter, skip: number, limit: number): Promise<{ users: IUser[], total: number }> {
    const [users, total] = await Promise.all([
      this._model.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this._model.countDocuments(filter).exec()
    ]);

    return { users, total };
  }

  async findUserByIdWithPassword(id: string): Promise<IUser | null> {
    return this._model.findById(id).select("+password").exec();
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return this._model.findByIdAndUpdate(id, updateData, { new: true }).select("-password").exec();
  }
}
