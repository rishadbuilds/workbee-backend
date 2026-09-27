import { v4 as uuidv4 } from 'uuid';
import { WorkerLoginResponseRMQDTO } from '../../application/dtos/worker/WorkerLoginRMQDTO';
import { logger } from '../logger/logger';
import { IWorkerValidationClient } from '../../application/ports/message-bus/IWorkerValidationClient';
import { injectable } from 'tsyringe';
import { RabbitMQConnection } from '../config/rabbitmq';

/**
 * this is when the inter communication bw auth - work sevices when the worker login time want to check the worker is valid or not 
 * so check from auth service is the worker is verified or not
 */

@injectable()
export class WorkerValidationClient implements IWorkerValidationClient {
    private readonly REQUEST_QUEUE = 'worker.validate.request';
    private readonly RESPONSE_QUEUE = 'worker.validate.response';
    private readonly TIMEOUT = 10000; // 10 seconds

    async validateWorker(email: string, password: string): Promise<WorkerLoginResponseRMQDTO> {

        const channel = await RabbitMQConnection.getChannel();

        const correlationId = uuidv4();

        return new Promise(async (resolve, reject) => {
            let consumerTag: string | null = null;
            let isResolved = false;

            // Timeout handler
            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    logger.error(`Timeout for correlation: ${correlationId}`);

                    // Cancel consumer on timeout
                    if (consumerTag) {
                        channel.cancel(consumerTag).catch(err =>
                            logger.error("Error canceling consumer:", err)
                        );
                    }

                    reject(new Error("Worker validation timeout. Please try again."));
                }
            }, this.TIMEOUT);

            try {
                // Assert queues
                await channel.assertQueue(this.REQUEST_QUEUE, { durable: true });
                await channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

                // Create a NEW consumer for THIS request only
                const consumer = await channel.consume(this.RESPONSE_QUEUE, (msg) => {
                    if (!msg || isResolved) return;

                    // Only process matching correlationId
                    if (msg.properties.correlationId === correlationId) {
                        isResolved = true;
                        clearTimeout(timeoutId);

                        try {
                            const response = JSON.parse(msg.content.toString());

                            logger.info(`Received response for: ${correlationId}`, {
                                success: response.success
                            });
                            channel.ack(msg);
                            channel.cancel(consumer.consumerTag).catch(err =>
                                logger.error("Error canceling consumer:", err)
                            );
                            resolve(response);
                        } catch (parseError) {
                            logger.error("Error parsing response:", parseError);
                            channel.ack(msg);
                            reject(new Error("Invalid response format"));
                        }
                    } else {
                        // Acknowledge but ignore mismatched messages
                        logger.warn(`Ignoring message with wrong correlationId: ${msg.properties.correlationId}`);
                        channel.ack(msg);
                    }
                }, { noAck: false }
                );

                consumerTag = consumer.consumerTag;

                //  Send request after consumer is set up
                channel.sendToQueue(this.REQUEST_QUEUE, Buffer.from(JSON.stringify({ email, password, correlationId })), {
                    correlationId: correlationId,
                    persistent: true
                });

                logger.info(`Sent validation request: ${correlationId}`);

            } catch (error) {
                isResolved = true;
                clearTimeout(timeoutId);
                logger.error("RabbitMQ error:", error);

                if (consumerTag) {
                    channel.cancel(consumerTag).catch(err =>
                        logger.error("Error canceling consumer:", err)
                    );
                }
                reject(error);
            }
        });
    }
}
