import type { IWorkerGigService } from "../../interfaces/services/worker/gig.service.interface";
import type { IGigRepository, ICategoryRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IGig, ICategory } from "../../interfaces/gig.interface";

export class WorkerGigService implements IWorkerGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _categoryRepo: ICategoryRepository
  ) {}

  async browseGigs(filters?: {
    search?: string;
    categoryId?: string;
    location?: string;
    minPay?: number;
    date?: string;
  }): Promise<IGig[]> {
    return await this._gigRepo.findActiveGigs(filters);
  }

  async getGigById(gigId: string): Promise<IGig> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.status !== "active" || gig.isDeleted) {
      throw new Error("Gig not found or is no longer active");
    }
    return gig;
  }

  async getCategories(): Promise<ICategory[]> {
    return await this._categoryRepo.findAll();
  }
}
