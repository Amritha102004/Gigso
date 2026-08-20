import { Types } from "mongoose";
import { WorkerPaymentModel } from "../models/workerPayment.model";
import type { IWorkerPayment } from "../interfaces/workerPayment.interface";
import { BaseRepository } from "./base.repository";

export class WorkerPaymentRepository extends BaseRepository<IWorkerPayment> {
  constructor() {
    super(WorkerPaymentModel);
  }

  async findByWorkerId(workerId: string): Promise<IWorkerPayment[]> {
    return await this._model.find({ workerId })
      .populate({
        path: "paymentId",
        populate: { path: "gigId" }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPaymentId(paymentId: string): Promise<IWorkerPayment[]> {
    return await this._model.find({ paymentId }).exec();
  }

  async countTotalEarningsForWorker(workerId: string, startDate?: Date): Promise<number> {
    const match: any = { workerId: new Types.ObjectId(workerId), paymentStatus: "paid" };
    if (startDate) {
      match.createdAt = { $gte: startDate };
    }
    const result = await this._model.aggregate([
      { $match: match },
      { $group: { _id: null, totalEarnings: { $sum: "$totalPay" } } }
    ]).exec();
    return result[0]?.totalEarnings || 0;
  }
}
