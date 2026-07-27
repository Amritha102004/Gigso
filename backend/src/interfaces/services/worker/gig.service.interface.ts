import type { BrowseGigsQueryDTO, GigListItemDTO, GigResponseDTO } from "../../../dtos/gig.dto";
import type { CategoryDTO } from "../../../dtos/category.dto";

export interface IWorkerGigService {
  browseGigs(filters?: BrowseGigsQueryDTO): Promise<GigListItemDTO[]>;
  getGigById(gigId: string, workerId?: string): Promise<GigResponseDTO>;
  getCategories(): Promise<CategoryDTO[]>;
}
