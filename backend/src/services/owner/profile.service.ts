import type { IOwnerProfileService } from "../../interfaces/services/owner/profile.service.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IOwnerProfileRepository } from "../../interfaces/repositories/profile.repository.interface";
import type { UserResponseDTO } from "../../dtos/user.dto";
import type { SetupOwnerProfileRequestDTO, OwnerProfileResponseDTO } from "../../dtos/ownerProfile.dto";
import { toUserResponse } from "../../mappers/user.mapper";
import { toOwnerProfileResponse } from "../../mappers/ownerProfile.mapper";

export class OwnerProfileService implements IOwnerProfileService {
  constructor(
    private _userRepo: IUserRepository,
    private _ownerProfileRepo: IOwnerProfileRepository
  ) {}

  async setupOwnerProfile(
    userId: string,
    profileData: SetupOwnerProfileRequestDTO
  ): Promise<{ user: UserResponseDTO; profile: OwnerProfileResponseDTO }> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "owner") {
      throw new Error("Invalid role for owner profile setup");
    }

    const { name, phone, profileImage, ...ownerProfileFields } = profileData;

    const profile = await this._ownerProfileRepo.upsertProfile(userId, ownerProfileFields);

    const userUpdate: any = { isProfileCompleted: true };
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;
    if (profileImage !== undefined) userUpdate.profileImage = profileImage;

    const updatedUser = await this._userRepo.updateUser(userId, userUpdate);
    if (!updatedUser) {
      throw new Error("Failed to update user profile status");
    }

    return {
      user: toUserResponse(updatedUser),
      profile: toOwnerProfileResponse(profile),
    };
  }

  async getOwnerProfile(userId: string): Promise<OwnerProfileResponseDTO | null> {
    const profile = await this._ownerProfileRepo.findByUserId(userId);
    return profile ? toOwnerProfileResponse(profile) : null;
  }
}
