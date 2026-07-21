import type { UserResponseDTO } from "../../../dtos/user.dto";
import type { SetupWorkerProfileRequestDTO, WorkerProfileResponseDTO } from "../../../dtos/workerProfile.dto";

export interface IWorkerProfileService {
  setupWorkerProfile(userId: string, profileData: SetupWorkerProfileRequestDTO): Promise<{ user: UserResponseDTO; profile: WorkerProfileResponseDTO }>;
  getWorkerProfile(userId: string): Promise<WorkerProfileResponseDTO | null>;
}
