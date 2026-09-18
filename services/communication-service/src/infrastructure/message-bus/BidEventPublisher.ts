import { injectable } from 'tsyringe';
import { RabbitMQConnection } from '../config/rabbitmq';
import { IBidOfferEvent } from '../../domain/message-contracts/IBidOfferEvent';
import { logger } from '../logger/logger';
import { IBidResponseEvent } from '../../domain/message-contracts/IBidResponseEvent';

@injectable()
export class BidEventPublisher {
    private readonly EXCHANGE = 'workbee.events';
    private readonly ROUTING_KEY = 'bid.offer';

    async publishBidOffer(event: IBidOfferEvent): Promise<void> {
        try {
            const channel = await RabbitMQConnection.getChannel();

            await channel.assertExchange(this.EXCHANGE, 'topic', { durable: true });

            const message = Buffer.from(JSON.stringify(event));
            channel.publish(this.EXCHANGE, this.ROUTING_KEY, message, {
                persistent: true,
                contentType: 'application/json',
            });

            logger.info(`Published bid offer event for recipient: ${event.recipientId}`);
        } catch (error) {
            logger.error('Failed to publish bid offer event:', error);
        }
    }

    private readonly RESPONSE_ROUTING_KEY = 'bid.response';

    async publishBidResponse(event: IBidResponseEvent): Promise<void> {
        try {
            const channel = await RabbitMQConnection.getChannel();

            await channel.assertExchange(this.EXCHANGE, 'topic', { durable: true });

            const message = Buffer.from(JSON.stringify(event));
            channel.publish(this.EXCHANGE, this.RESPONSE_ROUTING_KEY, message, {
                persistent: true,
                contentType: 'application/json',
            });

            logger.info(`Published bid response event for recipient: ${event.recipientId}`);
        } catch (error) {
            logger.error('Failed to publish bid response event:', error);
        }
    }
}