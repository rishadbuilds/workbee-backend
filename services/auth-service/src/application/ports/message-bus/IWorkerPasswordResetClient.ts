import {WorkerLookupResponseRMQDTO,WorkerResetPasswordResponseRMQDTO} from "../../dtos/worker/RMQ/WorkerPasswordResetRMQDTO";

export interface IWorkerPasswordResetClient {
    lookupWorker(email: string): Promise<WorkerLookupResponseRMQDTO>;
    resetPassword(workerId: string, newPassword: string): Promise<WorkerResetPasswordResponseRMQDTO>;
}