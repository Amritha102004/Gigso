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
}
