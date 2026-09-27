import { injectable, inject } from "tsyringe";

import { IChangeWorkerPasswordUseCase } from "../../ports/worker/IChangeWorkerPasswordUseCase";
import { ChangeWorkerPasswordRequestDTO } from "../../dtos/worker/ChangeWorkerPasswordDTO";
import { IWorkerChangePasswordClient } from "../../ports/message-bus/IWorkerChangePasswordClient";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";

@injectable()
export class ChangeWorkerPasswordUseCase implements IChangeWorkerPasswordUseCase {
    constructor(
        @inject("WorkerChangePasswordClient") private readonly _workerChangePasswordClient: IWorkerChangePasswordClient
    ) {}

    async execute(workerId: string,data: ChangeWorkerPasswordRequestDTO): Promise<void> {

        const { currentPassword, newPassword } = data;

        const response = await this._workerChangePasswordClient.changePassword(
            workerId,
            currentPassword,
            newPassword
        );

        if (!response.success) {
            throw new Error(response.error || ErrorMessages.WORKER.FAILED_TO_CHANGE_PASS);
        }
    }
}