import { IOwnerProfile, IUser } from "../../user.interface";

export interface IOwnerProfileService {
  setupOwnerProfile(userId: string, profileData: Partial<IOwnerProfile> & { name?: string; phone?: string; profileImage?: string; }): Promise<{ user: IUser; profile: IOwnerProfile }>;
  getOwnerProfile(userId: string): Promise<IOwnerProfile | null>;
}
