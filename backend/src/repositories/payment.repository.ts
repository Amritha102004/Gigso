import { PaymentModel } from "../models/payment.model";
import type { IPayment } from "../interfaces/payment.interface";
import { BaseRepository } from "./base.repository";

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(PaymentModel);
  }

  async findByOwnerId(ownerId: string): Promise<IPayment[]> {
    return await this._model.find({ ownerId })
      .populate("gigId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByGigId(gigId: string): Promise<IPayment | null> {
    return await this._model.findOne({ gigId }).exec();
  }

  async findByTransactionId(transactionId: string): Promise<IPayment | null> {
    return await this._model.findOne({ transactionId }).exec();
  }

  async atomicallyMarkAsPaid(transactionId: string): Promise<IPayment | null> {
    return await this._model.findOneAndUpdate(
      { transactionId, paymentStatus: "pending" },
      { $set: { paymentStatus: "paid", paidAt: new Date() } },
      { new: true }
    ).exec();
  }

  async getAdminStats(): Promise<{ totalVolume: number; totalCommission: number; totalNetDistributed: number }> {
    const result = await this._model.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$platformFee" },
        },
      },
    ]).exec();

    if (result.length > 0) {
      const totalVolume = result[0].totalVolume || 0;
      const totalCommission = result[0].totalCommission || 0;
      return {
        totalVolume,
        totalCommission,
        totalNetDistributed: totalVolume - totalCommission,
      };
    }
    return { totalVolume: 0, totalCommission: 0, totalNetDistributed: 0 };
  }

  async getAdminRecentTransactions(limit: number = 5): Promise<IPayment[]> {
    return await this._model.find()
      .populate("gigId")
      .populate("ownerId", "name email phone businessName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getAdminTransactionsList(
    searchQuery: string,
    statusFilter: string,
    page: number,
    limit: number,
    matchedGigIds?: string[]
  ): Promise<{ transactions: IPayment[]; total: number }> {
    const filter: any = {};

    // 1. Status Filter Mapping
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "completed") {
        filter.paymentStatus = "paid";
      } else if (statusFilter === "processing") {
        filter.paymentStatus = "pending";
      } else if (statusFilter === "refunded") {
        filter.paymentStatus = "failed";
      } else {
        filter.paymentStatus = statusFilter;
      }
    }

    // 2. Gig search mapping
    if (matchedGigIds && matchedGigIds.length > 0) {
      filter.gigId = { $in: matchedGigIds };
    } else if (searchQuery) {
      // If a search query was provided but no matched gig IDs, return empty
      return { transactions: [], total: 0 };
    }

    const total = await this._model.countDocuments(filter);
    const transactions = await this._model.find(filter)
      .populate("gigId")
      .populate("ownerId", "name email phone businessName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { transactions, total };
  }

  async getAdminTransactionsSummaries(): Promise<{ monthlyVolume: number; averagePlatformFee: number; pendingPayouts: number }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Sum paid transactions this month
    const monthlyResult = await this._model.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          volume: { $sum: "$totalAmount" },
        },
      },
    ]).exec();

    // Sum pending transactions
    const pendingResult = await this._model.aggregate([
      { $match: { paymentStatus: "pending" } },
      {
        $group: {
          _id: null,
          volume: { $sum: "$totalAmount" },
        },
      },
    ]).exec();

    const monthlyVolume = monthlyResult[0]?.volume || 0;
    const pendingPayouts = pendingResult[0]?.volume || 0;

    return {
      monthlyVolume,
      averagePlatformFee: 10.0, // Platform fee is a standard 10% constant rate in our system
      pendingPayouts,
    };
  }
}
