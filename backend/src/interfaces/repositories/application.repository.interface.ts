import type { IBaseRepository } from "./base.repository.interface";
import type { IGigApplication } from "../application.interface";

export interface IGigApplicationRepository extends IBaseRepository<IGigApplication> {
  findByWorkerId(workerId: string, status?: string): Promise<IGigApplication[]>;
  findByGigId(gigId: string): Promise<IGigApplication[]>;
  findByGigIdAndWorkerId(gigId: string, workerId: string): Promise<IGigApplication[]>;
  findPendingCountForGig(gigId: string): Promise<number>;
  findAcceptedCountForRole(roleId: string): Promise<number>;
  getCountsForGigs(gigIds: string[]): Promise<{ gigId: string; pendingCount: number; acceptedCount: number }[]>;
}
