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
