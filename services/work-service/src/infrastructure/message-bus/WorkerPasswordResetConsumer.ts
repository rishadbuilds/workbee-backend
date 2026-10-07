/**
 * auth-service <-> work-service (worker forgot / reset password)
 *
 * worker.forgot-password.request : { email }                  -> { success, data?: { id, name, email }, error? }
 * worker.reset-password.request  : { workerId, newPassword }  -> { success, message?, error? }
 *
 * replies go to the private queue given in msg.properties.replyTo
 */

import { Channel, ConsumeMessage } from "amqplib";
import { injectable, inject } from "tsyringe";
import { IWorkerRepository } from "../../domain/repositories/IWorkerRepository";
import { IHashService } from "../../domain/services/IHashService";
import { WorkerStatus } from "../database/models/WorkerSchema";
import { getErrorMessage } from "workbee-common";
import { logger } from "../logger/logger";

interface LookupRequest { email: string; correlationId: string }
interface ResetRequest { workerId: string; newPassword: string; correlationId: string }

interface LookupResponse {
    success: boolean;
    data?: { id: string; name: string; email: string };
    error?: string;
}
interface ResetResponse {
    success: boolean;
    message?: string;
    error?: string;
}

@injectable()
export class WorkerPasswordResetConsumer {
    private readonly LOOKUP_QUEUE = "worker.forgot-password.request";
    private readonly RESET_QUEUE = "worker.reset-password.request";

    constructor(
        @inject("WorkerRepository") private readonly workerRepository: IWorkerRepository,
        @inject("HashService") private readonly hashService: IHashService
    ) { }

    async start(channel: Channel): Promise<void> {
        await channel.assertQueue(this.LOOKUP_QUEUE, { durable: true });
        await channel.assertQueue(this.RESET_QUEUE, { durable: true });

        logger.info(`WorkerPasswordResetConsumer listening on ${this.LOOKUP_QUEUE} & ${this.RESET_QUEUE}`);

        this.listen<LookupRequest, LookupResponse>(channel, this.LOOKUP_QUEUE, (req) => this.lookupWorker(req));
        this.listen<ResetRequest, ResetResponse>(channel, this.RESET_QUEUE, (req) => this.resetPassword(req));
    }

    private listen<TReq, TRes extends { success: boolean; error?: string }>(
        channel: Channel,
        queue: string,
        handler: (request: TReq) => Promise<TRes>
    ): void {
        channel.consume(queue, async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            let response: TRes | { success: false; error: string };

            try {
                const request: TReq = JSON.parse(msg.content.toString());
                response = await handler(request);
            } catch (err) {
                logger.error(`Error handling ${queue}:`, err);
                response = { success: false, error: getErrorMessage(err) || "Internal error" };
            }

            const { replyTo, correlationId } = msg.properties;
            if (replyTo) {
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            }

            channel.ack(msg);
        });
    }

    private async lookupWorker(req: LookupRequest): Promise<LookupResponse> {
        const worker = await this.workerRepository.findByEmail(req.email);

        if (!worker) {
            return { success: false, error: "Worker does not exist" };
        }
        if (worker.status !== WorkerStatus.APPROVED) {
            return { success: false, error: "Worker is not approved" };
        }
        if (worker.isBlocked || worker.isBlacklisted) {
            return { success: false, error: "Worker is blocked" };
        }

        return {
            success: true,
            data: { id: worker.id, name: worker.name, email: worker.email }
        };
    }

    private async resetPassword(req: ResetRequest): Promise<ResetResponse> {
        const { workerId, newPassword } = req;

        const worker = await this.workerRepository.findById(workerId);
        if (!worker) {
            return { success: false, error: "Worker not found." };
        }
        if (worker.isBlocked || worker.isBlacklisted) {
            return { success: false, error: "Your account is blocked, contact WorkBee team for assistance" };
        }

        const isSamePassword = await this.hashService.compare(newPassword, worker.password);
        if (isSamePassword) {
            return { success: false, error: "New password must be different from current password." };
        }

        const hashedPassword = await this.hashService.hash(newPassword);
        await this.workerRepository.updatePassword(workerId, hashedPassword);

        return { success: true, message: "Password reset successfully." };
    }
}