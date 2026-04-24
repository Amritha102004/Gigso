import { IUser } from "../../interfaces/user.interface";
import { UserFilter } from "../repositories/user.repository.interface";

export interface IUsersService {
  getUsers(filter: UserFilter, page: number, limit: number): Promise<{ users: IUser[], total: number }>;
  getUser(id: string): Promise<IUser>;
  updateUserStatus(id: string, isSuspended: boolean): Promise<IUser>;
  approveOwner(id: string): Promise<IUser>;
}
