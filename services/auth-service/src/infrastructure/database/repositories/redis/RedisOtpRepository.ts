import { injectable } from "tsyringe";

import { IOtpRepository } from "../../../../domain/repositories/IOtpRepository";
import { Otp } from "../../../../domain/entities/Otp";
import RedisClient from "../../../config/RedisClient";


/**
 * storing otp in redis for cache/temporary storage
 */

/** Shape saved in Redis (dates are ISO strings because JSON has no Date type). */
interface StoredOtp {
  otp: string;
  expiresAt: string;
  createdAt: string;
}

const OTP_KEY_PREFIX = "otp:";

@injectable()
export class RedisOtpRepository implements IOtpRepository {
  private readonly redis = RedisClient.getInstance();

  private key(userId: string): string {
    return `${OTP_KEY_PREFIX}${userId}`;
  }

  async save(otp: Otp): Promise<Otp> {
    const createdAt = new Date();

    // Redis deletes the key by itself when the OTP expires
    const ttlSeconds = Math.ceil(
      (otp.expiresAt.getTime() - createdAt.getTime()) / 1000
    );

    if (ttlSeconds <= 0) {
      throw new Error("OTP expiry must be in the future");
    }

    const payload: StoredOtp = {
      otp: otp.otp,
      expiresAt: otp.expiresAt.toISOString(),
      createdAt: createdAt.toISOString(),
    };

    // SET overwrites any previous OTP for this user
    await this.redis.set(
      this.key(otp.userId),
      JSON.stringify(payload),
      "EX",
      ttlSeconds
    );

    return { ...otp, createdAt };
  }

  async findByUserId(userId: string): Promise<Otp | null> {
    const raw = await this.redis.get(this.key(userId));
    if (!raw) return null;

    const stored = JSON.parse(raw) as StoredOtp;

    return {
      userId,
      otp: stored.otp,
      expiresAt: new Date(stored.expiresAt),
      createdAt: new Date(stored.createdAt),
    };
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.redis.del(this.key(userId));
  }
}