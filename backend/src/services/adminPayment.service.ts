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

  async getDashboardStats(range: string = "30"): Promise<any> {
    // 1. Calculate startDate based on range
    let startDate: Date | undefined = undefined;
    if (range && range !== "all") {
      const days = Number(range) || 30;
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    // 2. Fetch platform financial stats
    const revenueStats = await this._paymentRepo.getAdminStats(startDate);

    // 3. Count total users and Gigs
    const workersQuery: any = { role: "worker" };
    const ownersQuery: any = { role: "owner" };
    const gigsQuery: any = { isDeleted: false };

    if (startDate) {
      workersQuery.createdAt = { $gte: startDate };
      ownersQuery.createdAt = { $gte: startDate };
      gigsQuery.createdAt = { $gte: startDate };
    }

    const totalWorkers = await (this._userRepo as any)._model.countDocuments(workersQuery);
    const totalOwners = await (this._userRepo as any)._model.countDocuments(ownersQuery);
    const totalGigs = await (this._gigRepo as any)._model.countDocuments(gigsQuery);

    // 4. Fetch recent transactions
    const recentTransactions = await this._paymentRepo.getAdminRecentTransactions(5);

    // 5. Generate daily/monthly trend data for Gigs and Applicants
    const trends: any[] = [];
    const dateCount = range === "7" ? 7 : range === "all" ? 6 : 30;

    if (range === "all") {
      // Group by month for last 6 months
      for (let i = dateCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const gigs = await (this._gigRepo as any)._model.countDocuments({
          isDeleted: false,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const apps = await (this._appRepo as any)._model.countDocuments({
          appliedAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        trends.push({
          label: d.toLocaleString("default", { month: "short" }),
          gigs,
          applicants: apps
        });
      }
    } else {
      // Group by day for last 7 or 30 days
      for (let i = dateCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const startOfDay = new Date(d);
        const endOfDay = new Date(d);
        endOfDay.setHours(23, 59, 59, 999);

        const gigs = await (this._gigRepo as any)._model.countDocuments({
          isDeleted: false,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const apps = await (this._appRepo as any)._model.countDocuments({
          appliedAt: { $gte: startOfDay, $lte: endOfDay }
        });

        trends.push({
          label: d.toLocaleDateString("default", { month: "short", day: "numeric" }),
          gigs,
          applicants: apps
        });
      }
    }

    return {
      stats: {
        totalVolume: revenueStats.totalVolume,
        totalCommission: revenueStats.totalCommission,
        totalNetDistributed: revenueStats.totalNetDistributed,
        totalWorkers,
        totalOwners,
        totalGigs,
      },
      recentTransactions,
      trends
    };
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
