import type { IOtp, OtpType } from "../../models/otp.model";
import type { IBaseRepository } from "./base.repository.interface";

export interface IOtpRepository extends IBaseRepository<IOtp> {
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
