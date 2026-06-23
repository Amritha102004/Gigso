import { IOwnerProfile, IUser } from "../../user.interface";

export interface IOwnerProfileService {
  setupOwnerProfile(userId: string, profileData: Partial<IOwnerProfile>): Promise<{ user: IUser; profile: IOwnerProfile }>;
  getOwnerProfile(userId: string): Promise<IOwnerProfile | null>;
}
