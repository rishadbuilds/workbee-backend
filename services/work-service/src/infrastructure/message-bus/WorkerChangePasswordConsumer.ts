import { Channel } from "amqplib";
import { injectable, inject } from "tsyringe";

import { IWorkerRepository } from "../../domain/repositories/IWorkerRepository";
import { IHashService } from "../../domain/services/IHashService";

import { logger } from "../logger/logger";
import { IWorkerChangePasswordConsumer } from "../../domain/message-bus/IIWorkerChangePasswordConsumer";
import { ChangePasswordRequest, ChangePasswordResponse } from "./types/types";

/**
 * change pass consumer
 * - auth service <-> work service
 * to ulter auth infras and db
 */


@injectable()
export class WorkerChangePasswordConsumer implements IWorkerChangePasswordConsumer {

    private readonly REQUEST_QUEUE = "worker.change-password.request";
    private readonly RESPONSE_QUEUE = "worker.change-password.response";

    constructor(
        @inject("WorkerRepository") private readonly workerRepository: IWorkerRepository,
        @inject("HashService") private readonly hashService: IHashService
    ) { }

    async start(channel: Channel): Promise<void> {

        await channel.assertQueue(this.REQUEST_QUEUE, { durable: true });
        await channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

        logger.info(`WorkerChangePasswordConsumer listening on ${this.REQUEST_QUEUE}`);

        channel.consume(this.REQUEST_QUEUE, async (msg) => {

            if (!msg) {
                return;
            }

            try {
                const request: ChangePasswordRequest = JSON.parse(msg.content.toString());

                const response = await this.changePassword(request);

                channel.sendToQueue(this.RESPONSE_QUEUE, Buffer.from(
                    JSON.stringify(response)), {
                    correlationId: request.correlationId,
                    persistent: true
                });

                channel.ack(msg);

            } catch (error) {
                logger.error("Worker change password error:", error);

                const request: ChangePasswordRequest = JSON.parse(msg.content.toString());
                const response: ChangePasswordResponse = {
                    success: false, error: error instanceof Error ? error.message : "Failed to change password"
                };

                channel.sendToQueue(this.RESPONSE_QUEUE, Buffer.from(JSON.stringify(response)), {
                    correlationId:request.correlationId,
                    persistent: true
                });
                channel.ack(msg);
            }
        }
        );
    }

    private async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {

        const { workerId, currentPassword, newPassword } = request;
        const worker = await this.workerRepository.findById(workerId);

        if (!worker) {
            return { success: false, error: "Worker not found." };
        }

        const isCurrentPasswordCorrect = await this.hashService.compare(currentPassword, worker.password);

        if (!isCurrentPasswordCorrect) {
            return { success: false, error: "Current password is incorrect." };
        }

        const isSamePassword = await this.hashService.compare(newPassword, worker.password);

        if (isSamePassword) {
            return { success: false, error: "New password must be different from current password." };
        }

        const hashedPassword = await this.hashService.hash(newPassword);

        await this.workerRepository.updatePassword(workerId, hashedPassword);

        return {
            success: true,
            message: "Password changed successfully."
        };
    }
}