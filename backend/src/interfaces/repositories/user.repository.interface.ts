import { IUser, ICreateUser } from "../../interfaces/user.interface";
import { IBaseRepository } from "./base.repository.interface";

export interface UserFilter {
  role?: string | { $nin: string[] };
  $or?: Array<{ name?: RegExp; email?: RegExp }>;
}

export interface IUserRepository extends IBaseRepository<IUser> {
  createUser(userData: ICreateUser): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser | null>;
  updateUserPassword(email: string, hashedPass: string): Promise<IUser | null>;
  findUsers(filter: UserFilter, skip: number, limit: number): Promise<{ users: IUser[], total: number }>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
}
