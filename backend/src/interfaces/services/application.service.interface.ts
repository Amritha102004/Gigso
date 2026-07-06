import type { IGigApplication } from "../application.interface";

export interface IApplicationService {
  applyForGigRole(workerId: string, gigId: string, roleId: string): Promise<IGigApplication>;
  getWorkerApplications(workerId: string, status?: string): Promise<IGigApplication[]>;
  getGigApplications(gigId: string, ownerId: string): Promise<IGigApplication[]>;
  updateApplicationStatus(
    applicationId: string,
    ownerId: string,
    status: "accepted" | "rejected"
  ): Promise<IGigApplication>;
}
