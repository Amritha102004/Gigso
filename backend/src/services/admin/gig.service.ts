import type { IAdminGigService } from "../../interfaces/services/admin/gig.service.interface";
import type { IGigRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IWorkerProfileRepository, IOwnerProfileRepository } from "../../interfaces/repositories/profile.repository.interface";
import type { IGigApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import type { IApplicationService } from "../../interfaces/services/application.service.interface";
import type { IGig } from "../../interfaces/gig.interface";

export class AdminGigService implements IAdminGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _workerProfileRepo: IWorkerProfileRepository,
    private _ownerProfileRepo: IOwnerProfileRepository,
    private _applicationRepo: IGigApplicationRepository,
    private _applicationService: IApplicationService
  ) {}

  async getAllGigs(
    filters: {
      search?: string;
      categoryId?: string;
      status?: string;
      date?: string;
    },
    page: number,
    limit: number
  ): Promise<{
    gigs: IGig[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { gigs, total } = await this._gigRepo.findAllGigs(filters, page, limit);
    return {
      gigs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getGigById(id: string): Promise<{ gig: IGig; ownerProfile: any; applications: any[] }> {
    const gig = await this._gigRepo.findGigDetailsById(id);

    if (!gig) {
      const error: any = new Error("Gig not found");
      error.statusCode = 404;
      throw error;
    }

    const ownerProfile = await this._ownerProfileRepo.findByUserId(gig.ownerId._id.toString());

    // Fetch applications with worker user profile attached
    const applications = await this._applicationRepo.findByGigId(id);

    const workerIds = applications.map((app) => app.workerId._id || app.workerId);
    const workerProfiles = await this._workerProfileRepo.findProfilesByUserIds(workerIds.map((id) => id.toString()));

    const applicationsWithProfiles = applications.map((app) => {
      const applicantId = app.workerId._id?.toString() || app.workerId.toString();
      const profile = workerProfiles.find((p) => p.userId.toString() === applicantId) || null;
      return {
        ...app.toObject(),
        profile,
      };
    });

    return {
      gig,
      ownerProfile,
      applications: applicationsWithProfiles,
    };
  }

  async toggleFlagGig(id: string, isFlagged: boolean): Promise<IGig> {
    await this._gigRepo.update(id, { isFlagged });
    const gig = await this._gigRepo.findGigDetailsById(id);

    if (!gig) {
      const error: any = new Error("Gig not found");
      error.statusCode = 404;
      throw error;
    }
    return gig;
  }

  async deleteGig(id: string): Promise<boolean> {
    return await this._gigRepo.softDelete(id);
  }

  async updateApplicationStatus(
    gigId: string,
    applicationId: string,
    status: "accepted" | "rejected"
  ): Promise<any> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.isDeleted) {
      const error: any = new Error("Gig not found");
      error.statusCode = 404;
      throw error;
    }

    // Bypass HTTP owner auth by providing gig's actual ownerId directly
    return await this._applicationService.updateApplicationStatus(
      applicationId,
      gig.ownerId.toString(),
      status
    );
  }
}
