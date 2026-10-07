import { injectable, inject } from "tsyringe";
import { IWorkerResetPasswordUseCase } from "../../ports/worker/IWorkerResetPasswordUseCase";
import { WorkerResetPasswordRequestDTO } from "../../dtos/worker/WorkerForgotPasswordDTO";
import { IWorkerPasswordResetClient } from "../../ports/message-bus/IWorkerPasswordResetClient";
import { IWorkerResetTokenService } from "../../../domain/services/IWorkerResetTokenService";
import { ITokenService } from "../../../domain/services/ITokenService";

@injectable()
export class WorkerResetPasswordUseCase implements IWorkerResetPasswordUseCase {
    constructor(
        @inject("WorkerPasswordResetClient") private readonly _workerPasswordResetClient: IWorkerPasswordResetClient,
        @inject("WorkerResetTokenService") private readonly _resetTokenService: IWorkerResetTokenService,
        @inject("TokenService") private readonly _tokenService: ITokenService
    ) { }

    async execute(data: WorkerResetPasswordRequestDTO): Promise<void> {
        const { token, newPassword } = data;

        if (!token) {
            throw new Error("Invalid or expired reset link");
        }
        if (!newPassword || newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        const workerId = await this._resetTokenService.getWorkerId(token);
        if (!workerId) {
            throw new Error("Invalid or expired reset link");
        }

        const response = await this._workerPasswordResetClient.resetPassword(workerId, newPassword);
        if (!response.success) {
            // token is kept so the worker can retry (e.g. "same as old password")
            throw new Error(response.error || "Failed to reset password");
        }

        await this._resetTokenService.invalidate(token, workerId);

        // log the worker out of all existing sessions
        await this._tokenService.deleteRefreshToken(workerId);
    }
}