import { injectable, inject } from "tsyringe";
import { ConsumeMessage } from "amqplib";
import { logger } from "../config/logger";
import { RabbitMQConnection } from "../config/rabbitmq";
import { SocketGateway } from "../socket/SocketGateway";
import { IBidResponseEvent } from "../../domain/message-contracts/IBidResponseEvent";
import { ICreateNotificationUseCase } from "../../application/ports/ICreateNotificationUseCase";

@injectable()
export class BidResponseEventConsumer {
  private readonly EXCHANGE = "workbee.events";
  private readonly QUEUE = "notification.bid_response";
  private readonly ROUTING_KEY = "bid.response";

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

      logger.info(`Waiting for bid response events in queue: ${this.QUEUE}`);

      channel.consume(this.QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event: IBidResponseEvent = JSON.parse(msg.content.toString());
          await this.handleBidResponse(event);
          channel.ack(msg);
        } catch (error) {
          logger.error("Error processing bid response event:", error);
          channel.nack(msg, false, false);
        }
      }, { noAck: false });
    } catch (error) {
      logger.error("Failed to start bid response consumer:", error);
      throw error;
    }
  }

  private async handleBidResponse(event: IBidResponseEvent): Promise<void> {
    const accepted = event.action === "accept";

    const notification = await this._createNotificationUseCase.execute({
      userId: event.recipientId,
      type: "BID_RESPONSE",
      title: accepted ? "Offer Accepted" : "Offer Rejected",
      message: accepted
        ? `${event.responderName} accepted your offer of ₹${event.amount} for "${event.workTitle}".`
        : `${event.responderName} rejected your offer of ₹${event.amount} for "${event.workTitle}".`,
      data: {
        chatId: event.chatId,
        workId: event.workId,
        bidId: event.bidId,
        senderName: event.responderName,
        senderRole: event.respondedBy,
        amount: event.amount,
      },
    });

    this.socketManager.emitNotificationToUser(event.recipientId, notification);

    logger.info(`Bid response notification sent to ${event.recipientRole} ${event.recipientId}`);
  }
}