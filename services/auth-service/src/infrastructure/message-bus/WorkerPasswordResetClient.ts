import { injectable } from "tsyringe";
import { IWorkerPasswordResetClient } from "../../application/ports/message-bus/IWorkerPasswordResetClient";
import {WorkerLookupResponseRMQDTO,WorkerResetPasswordResponseRMQDTO} from "../../application/dtos/worker/RMQ/WorkerPasswordResetRMQDTO";
import { rpcCall } from "./rpcCall";

/**
 * auth-service -> work-service
 * forgot password: check the worker exists / is approved / is not blocked
 * reset password: hash + save the new password (worker schema lives in work-service)
 */

@injectable()
export class WorkerPasswordResetClient implements IWorkerPasswordResetClient {
    private readonly LOOKUP_QUEUE = "worker.forgot-password.request";
    private readonly RESET_QUEUE = "worker.reset-password.request";

    lookupWorker(email: string): Promise<WorkerLookupResponseRMQDTO> {
        return rpcCall<WorkerLookupResponseRMQDTO>(this.LOOKUP_QUEUE, { email });
    }

    resetPassword(workerId: string, newPassword: string): Promise<WorkerResetPasswordResponseRMQDTO> {
        return rpcCall<WorkerResetPasswordResponseRMQDTO>(this.RESET_QUEUE, { workerId, newPassword });
    }
}