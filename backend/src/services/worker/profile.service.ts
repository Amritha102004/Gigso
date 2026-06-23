import { IWorkerProfileService } from "../../interfaces/services/worker/profile.service.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IWorkerProfileRepository } from "../../interfaces/repositories/profile.repository.interface";
import { IWorkerProfile, IUser } from "../../interfaces/user.interface";

export class WorkerProfileService implements IWorkerProfileService {
  constructor(
    private _userRepo: IUserRepository,
    private _workerProfileRepo: IWorkerProfileRepository
  ) {}

  async setupWorkerProfile(userId: string, profileData: Partial<IWorkerProfile> & { name?: string; phone?: string; profileImage?: string; }): Promise<{ user: IUser; profile: IWorkerProfile }> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "worker") {
      throw new Error("Invalid role for worker profile setup");
    }

    const { name, phone, profileImage, ...workerProfileFields } = profileData;

    const profile = await this._workerProfileRepo.upsertProfile(userId, workerProfileFields);

    const userUpdate: any = { isProfileCompleted: true };
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;
    if (profileImage !== undefined) userUpdate.profileImage = profileImage;

    const updatedUser = await this._userRepo.updateUser(userId, userUpdate);
    if (!updatedUser) {
      throw new Error("Failed to update user profile status");
    }

    return { user: updatedUser, profile };
  }

  async getWorkerProfile(userId: string): Promise<IWorkerProfile | null> {
    return this._workerProfileRepo.findByUserId(userId);
  }
}
