import { v4 as uuidv4 } from "uuid";
import { injectable } from "tsyringe";
import { RabbitMQConnection } from "./RabbitMQInitializer";
import { logger } from "../logger/logger";
import { IUserDisputeActionClient,UserDisputeActionRequest,UserDisputeActionResponse, } from "../../domain/message-bus/IUserDisputeActionClient";

/** 
 * user dispute action client
 * - work service <-> auth service
 * - to manuplate client shema
 */

@injectable()
export class UserDisputeActionClient implements IUserDisputeActionClient {
  private readonly REQUEST_QUEUE = "user.dispute-action.request";
  private readonly RESPONSE_QUEUE = "user.dispute-action.response";
  private readonly TIMEOUT = 10000;

  async applyAction(request: UserDisputeActionRequest): Promise<UserDisputeActionResponse> {
    const channel = await RabbitMQConnection.getChannel();
    const correlationId = uuidv4();

    return new Promise(async (resolve, reject) => {
      let consumerTag: string | null = null;
      let isResolved = false;

      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          logger.error(`User dispute action timeout: ${correlationId}`);
          if (consumerTag) {
            channel.cancel(consumerTag).catch((err) => logger.error("Error canceling consumer:", err));
          }
          reject(new Error("User dispute action request timed out."));
        }
      }, this.TIMEOUT);

      try {
        await channel.assertQueue(this.REQUEST_QUEUE, { durable: true });
        await channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

        const consumer = await channel.consume(
          this.RESPONSE_QUEUE,
          (msg) => {
            if (!msg || isResolved) return;
            if (msg.properties.correlationId !== correlationId) return;

            isResolved = true;
            clearTimeout(timeoutId);

            try {
              const response: UserDisputeActionResponse = JSON.parse(msg.content.toString());
              channel.ack(msg);
              channel.cancel(consumer.consumerTag).catch((err) => logger.error("Error canceling consumer:", err));
              resolve(response);
            } catch (error) {
              channel.ack(msg);
              logger.error(error);
              reject(new Error("Invalid dispute action response."));
            }
          },
          { noAck: false }
        );

        consumerTag = consumer.consumerTag;

        channel.sendToQueue(
          this.REQUEST_QUEUE,
          Buffer.from(JSON.stringify({ ...request, correlationId })),
          { correlationId, persistent: true }
        );

        logger.info(`User dispute action request sent: ${correlationId}`);
      } catch (error) {
        isResolved = true;
        clearTimeout(timeoutId);
        if (consumerTag) await channel.cancel(consumerTag).catch(() => {});
        reject(error);
      }
    });
  }
}