import { v4 as uuidv4 } from "uuid";
import { RabbitMQConnection } from "../config/rabbitmq";
import { logger } from "../logger/logger";

/** 
 * Remote Procedure Call
 * Service A needs an immediate answer from Service B.when comm imp det
 */

export async function rpcCall<TRes>(
    requestQueue: string,
    payload: object,
    timeoutMs = 10000
): Promise<TRes> {
    const channel = await RabbitMQConnection.getChannel();
    const correlationId = uuidv4();

    await channel.assertQueue(requestQueue, { durable: true });
    const { queue: replyQueue } = await channel.assertQueue("", { exclusive: true, autoDelete: true });

    return new Promise<TRes>((resolve, reject) => {
        let consumerTag: string | undefined;
        let settled = false;

        const finish = (fn: () => void) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (consumerTag) {
                channel.cancel(consumerTag).catch(err => logger.error("Error canceling consumer:", err));
            }
            fn();
        };

        const timer = setTimeout(() => {
            logger.error(`RPC timeout on ${requestQueue}: ${correlationId}`);
            finish(() => reject(new Error("Request timed out. Please try again.")));
        }, timeoutMs);

        channel
            .consume(
                replyQueue,
                (msg) => {
                    if (!msg || msg.properties.correlationId !== correlationId) return;
                    try {
                        const response = JSON.parse(msg.content.toString()) as TRes;
                        finish(() => resolve(response));
                    } catch (err) {
                        logger.error("Error parsing RPC response:", err);
                        finish(() => reject(new Error("Invalid response format")));
                    }
                },
                { noAck: true }
            )
            .then((consumer) => {
                consumerTag = consumer.consumerTag;
                if (settled) {
                    channel.cancel(consumerTag).catch(() => { });
                    return;
                }
                channel.sendToQueue(
                    requestQueue,
                    Buffer.from(JSON.stringify({ ...payload, correlationId })),
                    { correlationId, replyTo: replyQueue, persistent: true }
                );
                logger.info(`RPC sent to ${requestQueue}: ${correlationId}`);
            })
            .catch((err) => finish(() => reject(err)));
    });
}