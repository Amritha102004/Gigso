import type { IApplicationService } from "../interfaces/services/application.service.interface";
import type { IGigApplicationRepository } from "../interfaces/repositories/application.repository.interface";
import type { IGigRepository, IGigRoleRepository } from "../interfaces/repositories/gig.repository.interface";
import type { IWorkerProfileRepository } from "../interfaces/repositories/profile.repository.interface";
import type { GigApplicationDTO } from "../dtos/application.dto";
import { toGigApplicationDTO } from "../mappers/application.mapper";
import { Types } from "mongoose";
import { AppError } from "../utils/errors";

export class ApplicationService implements IApplicationService {
  constructor(
    private _applicationRepo: IGigApplicationRepository,
    private _gigRepo: IGigRepository,
    private _gigRoleRepo: IGigRoleRepository,
    private _workerProfileRepo: IWorkerProfileRepository
  ) {}

  async applyForGigRole(workerId: string, gigId: string, roleId: string): Promise<GigApplicationDTO> {
    // 1. Verify gig exists and is active
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.status !== "active" || gig.isDeleted) {
      throw new AppError("Gig not found or is no longer active for applications", 404);
    }

    // 2. Verify role exists and matches gig
    const role = await this._gigRoleRepo.findById(roleId);
    if (!role || role.gigId.toString() !== gigId) {
      throw new AppError("Specified role does not belong to this gig", 400);
    }

    // 3. Prevent duplicate applications or applying if already accepted/hired for another role in this gig
    const existing = await this._applicationRepo.findByGigIdAndWorkerId(gigId, workerId);
    const hasAcceptedRole = existing.some((app) => app.status === "accepted");
    if (hasAcceptedRole) {
      throw new AppError("You have already been hired/accepted for a role in this gig", 400);
    }

    const hasAppliedToRole = existing.some((app) => app.roleId.toString() === roleId);
    if (hasAppliedToRole) {
      throw new AppError("You have already applied for this role", 400);
    }

    // 4. Create new application
    const app = await this._applicationRepo.create({
      gigId: new Types.ObjectId(gigId),
      roleId: new Types.ObjectId(roleId),
      workerId: new Types.ObjectId(workerId),
      status: "pending",
      appliedAt: new Date(),
    });

    return toGigApplicationDTO(app);
  }

  async getWorkerApplications(workerId: string, status?: string): Promise<GigApplicationDTO[]> {
    const apps = await this._applicationRepo.findByWorkerId(workerId, status);
    return apps.map((app) => toGigApplicationDTO(app));
  }

  async getGigApplications(gigId: string, ownerId: string): Promise<GigApplicationDTO[]> {
    // Verify owner owns the gig
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId || gig.isDeleted) {
      throw new AppError("Gig not found or unauthorized", 404);
    }

    const applications = await this._applicationRepo.findByGigId(gigId);

    // Fetch profiles of applicants to attach bio, rating info to owner dashboard cards
    const workerIds = applications.map((app) => app.workerId._id || app.workerId);
    const profiles = await this._workerProfileRepo.findProfilesByUserIds(workerIds.map((id) => id.toString()));

    return applications.map((app) => {
      const applicantId = app.workerId._id?.toString() || app.workerId.toString();
      const profile = profiles.find((p) => p.userId.toString() === applicantId) || null;
      return toGigApplicationDTO(app, profile);
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    ownerId: string,
    status: "accepted" | "rejected"
  ): Promise<GigApplicationDTO> {
    // 1. Retrieve the application
    const app = await this._applicationRepo.findById(applicationId);
    if (!app) {
      throw new AppError("Application not found", 404);
    }

    // 2. Retrieve and verify the gig owner
    const gig = await this._gigRepo.findById(app.gigId.toString());
    if (!gig || gig.ownerId.toString() !== ownerId || gig.isDeleted) {
      throw new AppError("Unauthorized to manage this application", 403);
    }

    // 3. If accepting, check remaining spots
    if (status === "accepted") {
      const role = await this._gigRoleRepo.findById(app.roleId.toString());
      if (!role) {
        throw new AppError("Associated role not found", 404);
      }

      const acceptedCount = await this._applicationRepo.findAcceptedCountForRole(app.roleId.toString());
      if (acceptedCount >= role.spots) {
        throw new AppError("This role is already fully staffed", 400);
      }
    }

    // 4. Update and return status
    const updated = await this._applicationRepo.update(applicationId, { status });
    if (!updated) {
      throw new AppError("Failed to update application status", 500);
    }

    // If accepted, auto-reject other pending applications by this worker for the same gig
    if (status === "accepted") {
      try {
        const otherApps = await this._applicationRepo.findByGigIdAndWorkerId(
          app.gigId.toString(),
          app.workerId.toString()
        );
        for (const otherApp of otherApps) {
          if (otherApp._id.toString() !== applicationId && otherApp.status === "pending") {
            await this._applicationRepo.update(otherApp._id.toString(), { status: "rejected" });
          }
        }
      } catch (err) {
        console.error("Failed to auto-reject other applications for the same gig:", err);
      }

      // Check if all roles of this gig are fully filled
      try {
        const roles = await this._gigRoleRepo.findByGigId(app.gigId.toString());
        let allFilled = true;
        for (const role of roles) {
          const acceptedCount = await this._applicationRepo.findAcceptedCountForRole(role._id.toString());
          if (acceptedCount < role.spots) {
            allFilled = false;
            break;
          }
        }
        if (allFilled) {
          await this._gigRepo.update(app.gigId.toString(), { status: "completed" });
        }
      } catch (err) {
        console.error("Failed to transition gig to completed status:", err);
      }
    }

    return toGigApplicationDTO(updated);
  }

  async withdrawApplication(applicationId: string, workerId: string): Promise<boolean> {
    const app = await this._applicationRepo.findById(applicationId);
    if (!app) {
      throw new AppError("Application not found", 404);
    }

    if (app.workerId.toString() !== workerId) {
      throw new AppError("Unauthorized to withdraw this application", 403);
    }

    if (app.status !== "pending") {
      throw new AppError("Cannot withdraw an application that has already been accepted or rejected", 400);
    }

    const deleted = await this._applicationRepo.delete(applicationId);
    return !!deleted;
  }
}
