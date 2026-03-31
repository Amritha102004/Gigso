import { UserModel } from "../../models/user.model";
import { IUser, ICreateUser } from "../../interfaces/user.interface";

export interface IAuthRepository {
  createUser(userData: ICreateUser): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  updateUserPassword(email: string, hashedPass: string): Promise<IUser | null>;
}

export class AuthRepository implements IAuthRepository {
  async createUser(userData: ICreateUser): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select("+password");
  }

  async findUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async updateUserPassword(email: string, hashedPass: string): Promise<IUser | null> {
    return UserModel.findOneAndUpdate(
      { email },
      { password: hashedPass },
      { new: true }
    );
  }
}
