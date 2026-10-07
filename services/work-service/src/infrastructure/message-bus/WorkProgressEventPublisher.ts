import { injectable } from "tsyringe";
import { IWorkProgressChangedEvent } from "../../domain/message-bus/IWorkProgressChangedEvent";
import { RabbitMQConnection } from "./RabbitMQInitializer";
import { logger } from "../logger/logger";
import { IWorkProgressEventPublisher } from "../../domain/message-bus/IWorkProgressEventPublisher";

/** 
 * worker event publiser
 * work service <-> notificaion service 
 * to know the work changes and notify to users
 */

@injectable()
export class WorkProgressEventPublisher implements IWorkProgressEventPublisher {

    private readonly EXCHANGE = 'workbee.events';

    async publishWorkProgressChanged(event: IWorkProgressChangedEvent): Promise<void> {
        try {

            const channel = await RabbitMQConnection.getChannel()
            await channel.assertExchange(this.EXCHANGE, "topic", { durable: true })

            const message = Buffer.from(JSON.stringify(event))

            // publishing
            channel.publish(
                this.EXCHANGE,
                'work.progress.changed',
                message,
                { persistent: true, contentType: "application/json" }
            )

            logger.info(`[Work Event Publish] published work.progress.changed ${JSON.stringify(event)}`)


        } catch (error) {
            logger.error("[WorkProgressEventPublisher] Failed to publish work progress event:", error);

            throw error;
        }
    }
}