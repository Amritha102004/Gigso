import type { IGigApplication } from "../application.interface";
import type { IWorkerProfile } from "../user.interface";

export interface IApplicationService {
  applyForGigRole(workerId: string, gigId: string, roleId: string): Promise<IGigApplication>;
  getWorkerApplications(workerId: string, status?: string): Promise<IGigApplication[]>;
  getGigApplications(
    gigId: string,
    ownerId: string
  ): Promise<{ application: IGigApplication; profile: IWorkerProfile | null }[]>;
  updateApplicationStatus(
    applicationId: string,
    ownerId: string,
    status: "accepted" | "rejected"
  ): Promise<IGigApplication>;
}
