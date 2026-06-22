import { IWorkerProfile, IOwnerProfile, IUser } from "../user.interface";

export interface IProfileService {
  setupWorkerProfile(userId: string, profileData: Partial<IWorkerProfile>): Promise<{ user: IUser, profile: IWorkerProfile }>;
  setupOwnerProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<{ user: IUser, profile: IOwnerProfile }>;
  getWorkerProfile(userId: string): Promise<IWorkerProfile | null>;
  getOwnerProfile(userId: string): Promise<IOwnerProfile | null>;
}
