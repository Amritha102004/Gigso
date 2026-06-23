import { IWorkerProfile } from "../interfaces/user.interface";
import { WorkerProfileResponseDTO } from "../dtos/workerProfile.dto";

export const toWorkerProfileResponse = (profile: IWorkerProfile): WorkerProfileResponseDTO => {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    skills: profile.skills || [],
    portfolio: profile.portfolio || [],
    age: profile.age,
    bio: profile.bio,
    location: profile.location,
    createdAt: profile.createdAt?.toISOString(),
    updatedAt: profile.updatedAt?.toISOString(),
  };
};
