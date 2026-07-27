import type { IWorkerProfileService } from "../../interfaces/services/worker/profile.service.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IWorkerProfileRepository } from "../../interfaces/repositories/profile.repository.interface";
import type { UserResponseDTO } from "../../dtos/user.dto";
import type { SetupWorkerProfileRequestDTO, WorkerProfileResponseDTO } from "../../dtos/workerProfile.dto";
import { toUserResponse } from "../../mappers/user.mapper";
import { toWorkerProfileResponse } from "../../mappers/workerProfile.mapper";

import type { IUser } from "../../interfaces/user.interface";

export class WorkerProfileService implements IWorkerProfileService {
  constructor(
    private _userRepo: IUserRepository,
    private _workerProfileRepo: IWorkerProfileRepository
  ) {}

  async setupWorkerProfile(
    userId: string,
    profileData: SetupWorkerProfileRequestDTO
  ): Promise<{ user: UserResponseDTO; profile: WorkerProfileResponseDTO }> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "worker") {
      throw new Error("Invalid role for worker profile setup");
    }

    const { name, phone, profileImage, ...workerProfileFields } = profileData;

    const profile = await this._workerProfileRepo.upsertProfile(userId, workerProfileFields);

    const userUpdate: Partial<IUser> = { isProfileCompleted: true };
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;
    if (profileImage !== undefined) userUpdate.profileImage = profileImage;

    const updatedUser = await this._userRepo.updateUser(userId, userUpdate);
    if (!updatedUser) {
      throw new Error("Failed to update user profile status");
    }

    return {
      user: toUserResponse(updatedUser),
      profile: toWorkerProfileResponse(profile),
    };
  }

  async getWorkerProfile(userId: string): Promise<WorkerProfileResponseDTO | null> {
    const profile = await this._workerProfileRepo.findByUserId(userId);
    return profile ? toWorkerProfileResponse(profile) : null;
  }
}
