import { injectable, inject } from "tsyringe";
import { RabbitMQConnection } from "../config/rabbitmq";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { logger } from "../logger/logger";
import { UserProfileRpcRequestMsg } from "./types/types";

/**
 * RabbitMQ RPC consumer responsible for fetching user profile data
 * requested by communication service
 */

@injectable()
export class UserProfileRpcConsumer {
  private readonly REQUEST_QUEUE = "user.profile.request";
  private readonly RESPONSE_QUEUE = "user.profile.response";

  constructor(@inject("UserRepository") private readonly _userRepository: IUserRepository) {}

  async start(): Promise<void> {
    const channel = await RabbitMQConnection.getChannel();
    await channel.assertQueue(this.REQUEST_QUEUE, { durable: true });
    await channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

    logger.info(`UserProfileRpcConsumer listening on ${this.REQUEST_QUEUE}`);

    channel.consume(
      this.REQUEST_QUEUE,
      async (msg) => {
        if (!msg) return;
        let request: UserProfileRpcRequestMsg | undefined;
        try {
          request = JSON.parse(msg.content.toString());
          const user = await this._userRepository.findById(request!.userId);

          const response = user
            ? {
                success: true,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  userProfileImage: user.userProfileImage,
                  isBlocked: !!user.isBlocked,
                  isBlacklisted: !!user.isBlacklisted,
                },
              }
            : { success: false, error: "User not found." };

          channel.sendToQueue(this.RESPONSE_QUEUE, Buffer.from(JSON.stringify(response)), {
            correlationId: request!.correlationId,
            persistent: true,
          });
          channel.ack(msg);
        } catch (error) {
          logger.error("User profile RPC error:", error);
          if (request?.correlationId) {
            channel.sendToQueue(
              this.RESPONSE_QUEUE,
              Buffer.from(JSON.stringify({ success: false, error: "Failed to fetch user profile." })),
              { correlationId: request.correlationId, persistent: true }
            );
          }
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }
}