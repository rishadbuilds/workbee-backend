import { v4 as uuidv4 } from "uuid";
import { injectable } from "tsyringe";
import { RabbitMQConnection } from "../config/rabbitmq";
import { logger } from "../logger/logger";
import { IWorkerPasswordResetClient } from "../../application/ports/message-bus/IWorkerPasswordResetClient";
import {
    WorkerLookupResponseRMQDTO,
    WorkerResetPasswordResponseRMQDTO,
} from "../../application/dtos/worker/RMQ/WorkerPasswordResetRMQDTO";

/**
 * auth-service -> work-service 
 * forgot password: check the worker exists / is approved / is not blocked
 * reset password: hash + save the new password (worker schema lives in work-service)
 */

@injectable()
export class WorkerPasswordResetClient implements IWorkerPasswordResetClient {
    private readonly LOOKUP_QUEUE = "worker.forgot-password.request";
    private readonly RESET_QUEUE = "worker.reset-password.request";
    private readonly TIMEOUT = 10000; // 10 sec

    lookupWorker(email: string): Promise<WorkerLookupResponseRMQDTO> {
        return this.rpcCall<WorkerLookupResponseRMQDTO>(this.LOOKUP_QUEUE, { email });
    }

    resetPassword(workerId: string, newPassword: string): Promise<WorkerResetPasswordResponseRMQDTO> {
        return this.rpcCall<WorkerResetPasswordResponseRMQDTO>(this.RESET_QUEUE, { workerId, newPassword });
    }

    /** sends a request to requestQueue and waits for the reply on a private reply queue */
    private async rpcCall<TRes>(requestQueue: string, payload: object): Promise<TRes> {
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
            }, this.TIMEOUT);

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
}