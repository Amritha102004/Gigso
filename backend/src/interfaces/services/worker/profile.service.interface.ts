import { IWorkerProfile, IUser } from "../../user.interface";

export interface IWorkerProfileService {
  setupWorkerProfile(userId: string, profileData: Partial<IWorkerProfile>): Promise<{ user: IUser; profile: IWorkerProfile }>;
  getWorkerProfile(userId: string): Promise<IWorkerProfile | null>;
}
