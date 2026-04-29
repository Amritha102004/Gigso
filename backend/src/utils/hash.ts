import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export class BcryptHashService implements IHashService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  async hash(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(plain, salt);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

// Singleton instances — one for passwords, one for OTPs (same behaviour, separate concern)
export const passwordHashService = new BcryptHashService();
export const otpHashService = new BcryptHashService();
