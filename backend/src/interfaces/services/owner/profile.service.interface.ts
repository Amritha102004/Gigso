import type { UserResponseDTO } from "../../../dtos/user.dto";
import type { SetupOwnerProfileRequestDTO, OwnerProfileResponseDTO } from "../../../dtos/ownerProfile.dto";

export interface IOwnerProfileService {
  setupOwnerProfile(userId: string, profileData: SetupOwnerProfileRequestDTO): Promise<{ user: UserResponseDTO; profile: OwnerProfileResponseDTO }>;
  getOwnerProfile(userId: string): Promise<OwnerProfileResponseDTO | null>;
}
