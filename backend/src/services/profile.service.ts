import { IProfileService } from "../interfaces/services/profile.service.interface";
import { IUserRepository } from "../interfaces/repositories/user.repository.interface";
import { IWorkerProfileRepository, IOwnerProfileRepository } from "../interfaces/repositories/profile.repository.interface";
import { IWorkerProfile, IOwnerProfile, IUser } from "../interfaces/user.interface";

export class ProfileService implements IProfileService {
  constructor(
    private _userRepo: IUserRepository,
    private _workerProfileRepo: IWorkerProfileRepository,
    private _ownerProfileRepo: IOwnerProfileRepository
  ) {}

  async setupWorkerProfile(userId: string, profileData: Partial<IWorkerProfile>): Promise<{ user: IUser, profile: IWorkerProfile }> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "worker") {
      throw new Error("Invalid role for worker profile setup");
    }

    const profile = await this._workerProfileRepo.upsertProfile(userId, profileData);
    
    const updatedUser = await this._userRepo.updateUser(userId, { isProfileCompleted: true });
    if (!updatedUser) {
        throw new Error("Failed to update user profile status");
    }

    return { user: updatedUser, profile };
  }

  async setupOwnerProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<{ user: IUser, profile: IOwnerProfile }> {
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

  async getWorkerProfile(userId: string): Promise<IWorkerProfile | null> {
    return this._workerProfileRepo.findByUserId(userId);
  }

  async getOwnerProfile(userId: string): Promise<IOwnerProfile | null> {
    return this._ownerProfileRepo.findByUserId(userId);
  }
}
