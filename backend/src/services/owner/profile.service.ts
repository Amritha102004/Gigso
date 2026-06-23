import { IOwnerProfileService } from "../../interfaces/services/owner/profile.service.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IOwnerProfileRepository } from "../../interfaces/repositories/profile.repository.interface";
import { IOwnerProfile, IUser } from "../../interfaces/user.interface";

export class OwnerProfileService implements IOwnerProfileService {
  constructor(
    private _userRepo: IUserRepository,
    private _ownerProfileRepo: IOwnerProfileRepository
  ) {}

  async setupOwnerProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<{ user: IUser; profile: IOwnerProfile }> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "owner") {
      throw new Error("Invalid role for owner profile setup");
    }

    const profile = await this._ownerProfileRepo.upsertProfile(userId, profileData);

    const updatedUser = await this._userRepo.updateUser(userId, { isProfileCompleted: true });
    if (!updatedUser) {
      throw new Error("Failed to update user profile status");
    }

    return { user: updatedUser, profile };
  }

  async getOwnerProfile(userId: string): Promise<IOwnerProfile | null> {
    return this._ownerProfileRepo.findByUserId(userId);
  }
}
