import type {
  CreateGigRequestDTO,
  UpdateGigRequestDTO,
  GigResponseDTO,
  GigListItemDTO,
} from "../../../dtos/gig.dto";
import type { CategoryDTO } from "../../../dtos/category.dto";

export interface IOwnerGigService {
  createGig(ownerId: string, input: CreateGigRequestDTO): Promise<GigResponseDTO>;
  getOwnerGigs(ownerId: string, status?: string): Promise<GigListItemDTO[]>;
  getGigById(gigId: string, ownerId: string): Promise<GigResponseDTO>;
  updateGig(gigId: string, ownerId: string, input: UpdateGigRequestDTO): Promise<GigResponseDTO>;
  softDeleteGig(gigId: string, ownerId: string): Promise<boolean>;
  publishGig(gigId: string, ownerId: string): Promise<GigResponseDTO>;
  markAsCompleted(gigId: string, ownerId: string): Promise<GigResponseDTO>;
  getCategories(): Promise<CategoryDTO[]>;
}
