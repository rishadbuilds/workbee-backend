import { Otp } from "../entities/Otp";

/**
 * Storage-agnostic contract for OTP persistence.
 * Only one active OTP exists per user: saving again replaces the old one.
 */

export interface IOtpRepository {
  save(otp: Otp): Promise<Otp>;
  findByUserId(userId: string): Promise<Otp | null>;
  deleteByUserId(userId: string): Promise<void>;
}