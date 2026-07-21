import type { IWorkerGigService } from "../../interfaces/services/worker/gig.service.interface";
import type { IGigRepository, ICategoryRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { BrowseGigsQueryDTO, GigListItemDTO, GigResponseDTO } from "../../dtos/gig.dto";
import type { CategoryDTO } from "../../dtos/category.dto";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toCategoryDTO } from "../../mappers/category.mapper";

export class WorkerGigService implements IWorkerGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _categoryRepo: ICategoryRepository
  ) {}

  async browseGigs(filters?: BrowseGigsQueryDTO): Promise<GigListItemDTO[]> {
    const gigs = await this._gigRepo.findActiveGigs(filters);
    return gigs.map(toGigListItemDTO);
  }

  async getGigById(gigId: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.status !== "active" || gig.isDeleted) {
      throw new Error("Gig not found or is no longer active");
    }
    return toGigResponseDTO(gig);
  }

  async getCategories(): Promise<CategoryDTO[]> {
    const categories = await this._categoryRepo.findAll();
    return categories.map(toCategoryDTO);
  }
}
