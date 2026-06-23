import { IOwnerProfile } from "../interfaces/user.interface";
import { OwnerProfileResponseDTO } from "../dtos/ownerProfile.dto";

export const toOwnerProfileResponse = (profile: IOwnerProfile): OwnerProfileResponseDTO => {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    businessName: profile.businessName,
    industry: profile.industry,
    companySize: profile.companySize,
    website: profile.website,
    description: profile.description,
    location: profile.location,
    createdAt: profile.createdAt?.toISOString(),
    updatedAt: profile.updatedAt?.toISOString(),
  };
};
