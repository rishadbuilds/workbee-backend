import { injectable, inject } from "tsyringe";
import { UserRole } from "workbee-common";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";

import { WorkerLoginRequestDTO, WorkerLoginResponseDTO } from "../../dtos/worker/LoginWorkerDTO";
import { WorkerMapper } from "../../mappers/WorkerMapper";

import { IWorkerLoginUseCase } from "../../ports/worker/IWorkerLoginUseCase";
import { IWorkerValidationClient } from "../../ports/message-bus/IWorkerValidationClient";
import { ITokenService } from "../../../domain/services/ITokenService";


@injectable()
export class WorkerLoginUseCase implements IWorkerLoginUseCase {
    constructor(
        @inject("TokenService") private readonly _tokenService: ITokenService,
        @inject("WorkerValidationClient") private readonly _workerValidationClient: IWorkerValidationClient
    ) { }

    async execute(data: WorkerLoginRequestDTO): Promise<WorkerLoginResponseDTO> {

        const { email, password } = data;

        const response = await this._workerValidationClient.validateWorker(email, password);
        
        if (!response.success) {
            throw new Error(ErrorMessages.WORKER.WORKER_VALIDATION_FAILED);
        }

        const worker = response.data;

        if (!worker) {
            throw new Error(ErrorMessages.WORKER.WORKER_VALIDATION_FAILED);
        }

        // generate access and refresh tokens
        const accessToken = this._tokenService.generateAccess(worker.id, UserRole.WORKER);
        const refreshToken = this._tokenService.generateRefresh(worker.id, UserRole.WORKER);

        // store refresh token in Redis
        await this._tokenService.storeRefreshToken(worker.id, refreshToken);

        return WorkerMapper.toLoginResponse({...worker,accessToken,refreshToken});
    }
}