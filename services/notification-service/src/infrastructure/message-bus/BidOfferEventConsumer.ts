import { injectable, inject } from "tsyringe";
import { ConsumeMessage } from "amqplib";
import { UserRole } from "workbee-common";
import { logger } from "../config/logger";
import { RabbitMQConnection } from "../config/rabbitmq";
import { SocketGateway } from "../socket/SocketGateway";
import { IBidOfferEvent } from "../../domain/message-contracts/IBidOfferEvent";
import { ICreateNotificationUseCase } from "../../application/ports/ICreateNotificationUseCase";
import { SenderRole } from "../../application/dtos/CreateNotificationDTO";

@injectable()
export class BidOfferEventConsumer {
    private readonly EXCHANGE = "workbee.events";
    private readonly QUEUE = "notification.bid_offer";
    private readonly ROUTING_KEY = "bid.offer";

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

            logger.info(`Waiting for bid offer events in queue: ${this.QUEUE}`);

            channel.consume(this.QUEUE, async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const event: IBidOfferEvent = JSON.parse(msg.content.toString());
                    await this.handleBidOffer(event);
                    channel.ack(msg);
                } catch (error) {
                    logger.error("Error processing bid offer event:", error);
                    channel.nack(msg, false, false);
                }
            }, { noAck: false });
        } catch (error) {
            logger.error("Failed to start bid offer consumer:", error);
            throw error;
        }
    }

    private async handleBidOffer(event: IBidOfferEvent): Promise<void> {
        const isCounter = event.offeredBy === UserRole.USER;

        const senderRole: SenderRole =
            event.offeredBy === UserRole.WORKER ? UserRole.WORKER : UserRole.USER;

        const notification = await this._createNotificationUseCase.execute({
            userId: event.recipientId,
            type: "BID_OFFER",
            title: isCounter ? "Counter Offer Received" : "New Bid Offer",
            message: `${event.senderName} ${isCounter ? "countered with" : "offered"} ₹${event.amount} for "${event.workTitle}".`,
            data: {
                chatId: event.chatId,
                workId: event.workId,
                bidId: event.bidId,
                senderName: event.senderName,
                senderRole, 
                amount: event.amount,
            },
        });

        this.socketManager.emitNotificationToUser(event.recipientId, notification);

        logger.info(`Bid offer notification sent to ${event.recipientRole} ${event.recipientId}`);
    }
}