import { WorkerForgotPasswordRequestDTO } from "../../dtos/worker/WorkerForgotPasswordDTO";

export interface IWorkerForgotPasswordUseCase {
    execute(data: WorkerForgotPasswordRequestDTO): Promise<void>;
}