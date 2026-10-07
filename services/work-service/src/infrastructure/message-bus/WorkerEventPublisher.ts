import { injectable } from "tsyringe";
import { RabbitMQConnection } from "./RabbitMQInitializer";
import { logger } from "../logger/logger";
import { IWorkerEventPublisher } from "../../domain/message-bus/IWorkerEventPublisher";
import { IWorkerBlockedEvent } from "./types/types";

/**
 * inter serivce comm with [work-auth] : to delete refresh token after blocking worker
 * bublishing to inform auth service worker has been blocked
 */

@injectable()
export class WorkerEventPublisher implements IWorkerEventPublisher{
  private readonly EXCHANGE = "workbee.events";

  async publishWorkerBlocked(event: IWorkerBlockedEvent): Promise<void> {
    try {
      const channel = await RabbitMQConnection.getChannel();
      await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });

      const message = Buffer.from(JSON.stringify(event));
      channel.publish(this.EXCHANGE, "worker.blocked", message, {
        persistent: true,
        contentType: "application/json",
      });

      logger.info(`Published worker.blocked event for worker: ${event.workerId}, isBlocked: ${event.isBlocked}`);
    } catch (error) {
      logger.error("Failed to publish worker blocked event:", error);
      throw error;
    }
  }
}