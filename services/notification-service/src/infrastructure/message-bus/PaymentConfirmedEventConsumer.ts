import { injectable, inject } from "tsyringe";
import { ConsumeMessage } from "amqplib";
import { logger } from "../config/logger";
import { RabbitMQConnection } from "../config/rabbitmq";
import { SocketGateway } from "../socket/SocketGateway";
import { IPaymentConfirmedEvent } from "../../domain/message-contracts/IPaymentConfirmedEvent";
import { ICreateNotificationUseCase } from "../../application/ports/ICreateNotificationUseCase";

@injectable()
export class PaymentConfirmedEventConsumer {
  private readonly EXCHANGE = "workbee.events";
  private readonly QUEUE = "notification.payment_confirmed";
  private readonly ROUTING_KEY = "payment.confirmed";

  constructor(
    @inject("CreateNotificationUseCase") private readonly _createNotificationUseCase: ICreateNotificationUseCase,
    @inject("SocketManager") private readonly socketManager: SocketGateway
  ) { }

  async start(): Promise<void> {
    try {
      const channel = await RabbitMQConnection.getChannel();

      await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });
      await channel.assertQueue(this.QUEUE, { durable: true });
      await channel.bindQueue(this.QUEUE, this.EXCHANGE, this.ROUTING_KEY);

      logger.info(`Waiting for payment confirmed events in queue: ${this.QUEUE}`);

      channel.consume(this.QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event: IPaymentConfirmedEvent = JSON.parse(msg.content.toString());
          await this.handlePaymentConfirmed(event);
          channel.ack(msg);
        } catch (error) {
          logger.error("Error processing payment confirmed event:", error);
          channel.nack(msg, false, false);
        }
      }, { noAck: false });
    } catch (error) {
      logger.error("Failed to start payment confirmed consumer:", error);
      throw error;
    }
  }

  private async handlePaymentConfirmed(event: IPaymentConfirmedEvent): Promise<void> {
    const notification = await this._createNotificationUseCase.execute({
      userId: event.workerId,
      type: "PAYMENT",
      title: "Payment Confirmed",
      message: "The client has confirmed and completed payment. Please start work on time to maintain a good reputation.",
      data: {
        workId: event.workId,
        workerId: event.workerId,
      },
    });

    this.socketManager.emitNotificationToUser(event.workerId, notification);

    logger.info(`Payment confirmed notification sent to worker ${event.workerId}`);
  }
}