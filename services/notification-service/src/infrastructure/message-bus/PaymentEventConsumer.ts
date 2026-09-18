import { injectable, inject } from "tsyringe";
import { ConsumeMessage } from "amqplib";
import { logger } from "../config/logger";
import { RabbitMQConnection } from "../config/rabbitmq";
import { SocketGateway } from "../socket/SocketGateway";
import { IPaymentCreditedEvent } from "../../domain/message-contracts/IPaymentCreditedEvent";
import { ICreateNotificationUseCase } from "../../application/ports/ICreateNotificationUseCase";

@injectable()
export class PaymentEventConsumer {
    
  private readonly EXCHANGE = "workbee.events";
  private readonly QUEUE = "notification.payment_credited";
  private readonly ROUTING_KEY = "payment.credited";

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

      logger.info(`Waiting for payment events in queue: ${this.QUEUE}`);

      channel.consume(this.QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event: IPaymentCreditedEvent = JSON.parse(msg.content.toString());
          await this.handlePaymentCredited(event);
          channel.ack(msg);
        } catch (error) {
          logger.error("Error processing payment credited event:", error);
          channel.nack(msg, false, false);
        }
      }, { noAck: false });
    } catch (error) {
      logger.error("Failed to start payment event consumer:", error);
      throw error;
    }
  }

  private async handlePaymentCredited(event: IPaymentCreditedEvent): Promise<void> {
    const notification = await this._createNotificationUseCase.execute({
      userId: event.workerId,
      type: "PAYMENT",
      title: "Payment Credited",
      message: `₹${event.amount} has been credited to your wallet for a completed work.`,
      data: {
        workId: event.workId,
        workerId: event.workerId,
      },
    });

    this.socketManager.emitNotificationToUser(event.workerId, notification);

    logger.info(`Payment notification sent to worker ${event.workerId}`);
  }
}