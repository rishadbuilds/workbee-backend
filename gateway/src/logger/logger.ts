import winston from "winston";
import { ENV } from "../config/env";
import { LogstashTransport } from "./LogstashTransport";

const { combine, timestamp, errors, colorize, printf } = winston.format;

const isProduction = ENV.NODE_ENV === "production";

const consoleTransport = new winston.transports.Console({
  format: isProduction
    ? combine(
        timestamp(),
        errors({ stack: true }),
        winston.format.json()
      )
    : combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        printf(({ timestamp, level, message, stack, service }) => {
          return `[${timestamp}] [${service}] ${level}: ${
            stack ?? message
          }`;
        })
      ),
});

const transports: winston.transport[] = [consoleTransport];

if (ENV.LOGSTASH_HOST && ENV.LOGSTASH_PORT) {
  transports.push(
    new LogstashTransport({
      host: ENV.LOGSTASH_HOST,
      port: Number(ENV.LOGSTASH_PORT),
    })
  );
}

export const logger = winston.createLogger({
  level: ENV.LOG_LEVEL || (isProduction ? "info" : "debug"),

  defaultMeta: {
    service: ENV.SERVICE_NAME,
  },

  transports,
});