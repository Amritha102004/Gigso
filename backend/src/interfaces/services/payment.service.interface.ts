import type { IPayment } from "../payment.interface";
import type { IWorkerPayment } from "../workerPayment.interface";

export interface PendingPaymentWorker {
  id: string;
  name: string;
  roleName: string;
  amount: number;
}

export interface PendingPaymentItem {
  id: string;
  title: string;
  totalBudget: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  workers: PendingPaymentWorker[];
}

export interface PendingWorkerPayoutItem {
  id: string;
  gigTitle: string;
  amount: number;
  eventDate?: string;
}

export interface IPaymentService {
  createStripeConnectAccount(workerId: string): Promise<string>;
  verifyStripeConnectStatus(workerId: string): Promise<{ completed: boolean; user?: any }>;
  createCheckoutSession(gigId: string, ownerId: string): Promise<string>;
  verifyAndProcessPayment(sessionId: string): Promise<IPayment>;
  getOwnerPayments(ownerId: string): Promise<IPayment[]>;
  getWorkerEarnings(workerId: string): Promise<IWorkerPayment[]>;
  getOwnerPaymentHistory(ownerId: string): Promise<{ payments: IPayment[]; pendingPayments: PendingPaymentItem[] }>;
  getWorkerEarningsHistory(workerId: string): Promise<{ payouts: IWorkerPayment[]; pendingPayouts: PendingWorkerPayoutItem[] }>;
}

export interface IAdminPaymentService {
  getDashboardStats(range?: string): Promise<any>;
  getTransactionsList(
    searchQuery: string,
    statusFilter: string,
    page?: number,
    limit?: number
  ): Promise<{
    transactions: IPayment[];
    total: number;
    summaries: { monthlyVolume: number; averagePlatformFee: number; pendingPayouts: number };
  }>;
  getTransactionDetails(paymentId: string): Promise<{
    payment: IPayment;
    workerPayments: IWorkerPayment[];
  }>;
}
