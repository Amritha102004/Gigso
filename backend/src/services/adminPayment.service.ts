import type { PaymentRepository } from "../repositories/payment.repository";
import type { WorkerPaymentRepository } from "../repositories/workerPayment.repository";
import type { GigRepository } from "../repositories/gig.repository";
import type { UserRepository } from "../repositories/user.repository";
import type { GigApplicationRepository } from "../repositories/application.repository";
import type { IPayment } from "../interfaces/payment.interface";
import type { IWorkerPayment } from "../interfaces/workerPayment.interface";

export class AdminPaymentService {
  constructor(
    private _paymentRepo: PaymentRepository,
    private _workerPaymentRepo: WorkerPaymentRepository,
    private _gigRepo: GigRepository,
    private _userRepo: UserRepository,
    private _appRepo: GigApplicationRepository
  ) {}

  async getDashboardStats(): Promise<{
    stats: { totalVolume: number; totalCommission: number; totalNetDistributed: number };
    recentTransactions: IPayment[];
  }> {
    const stats = await this._paymentRepo.getAdminStats();
    const recentTransactions = await this._paymentRepo.getAdminRecentTransactions(5);
    return { stats, recentTransactions };
  }

  async getTransactionsList(
    searchQuery: string,
    statusFilter: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    transactions: IPayment[];
    total: number;
    summaries: { monthlyVolume: number; averagePlatformFee: number; pendingPayouts: number };
  }> {
    let matchedGigIds: string[] | undefined = undefined;

    if (searchQuery) {
      matchedGigIds = await this._gigRepo.findGigIdsByTitle(searchQuery);
    }

    const { transactions, total } = await this._paymentRepo.getAdminTransactionsList(
      searchQuery,
      statusFilter,
      page,
      limit,
      matchedGigIds
    );

    const summaries = await this._paymentRepo.getAdminTransactionsSummaries();

    return { transactions, total, summaries };
  }

  async getTransactionDetails(paymentId: string): Promise<{
    payment: IPayment;
    workerPayments: IWorkerPayment[];
  }> {
    const payment = await this._paymentRepo.findById(paymentId);
    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Populate manually if needed or retrieve with populate
    const populatedPayment = await (payment as any).populate([
      { path: "gigId" },
      { path: "ownerId", select: "name email phone businessName" }
    ]);

    // Fetch worker payments for this session/invoice
    const workerPayments = await this._workerPaymentRepo.findOne({ paymentId: payment._id } as any)
      ? await (this._workerPaymentRepo as any)._model.find({ paymentId: payment._id })
          .populate("workerId", "name email phone profileImage")
          .populate("roleId", "roleName payPerPerson")
          .exec()
      : [];

    return {
      payment: populatedPayment,
      workerPayments,
    };
  }
}
