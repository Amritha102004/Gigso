import type { IUser } from "../interfaces/user.interface";
import type { UserResponseDTO } from "../dtos/user.dto";

export const toUserResponse = (user: IUser): UserResponseDTO => {
  return {
    _id: (user._id).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    profileImage: user.profileImage || undefined,
    isApproved: user.isApproved,
    isSuspended: user.isSuspended,
    isProfileCompleted: user.isProfileCompleted,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
};
