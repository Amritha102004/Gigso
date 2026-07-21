export interface WorkerProfileResponseDTO {
  id: string;
  userId: string;
  skills: string[];
  portfolio: string[];
  age?: number;
  bio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetupWorkerProfileRequestDTO {
  name?: string;
  phone?: string;
  profileImage?: string;
  skills?: string[];
  portfolio?: string[];
  age?: number;
  bio?: string;
  location?: string;
}
