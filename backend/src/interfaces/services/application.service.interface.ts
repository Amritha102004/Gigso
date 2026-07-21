import type { GigApplicationDTO } from "../../dtos/application.dto";

export interface IApplicationService {
  applyForGigRole(workerId: string, gigId: string, roleId: string): Promise<GigApplicationDTO>;
  getWorkerApplications(workerId: string, status?: string): Promise<GigApplicationDTO[]>;
  getGigApplications(gigId: string, ownerId: string): Promise<GigApplicationDTO[]>;
  updateApplicationStatus(
    applicationId: string,
    ownerId: string,
    status: "accepted" | "rejected"
  ): Promise<GigApplicationDTO>;
  withdrawApplication(applicationId: string, workerId: string): Promise<boolean>;
}
