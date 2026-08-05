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
}
