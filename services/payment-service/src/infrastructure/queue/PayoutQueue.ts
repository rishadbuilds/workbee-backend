import { Queue, Worker, Job } from "bullmq";
import { container } from "tsyringe";
import { ReleaseWorkerPayoutUseCase } from "../../application/use-cases/worker/ReleaseWorkerPayoutUseCase";
import { ENV } from "../config/env";
import { logger } from "../logger/logger";

const REDIS_CONNECTION = {
  host: ENV.REDIS_HOST,
  port: Number(ENV.REDIS_PORT),
  password: ENV.REDIS_PASSWORD,
  tls: {}, 
};

const QUEUE_NAME = "worker-payout";
const DELAY_MS = 60 * 1000;

let payoutQueue: Queue | null = null;
let payoutWorker: Worker | null = null;

export const getPayoutQueue = (): Queue => {
  if (!payoutQueue) {
    payoutQueue = new Queue(QUEUE_NAME, {
      connection: REDIS_CONNECTION,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
    logger.info("[PayoutQueue] Queue created");
  }
  return payoutQueue;
};

export const scheduleWorkerPayout = async (paymentId: string): Promise<void> => {
  const queue = getPayoutQueue();
  await queue.add("release-payout", { paymentId }, { delay: DELAY_MS });
  logger.info(`[PayoutQueue] Scheduled payout for payment ${paymentId} in 1 hour`);
};

export const startPayoutWorker = (): void => {
  payoutWorker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const { paymentId } = job.data;
      logger.info(`[PayoutWorker] Processing payout for payment ${paymentId}`);
      try {
        const releaseUseCase = container.resolve(ReleaseWorkerPayoutUseCase);
        await releaseUseCase.execute({ paymentId });
        logger.info(`[PayoutWorker] Payout complete for payment ${paymentId}`);
      } catch (error) {
        logger.error(`[PayoutWorker] Failed payout for payment ${paymentId}`);
        console.error(error);
        throw error;
      }
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 5,
    }
  );

  payoutWorker.on("completed", (job) => {
    logger.info(`[PayoutWorker] Job ${job.id} completed`);
  });

  payoutWorker.on("failed", (job, err) => {
    logger.error(`[PayoutWorker] Job ${job?.id} failed:`, err.message);
  });

  logger.info("[PayoutWorker] Worker started, listening for payout jobs");
};