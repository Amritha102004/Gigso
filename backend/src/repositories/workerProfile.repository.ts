import { WorkerProfileModel } from "../models/workerProfile.model";
import { IWorkerProfile } from "../interfaces/user.interface";
import { IWorkerProfileRepository } from "../interfaces/repositories/profile.repository.interface";
import { BaseRepository } from "./base.repository";

export class WorkerProfileRepository extends BaseRepository<IWorkerProfile> implements IWorkerProfileRepository {
  constructor() {
    super(WorkerProfileModel);
  }

  async findByUserId(userId: string): Promise<IWorkerProfile | null> {
    return WorkerProfileModel.findOne({ userId });
  }

  async upsertProfile(userId: string, profileData: Partial<IWorkerProfile>): Promise<IWorkerProfile> {
    const profile = await WorkerProfileModel.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    );
    return profile;
  }
}
