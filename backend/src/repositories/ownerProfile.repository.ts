import { OwnerProfileModel } from "../models/ownerProfile.model";
import type { IOwnerProfile } from "../interfaces/user.interface";
import type { IOwnerProfileRepository } from "../interfaces/repositories/profile.repository.interface";
import { BaseRepository } from "./base.repository";

export class OwnerProfileRepository extends BaseRepository<IOwnerProfile> implements IOwnerProfileRepository {
  constructor() {
    super(OwnerProfileModel);
  }

  async findByUserId(userId: string): Promise<IOwnerProfile | null> {
    return this._model.findOne({ userId }).exec();
  }

  async upsertProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<IOwnerProfile> {
    const profile = await this._model.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    ).exec();
    return profile!;
  }
}
