import type { IApplicationService } from "../interfaces/services/application.service.interface";
import type { IGigApplicationRepository } from "../interfaces/repositories/application.repository.interface";
import type { IGigRepository, IGigRoleRepository } from "../interfaces/repositories/gig.repository.interface";
import type { IGigApplication } from "../interfaces/application.interface";
import type { IWorkerProfile } from "../interfaces/user.interface";
import { WorkerProfileModel } from "../models/workerProfile.model";
import { Types } from "mongoose";

export class ApplicationService implements IApplicationService {
  constructor(
    private _applicationRepo: IGigApplicationRepository,
    private _gigRepo: IGigRepository,
    private _gigRoleRepo: IGigRoleRepository
  ) {}

  async applyForGigRole(workerId: string, gigId: string, roleId: string): Promise<IGigApplication> {
    // 1. Verify gig exists and is active
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.status !== "active" || gig.isDeleted) {
      throw new Error("Gig not found or is no longer active for applications");
    }

    // 2. Verify role exists and matches gig
    const role = await this._gigRoleRepo.findById(roleId);
    if (!role || role.gigId.toString() !== gigId) {
      throw new Error("Specified role does not belong to this gig");
    }

    // 3. Prevent duplicate applications
    const existing = await this._applicationRepo.findByGigIdAndWorkerId(gigId, workerId);
    const hasAppliedToRole = existing.some((app) => app.roleId.toString() === roleId);
    if (hasAppliedToRole) {
      throw new Error("You have already applied for this role");
    }

    // 4. Create new application
    return await this._applicationRepo.create({
      gigId: new Types.ObjectId(gigId) as any,
      roleId: new Types.ObjectId(roleId) as any,
      workerId: new Types.ObjectId(workerId) as any,
      status: "pending",
      appliedAt: new Date(),
    } as any);
  }

  async getWorkerApplications(workerId: string, status?: string): Promise<IGigApplication[]> {
    return await this._applicationRepo.findByWorkerId(workerId, status);
  }

  async getGigApplications(
    gigId: string,
    ownerId: string
  ): Promise<{ application: IGigApplication; profile: IWorkerProfile | null }[]> {
    // Verify owner owns the gig
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId || gig.isDeleted) {
      const error: any = new Error("Gig not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }

    const applications = await this._applicationRepo.findByGigId(gigId);

    // Fetch profiles of applicants to attach bio, rating info to owner dashboard cards
    const workerIds = applications.map((app) => app.workerId._id || app.workerId);
    const profiles = await WorkerProfileModel.find({ userId: { $in: workerIds } }).exec();

    return applications.map((app) => {
      const applicantId = app.workerId._id?.toString() || app.workerId.toString();
      const profile = profiles.find((p) => p.userId.toString() === applicantId) || null;
      return {
        application: app,
        profile,
      };
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    ownerId: string,
    status: "accepted" | "rejected"
  ): Promise<IGigApplication> {
    // 1. Retrieve the application
    const app = await this._applicationRepo.findById(applicationId);
    if (!app) {
      const error: any = new Error("Application not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Retrieve and verify the gig owner
    const gig = await this._gigRepo.findById(app.gigId.toString());
    if (!gig || gig.ownerId.toString() !== ownerId || gig.isDeleted) {
      const error: any = new Error("Unauthorized to manage this application");
      error.statusCode = 403;
      throw error;
    }

    // 3. If accepting, check remaining spots
    if (status === "accepted") {
      const role = await this._gigRoleRepo.findById(app.roleId.toString());
      if (!role) {
        throw new Error("Associated role not found");
      }

      const acceptedCount = await this._applicationRepo.findAcceptedCountForRole(app.roleId.toString());
      if (acceptedCount >= role.spots) {
        throw new Error("This role is already fully staffed");
      }
    }

    // 4. Update and return status
    const updated = await this._applicationRepo.update(applicationId, { status } as any);
    if (!updated) {
      throw new Error("Failed to update application status");
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
            await this._applicationRepo.update(otherApp._id.toString(), { status: "rejected" } as any);
          }
        }
      } catch (err) {
        console.error("Failed to auto-reject other applications for the same gig:", err);
      }
    }

    return updated;
  }

  async withdrawApplication(applicationId: string, workerId: string): Promise<boolean> {
    const app = await this._applicationRepo.findById(applicationId);
    if (!app) {
      throw new Error("Application not found");
    }

    if (app.workerId.toString() !== workerId) {
      throw new Error("Unauthorized to withdraw this application");
    }

    if (app.status !== "pending") {
      throw new Error("Cannot withdraw an application that has already been accepted or rejected");
    }

    const deleted = await this._applicationRepo.delete(applicationId);
    return !!deleted;
  }
}
