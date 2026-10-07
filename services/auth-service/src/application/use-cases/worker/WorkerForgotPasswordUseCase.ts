import { injectable, inject } from "tsyringe";
import { IWorkerForgotPasswordUseCase } from "../../ports/worker/IWorkerForgotPasswordUseCase";
import { WorkerForgotPasswordRequestDTO } from "../../dtos/worker/WorkerForgotPasswordDTO";
import { IWorkerPasswordResetClient } from "../../ports/message-bus/IWorkerPasswordResetClient";
import { IWorkerResetTokenService } from "../../../domain/services/IWorkerResetTokenService";
import { IEmailService } from "../../../domain/services/IEmailService";
import { ENV } from "../../../infrastructure/config/env";
import { logger } from "../../../infrastructure/logger/logger";

@injectable()
export class WorkerForgotPasswordUseCase implements IWorkerForgotPasswordUseCase {
    constructor(
        @inject("WorkerPasswordResetClient") private readonly _workerPasswordResetClient: IWorkerPasswordResetClient,
        @inject("WorkerResetTokenService") private readonly _resetTokenService: IWorkerResetTokenService,
        @inject("EmailService") private readonly _emailService: IEmailService
    ) { }

    async execute(data: WorkerForgotPasswordRequestDTO): Promise<void> {
        const email = data.email?.trim();

        if (!email) {
            throw new Error("Email is required");
        }

        const response = await this._workerPasswordResetClient.lookupWorker(email);

        // Don't reveal whether the email exists / is eligible - just stop silently.
        if (!response.success || !response.data) {
            logger.info(`Worker forgot-password skipped for ${email}: ${response.error}`);
            return;
        }

        const token = await this._resetTokenService.createToken(response.data.id);
        const link = `${ENV.CLIENT_URL}/worker/reset-password/${token}`;

        await this._emailService.sendResentPasswordLink(response.data.email, link);
    }
}