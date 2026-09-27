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

/** 
 * 
 * worker controller 
 * 
 */

@injectable()
export class WorkerController implements IWorkerController {
    constructor(
        @inject("WorkerLoginUseCase") private readonly _workerLoginUseCase: IWorkerLoginUseCase,
        @inject("ChangeWorkerPasswordUseCase") private readonly _changeWorkerPasswordUseCase: IChangeWorkerPasswordUseCase,
        @inject("GetUserProfileStatUseCase") private readonly _getUserProfileStatUseCase: IGetUserProfileStatUseCase,

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

}