import { IOtp, OtpModel, OtpType } from "../models/otp.model";
import { IOtpRepository } from "../interfaces/repositories/otp.repository.interface";
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
  
    return OtpModel.findOneAndUpdate(
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
    );
  }

  async findOtpByEmailAndType(email: string, type: OtpType): Promise<IOtp | null> {
    return OtpModel.findOne({ email, type });
  }

  async deleteOtp(email: string, type: OtpType): Promise<void> {
    await OtpModel.deleteOne({ email, type });
  }
}
