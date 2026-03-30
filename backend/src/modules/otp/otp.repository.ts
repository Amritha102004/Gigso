import { IOtp, OtpModel, OtpType } from "./otp.model";

export interface IOtpRepository {
  upsertOtp(
    email: string,
    hashedOtp: string,
    type: OtpType,
    expiresAt: Date,
    userData?: Record<string, any>
  ): Promise<IOtp | null>;
  findOtpByEmailAndType(email: string, type: OtpType): Promise<IOtp | null>;
  deleteOtp(email: string, type: OtpType): Promise<void>;
}

export class OtpRepository implements IOtpRepository {
  async upsertOtp(
    email: string,
    hashedOtp: string,
    type: OtpType,
    expiresAt: Date,
    userData?: Record<string, any>
  ): Promise<IOtp | null> {
    // TTL index uses expiresAt. Also define otpExpiresAt if needed logic-wise, 
    // but typically they can be the same. 
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
