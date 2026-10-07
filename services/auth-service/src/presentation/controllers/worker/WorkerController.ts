import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { HttpStatus } from "../../../shared/enums/HttpStatus";
import { ResponseHelper } from "../../../shared/helpers/responseHelper";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";

//dtos
import { WorkerLoginRequestDTO } from "../../../application/dtos/worker/LoginWorkerDTO";

//usecases interfaces
import { IWorkerLoginUseCase } from "../../../application/ports/worker/IWorkerLoginUseCase";
import { IChangeWorkerPasswordUseCase } from "../../../application/ports/worker/IChangeWorkerPasswordUseCase";
import { IGetUserProfileStatUseCase } from "../../../application/ports/worker/IGetUserProfileStatUseCase";

//controller interface
import { IWorkerController } from "../../ports/IWorkerController";
import { IWorkerForgotPasswordUseCase } from "../../../application/ports/worker/IWorkerForgotPasswordUseCase";
import { IWorkerResetPasswordUseCase } from "../../../application/ports/worker/IWorkerResetPasswordUseCase";

/** worker controller */

@injectable()
export class WorkerController implements IWorkerController {
    constructor(
        @inject("WorkerLoginUseCase") private readonly _workerLoginUseCase: IWorkerLoginUseCase,
        @inject("ChangeWorkerPasswordUseCase") private readonly _changeWorkerPasswordUseCase: IChangeWorkerPasswordUseCase,
        @inject("GetUserProfileStatUseCase") private readonly _getUserProfileStatUseCase: IGetUserProfileStatUseCase,
        @inject("WorkerForgotPasswordUseCase") private readonly _workerForgotPasswordUseCase: IWorkerForgotPasswordUseCase,
        @inject("WorkerResetPasswordUseCase") private readonly _workerResetPasswordUseCase: IWorkerResetPasswordUseCase,


    ) { }

    async workerLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: WorkerLoginRequestDTO = req.body;

            const worker = await this._workerLoginUseCase.execute(dto);

            res.status(HttpStatus.OK)
                .json(ResponseHelper.success(worker, ResponseMessage.AUTH.WORKER_LOGGED));
        } catch (err) {
            next(err)
        }
    }


    async changeWorkerPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workerId = req.headers["x-user-id"];

            if (!workerId || typeof workerId !== "string") {
                throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
            }

            const { currentPassword, newPassword } = req.body;
            await this._changeWorkerPasswordUseCase.execute(workerId, { currentPassword, newPassword });

            res.status(HttpStatus.OK).json(ResponseHelper.success(null, ResponseMessage.WORKER.CHANGED_WORKER_PASS));

        } catch (err) {
            next(err);
        }
    }

    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;

            if (typeof userId !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json(
                    ResponseHelper.error(ErrorMessages.USER.WRONG_USER_ID, HttpStatus.BAD_REQUEST)
                );
                return;
            }
            const profile = await this._getUserProfileStatUseCase.execute({ userId });

            res.status(HttpStatus.OK).json(ResponseHelper.success(profile, ResponseMessage.USER.USER_PROFILE_RETRIEVED));
        } catch (err) {
            next(err);
        }
    }

    async workerForgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            await this._workerForgotPasswordUseCase.execute({ email });

            // same response whether or not the email exists
            res.status(HttpStatus.OK).json(
                ResponseHelper.success(null, "If an approved worker account exists for this email, a reset link has been sent.")
            );
        } catch (err) {
            next(err);
        }
    }

    async workerResetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;

            if (typeof token !== "string") {
                res.status(HttpStatus.BAD_REQUEST).json(
                    ResponseHelper.error("Invalid or expired reset link", HttpStatus.BAD_REQUEST)
                );
                return;
            }

            await this._workerResetPasswordUseCase.execute({ token, newPassword });

            res.status(HttpStatus.OK).json(
                ResponseHelper.success(null, "Password reset successfully. Please login with your new password.")
            );
        } catch (err) {
            next(err);
        }
    }

}