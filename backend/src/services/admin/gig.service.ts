import type { IAdminGigService } from "../../interfaces/services/admin/gig.service.interface";
import type { IGigRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IWorkerProfileRepository, IOwnerProfileRepository } from "../../interfaces/repositories/profile.repository.interface";
import type { IGigApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import type { IApplicationService } from "../../interfaces/services/application.service.interface";
import type { GigListItemDTO, GigResponseDTO, AdminGigsQueryDTO } from "../../dtos/gig.dto";
import type { OwnerProfileResponseDTO } from "../../dtos/ownerProfile.dto";
import type { GigApplicationDTO } from "../../dtos/application.dto";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toOwnerProfileResponse } from "../../mappers/ownerProfile.mapper";
import { toGigApplicationDTO } from "../../mappers/application.mapper";
import { AppError } from "../../utils/errors";

export class AdminGigService implements IAdminGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _workerProfileRepo: IWorkerProfileRepository,
    private _ownerProfileRepo: IOwnerProfileRepository,
    private _applicationRepo: IGigApplicationRepository,
    private _applicationService: IApplicationService
  ) {}

  async getAllGigs(
    filters: AdminGigsQueryDTO,
    page: number,
    limit: number
  ): Promise<{
    gigs: GigListItemDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { gigs, total } = await this._gigRepo.findAllGigs(filters, page, limit);
    return {
      gigs: gigs.map((g) => toGigListItemDTO(g)),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getGigById(id: string): Promise<{ gig: GigResponseDTO; ownerProfile: OwnerProfileResponseDTO | null; applications: GigApplicationDTO[] }> {
    const gig = await this._gigRepo.findGigDetailsById(id);

    if (!gig) {
      throw new AppError("Gig not found", 404);
    }

    const ownerProfileDoc = await this._ownerProfileRepo.findByUserId(gig.ownerId._id.toString());
    const ownerProfile = ownerProfileDoc ? toOwnerProfileResponse(ownerProfileDoc) : null;

    // Fetch applications with worker user profile attached
    const applications = await this._applicationRepo.findByGigId(id);

    const workerIds = applications.map((app) => app.workerId._id || app.workerId);
    const workerProfiles = await this._workerProfileRepo.findProfilesByUserIds(workerIds.map((id) => id.toString()));

    const applicationsWithProfiles = applications.map((app) => {
      const applicantId = app.workerId._id?.toString() || app.workerId.toString();
      const profile = workerProfiles.find((p) => p.userId.toString() === applicantId) || null;
      return toGigApplicationDTO(app, profile);
    });

    return {
      gig: toGigResponseDTO(gig),
      ownerProfile,
      applications: applicationsWithProfiles,
    };
  }

  async toggleFlagGig(id: string, isFlagged: boolean): Promise<GigResponseDTO> {
    await this._gigRepo.update(id, { isFlagged });
    const gig = await this._gigRepo.findGigDetailsById(id);

    if (!gig) {
      throw new AppError("Gig not found", 404);
    }
    return toGigResponseDTO(gig);
  }

  async deleteGig(id: string): Promise<boolean> {
    return await this._gigRepo.softDelete(id);
  }

  async updateApplicationStatus(
    gigId: string,
    applicationId: string,
    status: "accepted" | "rejected"
  ): Promise<GigApplicationDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.isDeleted) {
      throw new AppError("Gig not found", 404);
    }

    // Bypass HTTP owner auth by providing gig's actual ownerId directly
    return await this._applicationService.updateApplicationStatus(
      applicationId,
      gig.ownerId.toString(),
      status
    );
  }
}
