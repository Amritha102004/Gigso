import { IUser } from "../interfaces/user.interface";
import { UserResponseDTO } from "../dtos/user.dto";

export const toUserResponse = (user: IUser): UserResponseDTO => {
  return {
    _id: (user._id).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
    isSuspended: user.isSuspended,
    isProfileCompleted: user.isProfileCompleted,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
};
