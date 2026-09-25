import Redis from "ioredis";
import { logger } from "../logger/logger";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    // redisClient = new Redis({
    //   host: process.env.REDIS_HOST,
    //   port: Number(process.env.REDIS_PORT),
    //   password: process.env.REDIS_PASSWORD
    // });

    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      tls: {},
    });

    redisClient.on("connect", () => logger.info("Gateway Redis connected"));
    redisClient.on("error", (err) => logger.error("Gateway Redis error:", err));
  }
  return redisClient;
};






