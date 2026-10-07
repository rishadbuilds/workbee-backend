import { v4 as uuidv4 } from "uuid";
import { injectable } from "tsyringe";
import { RabbitMQConnection } from "./RabbitMQInitializer";
import { logger } from "../logger/logger";
import { IGetUserProfileRpcClient, UserProfileRpcResponse } from "../../domain/message-bus/IGetUserProfileRpcClient";

/**
 * get use profile client workservice <-> auth service
 * - to get dispute id in dispute handling
 */

@injectable()
export class GetUserProfileRpcClient implements IGetUserProfileRpcClient {
  private readonly REQUEST_QUEUE = "user.profile.request";
  private readonly RESPONSE_QUEUE = "user.profile.response";
  private readonly TIMEOUT = 8000;

  async getUserProfile(userId: string): Promise<UserProfileRpcResponse> {
    const channel = await RabbitMQConnection.getChannel();
    const correlationId = uuidv4();

    return new Promise(async (resolve, reject) => {
      let consumerTag: string | null = null;
      let isResolved = false;

      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          logger.error(`User profile RPC timeout: ${correlationId}`);
          if (consumerTag) channel.cancel(consumerTag).catch(() => {});
          resolve({ success: false, error: "User profile request timed out." });
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
              const response: UserProfileRpcResponse = JSON.parse(msg.content.toString());
              channel.ack(msg);
              channel.cancel(consumer.consumerTag).catch(() => {});
              resolve(response);
            } catch (error) {
              channel.ack(msg);
              logger.error(error);
              resolve({ success: false, error: "Invalid user profile response." });
            }
          },
          { noAck: false }
        );

        consumerTag = consumer.consumerTag;

        channel.sendToQueue(
          this.REQUEST_QUEUE,
          Buffer.from(JSON.stringify({ userId, correlationId })),
          { correlationId, persistent: true }
        );
      } catch (error) {
        isResolved = true;
        clearTimeout(timeoutId);
        if (consumerTag) await channel.cancel(consumerTag).catch(() => {});
        reject(error);
      }
    });
  }
}