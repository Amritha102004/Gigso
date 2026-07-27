import type { IWorkerGigService } from "../../interfaces/services/worker/gig.service.interface";
import type { IGigRepository, ICategoryRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IGigApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import type { BrowseGigsQueryDTO, GigListItemDTO, GigResponseDTO } from "../../dtos/gig.dto";
import type { CategoryDTO } from "../../dtos/category.dto";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toCategoryDTO } from "../../mappers/category.mapper";

export class WorkerGigService implements IWorkerGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _categoryRepo: ICategoryRepository,
    private _applicationRepo: IGigApplicationRepository
  ) {}

  async browseGigs(filters?: BrowseGigsQueryDTO): Promise<GigListItemDTO[]> {
    const gigs = await this._gigRepo.findActiveGigs(filters);
    const gigIds = gigs.map((g) => g._id.toString());
    const counts = gigIds.length > 0 ? await this._applicationRepo.getCountsForGigs(gigIds) : [];

    return gigs.map((gig) => {
      const gigCount = counts.find((c) => c.gigId === gig._id.toString());
      return toGigListItemDTO(
        gig,
        gigCount ? gigCount.pendingCount : undefined,
        gigCount ? gigCount.acceptedCount : undefined
      );
    });
  }

  async getGigById(gigId: string, workerId?: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.isDeleted) {
      throw new Error("Gig not found");
    }

    if (gig.status !== "active") {
      let hasApplied = false;
      if (workerId) {
        const apps = await this._applicationRepo.findByGigIdAndWorkerId(gigId, workerId);
        if (apps && apps.length > 0) {
          hasApplied = true;
        }
      }
      if (!hasApplied) {
        throw new Error("Gig is no longer active");
      }
    }

    const roleCounts = await this._applicationRepo.getAcceptedCountsByRolesForGig(gigId);
    const countMap: Record<string, number> = {};
    for (const rc of roleCounts) {
      countMap[rc.roleId] = rc.count;
    }

    return toGigResponseDTO(gig, countMap);
  }

  async getCategories(): Promise<CategoryDTO[]> {
    const categories = await this._categoryRepo.findAll();
    return categories.map(toCategoryDTO);
  }
}
