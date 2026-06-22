import { OwnerProfileModel } from "../models/ownerProfile.model";
import { IOwnerProfile } from "../interfaces/user.interface";
import { IOwnerProfileRepository } from "../interfaces/repositories/profile.repository.interface";
import { BaseRepository } from "./base.repository";

export class OwnerProfileRepository extends BaseRepository<IOwnerProfile> implements IOwnerProfileRepository {
  constructor() {
    super(OwnerProfileModel);
  }

  async findByUserId(userId: string): Promise<IOwnerProfile | null> {
    return OwnerProfileModel.findOne({ userId });
  }

  async upsertProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<IOwnerProfile> {
    const profile = await OwnerProfileModel.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    );
    return profile;
  }
}
