import { WorkerProfileModel } from "../models/workerProfile.model";
import type { IWorkerProfile } from "../interfaces/user.interface";
import type { IWorkerProfileRepository } from "../interfaces/repositories/profile.repository.interface";
import { BaseRepository } from "./base.repository";

export class WorkerProfileRepository extends BaseRepository<IWorkerProfile> implements IWorkerProfileRepository {
  constructor() {
    super(WorkerProfileModel);
  }

  async findByUserId(userId: string): Promise<IWorkerProfile | null> {
    return this._model.findOne({ userId }).exec();
  }

  async upsertProfile(userId: string, profileData: Partial<IWorkerProfile>): Promise<IWorkerProfile> {
    const profile = await this._model.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    ).exec();
    return profile!;
  }

  async findProfilesByUserIds(userIds: string[]): Promise<IWorkerProfile[]> {
    return this._model.find({ userId: { $in: userIds } }).exec();
  }
}
