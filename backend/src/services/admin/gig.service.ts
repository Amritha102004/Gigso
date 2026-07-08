import type { IAdminGigService } from "../../interfaces/services/admin/gig.service.interface";
import type { IGigRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IGig } from "../../interfaces/gig.interface";
import { OwnerProfileModel } from "../../models/ownerProfile.model";
import { GigModel } from "../../models/gig.model";
import { GigApplicationModel } from "../../models/application.model";
import { WorkerProfileModel } from "../../models/workerProfile.model";
import type { ApplicationService } from "../application.service";

export class AdminGigService implements IAdminGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _applicationService: ApplicationService
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
    const gig = await GigModel.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("ownerId", "name email role profileImage")
      .populate("roles")
      .exec();

    if (!gig) {
      const error: any = new Error("Gig not found");
      error.statusCode = 404;
      throw error;
    }

    const ownerProfile = await OwnerProfileModel.findOne({ userId: gig.ownerId._id }).exec();

    // Fetch applications with worker user profile attached
    const applications = await GigApplicationModel.find({ gigId: id })
      .populate("workerId", "name email profileImage")
      .populate("roleId")
      .exec();

    const workerIds = applications.map((app) => app.workerId._id || app.workerId);
    const workerProfiles = await WorkerProfileModel.find({ userId: { $in: workerIds } }).exec();

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
    const gig = await GigModel.findByIdAndUpdate(id, { isFlagged }, { new: true })
      .populate("categoryId")
      .populate("ownerId", "name email profileImage")
      .populate("roles")
      .exec();

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
