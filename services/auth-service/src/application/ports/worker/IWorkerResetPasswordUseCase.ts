import { WorkerResetPasswordRequestDTO } from "../../dtos/worker/WorkerForgotPasswordDTO";

export interface IWorkerResetPasswordUseCase {
    execute(data: WorkerResetPasswordRequestDTO): Promise<void>;
}