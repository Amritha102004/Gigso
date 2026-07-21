import type { IOtp, OtpType } from "../models/otp.model";
import { OtpModel } from "../models/otp.model";
import type { IOtpRepository } from "../interfaces/repositories/otp.repository.interface";
import { BaseRepository } from "./base.repository";

export class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository {
  constructor() {
    super(OtpModel);
  }

  async upsertOtp(
    email: string,
    hashedOtp: string,
    type: OtpType,
    expiresAt: Date,
    userData?: Record<string, any>
  ): Promise<IOtp | null> {
    return this._model.findOneAndUpdate(
      { email, type },
      {
        email,
        hashedOtp,
        type,
        userData: userData || null,
        otpExpiresAt: expiresAt,
        expiresAt: expiresAt,
      },
      { upsert: true, new: true }
    ).exec();
  }

  async findOtpByEmailAndType(email: string, type: OtpType): Promise<IOtp | null> {
    return this._model.findOne({ email, type }).exec();
  }

  async deleteOtp(email: string, type: OtpType): Promise<void> {
    await this._model.deleteOne({ email, type }).exec();
  }
}
