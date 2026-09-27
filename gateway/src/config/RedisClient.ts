import Redis from "ioredis";
import { logger } from "../logger/logger";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {

    // redisClient = new Redis({
    //   host: process.env.REDIS_HOST,
    //   port: Number(process.env.REDIS_PORT),
    //   password: process.env.REDIS_PASSWORD,
    //   tls: {},
    // });

    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,

      ...(process.env.REDIS_TLS === 'true' ? { tls: {} } : {}),

      db: 0,

      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("connect", () => logger.info("Gateway Redis connected"));
    redisClient.on("error", (err) => logger.error("Gateway Redis error:", err));
  }
  return redisClient;
};






