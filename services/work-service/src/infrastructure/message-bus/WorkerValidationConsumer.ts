// /**
//  * worker-service - auth-service communication (login validation)
//  * auth service sends: { email, password, correlationId }
//  * worker service checks worker and responds with: { success, data?, error? }
//  */

import { Channel } from "amqplib";
import { injectable, inject } from "tsyringe";
import { IWorkerRepository } from "../../domain/repositories/IWorkerRepository";
import { IHashService } from "../../domain/services/IHashService";
import { WorkerStatus } from "../database/models/WorkerSchema";
import { getErrorMessage } from "workbee-common";
import { logger } from "../logger/logger";
import { WorkerLoginRequest, WorkerLoginResponse } from "./types/types";

@injectable()
export class WorkerValidationConsumer {
    private readonly REQUEST_QUEUE = "worker.validate.request";
    private readonly RESPONSE_QUEUE = "worker.validate.response";

    constructor(
        @inject("WorkerRepository") private workerRepository: IWorkerRepository,
        @inject("HashService") private hashService: IHashService
    ) { }

    async start(channel: Channel): Promise<void> {
        await channel.assertQueue(this.REQUEST_QUEUE, { durable: true });
        await channel.assertQueue(this.RESPONSE_QUEUE, { durable: true });

        logger.info(`WorkerValidationConsumer listening on queue: ${this.REQUEST_QUEUE}`);

        channel.consume(this.REQUEST_QUEUE, async (msg) => {
            if (!msg) return;

            const request: WorkerLoginRequest = JSON.parse(msg.content.toString());

            try {
                const response = await this.validateWorker(request);

                channel.sendToQueue(this.RESPONSE_QUEUE, Buffer.from(JSON.stringify(response)), {
                    correlationId: request.correlationId,
                    persistent: true
                });

                logger.info(`Sent validation response for: ${request.email}`);
                channel.ack(msg);
            } catch (err) {
                logger.error("Worker validation error:", err);

                const errorResponse: WorkerLoginResponse = {
                    success: false,
                    error: getErrorMessage(err) || "Internal worker validation error"
                };

                channel.sendToQueue(
                    this.RESPONSE_QUEUE,
                    Buffer.from(JSON.stringify(errorResponse)),
                    {
                        correlationId: request.correlationId,
                        persistent: true
                    }
                );

                channel.ack(msg);
            }
        });
    }

    private async validateWorker(req: WorkerLoginRequest): Promise<WorkerLoginResponse> {
        const { email, password } = req;

        const worker = await this.workerRepository.findByEmail(email);

        if (!worker) {
            return {
                success: false,
                error: "Worker does not exist. Please apply as a worker."
            };
        }

        if (worker.status === WorkerStatus.REJECTED) {
            return {
                success: false,
                error: "Your application has been rejected. Check your email for the reason."
            };
        }

        if (worker.isBlocked) {
            return {
                success: false,
                error: "Your have blocked, contact with WorkBee team for assistance"
            };
        }

        if (worker.status !== WorkerStatus.APPROVED) {
            return {
                success: false,
                error: "Your application has not been approved yet. Check your email for updates"
            };
        }

        const isPasswordCorrect = await this.hashService.compare(password, worker.password);

        if (!isPasswordCorrect) {
            return {
                success: false,
                error: "Invalid password."
            };
        }

        const workerId = worker.id;

        // Return worker data 
    
        return {
            success: true,
            data: {
                id: workerId,
                name: worker.name,
                email: worker.email,
                phone: worker.phone,
                role: "worker",
                address: worker.address,
                workTypes: worker.workTypes,
                preferredWorks: worker.preferredWorks,
                status: worker.status
            }
        };
    }
}
