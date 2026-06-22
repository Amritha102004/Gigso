import { IWorkerProfile, IOwnerProfile } from "../../interfaces/user.interface";
import { IBaseRepository } from "./base.repository.interface";

export interface IWorkerProfileRepository extends IBaseRepository<IWorkerProfile> {
  findByUserId(userId: string): Promise<IWorkerProfile | null>;
  upsertProfile(userId: string, profileData: Partial<IWorkerProfile>): Promise<IWorkerProfile>;
}

export interface IOwnerProfileRepository extends IBaseRepository<IOwnerProfile> {
  findByUserId(userId: string): Promise<IOwnerProfile | null>;
  upsertProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<IOwnerProfile>;
}
