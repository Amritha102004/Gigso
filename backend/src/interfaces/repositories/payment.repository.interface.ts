import type { IBaseRepository } from "./base.repository.interface";
import type { IPayment } from "../payment.interface";
import type { IWorkerPayment } from "../workerPayment.interface";

export interface IPaymentRepository extends IBaseRepository<IPayment> {
  findByOwnerId(ownerId: string): Promise<IPayment[]>;
  findByGigId(gigId: string): Promise<IPayment | null>;
  findByTransactionId(transactionId: string): Promise<IPayment | null>;
  atomicallyMarkAsPaid(transactionId: string): Promise<IPayment | null>;
  countTotalSpentForOwner(ownerId: string, startDate?: Date): Promise<number>;
  getAdminStats(startDate?: Date): Promise<{ totalVolume: number; totalCommission: number; totalNetDistributed: number }>;
  getAdminRecentTransactions(limit?: number): Promise<IPayment[]>;
  getAdminTransactionsList(
    searchQuery: string,
    statusFilter: string,
    page: number,
    limit: number,
    gigIds?: string[]
  ): Promise<{ transactions: IPayment[]; total: number }>;
  getAdminTransactionsSummaries(): Promise<{ monthlyVolume: number; averagePlatformFee: number; pendingPayouts: number }>;
}

export interface IWorkerPaymentRepository extends IBaseRepository<IWorkerPayment> {
  findByWorkerId(workerId: string): Promise<IWorkerPayment[]>;
  countTotalEarningsForWorker(workerId: string, startDate?: Date): Promise<number>;
  findDetailsByPaymentId(paymentId: string): Promise<IWorkerPayment[]>;
}
