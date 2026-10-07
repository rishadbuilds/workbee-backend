import { injectable, inject } from "tsyringe";
import { RabbitMQConnection } from "../config/rabbitmq";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IEmailService } from "../../domain/services/IEmailService";
import { logger } from "../logger/logger";
import { UserDisputeActionRequest, UserDisputeActionResponse } from "./types/types";

/**
 * rabbitmq consumer responsible for processing user actions
 * requested by the work service through inter-service messaging.
 */

@injectable()
export class UserDisputeActionConsumer {
  private readonly REQUEST_QUEUE = "user.dispute-action.request";
  private readonly RESPONSE_QUEUE = "user.dispute-action.response";

  constructor(
    @inject("UserRepository") private readonly _userRepository: IUserRepository,
    @inject("EmailService") private readonly _emailService: IEmailService
  ) {}

  async start(): Promise<void> {
    const channel = await RabbitMQConnection.getChannel();

    await channel.assertQueue(this.REQUEST_QUEUE, { durable: true });
    await channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

    logger.info(`UserDisputeActionConsumer listening on ${this.REQUEST_QUEUE}`);

    channel.consume(
      this.REQUEST_QUEUE,
      async (msg) => {
        if (!msg) return;

        let request: UserDisputeActionRequest | undefined;
        try {
          request = JSON.parse(msg.content.toString());
          const response = await this.handleAction(request!);

          channel.sendToQueue(this.RESPONSE_QUEUE, Buffer.from(JSON.stringify(response)), {
            correlationId: request!.correlationId,
            persistent: true,
          });
          channel.ack(msg);
        } catch (error) {
          logger.error("User dispute action error:", error);
          const response: UserDisputeActionResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to apply user dispute action",
          };
          if (request?.correlationId) {
            channel.sendToQueue(this.RESPONSE_QUEUE, Buffer.from(JSON.stringify(response)), {
              correlationId: request.correlationId,
              persistent: true,
            });
          }
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  private async handleAction(request: UserDisputeActionRequest): Promise<UserDisputeActionResponse> {
    const { userId, actionType, reason } = request;
    const user = await this._userRepository.findById(userId);
    if (!user) return { success: false, error: "User not found." };

    switch (actionType) {
      case "block":
        await this._userRepository.save({ ...user, isBlocked: true });
        break;
      case "unblock":
        await this._userRepository.save({ ...user, isBlocked: false });
        break;
      case "blacklist":
        await this._userRepository.save({
          ...user,
          isBlacklisted: true,
          isBlocked: true,
          blacklistReason: reason,
          blacklistedAt: new Date(),
        });
        if (user.email) await this._emailService.sendBlacklistedEmail(user.email, user.name, reason);
        break;
      case "unblacklist":
        await this._userRepository.save({ ...user, isBlacklisted: false });
        break;
      case "warning_email":
        if (user.email) await this._emailService.sendWarningEmail(user.email, user.name, reason);
        break;
      default:
        return { success: false, error: "Unknown action type." };
    }

    return { success: true, message: "Action applied successfully." };
  }
}