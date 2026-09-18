/** 
* payment credited event publisher to worker notificaion service
*/

import { injectable } from "tsyringe";
import { RabbitMQConnection } from "../config/rabbitmq";
import { IWorkerPayoutCreditedEvent } from "../../domain/message-bus/IWorkerPayoutCreditedEvent";
import { logger } from "../logger/logger";
import { IEventPublisher } from "../../application/ports/message-bus/IEventPublisher";

@injectable()
export class EventPublisher implements IEventPublisher{
  private readonly EXCHANGE = "workbee.events";

  async publishWorkerPayoutCredited(event: IWorkerPayoutCreditedEvent): Promise<void> {
    try {
      const channel = await RabbitMQConnection.getChannel();

      await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });

      channel.publish(
        this.EXCHANGE,
        "payment.credited",
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      logger.info(`[EventPublisher] Published payment.credited for worker ${event.workerId}`);
    } catch (error) {
      logger.error("[EventPublisher] Failed to publish payment.credited:", error);
    }
  }
}