import { Address } from "../../../domain/entities/Address";

/** worker change password consumer types */
export interface ChangePasswordRequest {
    workerId: string;
    currentPassword: string;
    newPassword: string;
    correlationId: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message?: string;
    error?: string;
}

/** worker block event */
export interface IWorkerBlockedEvent {
    workerId: string;
    isBlocked: boolean;
}

/** worker validation consumer */

export interface WorkerLoginRequest {
    email: string;
    password: string;
    correlationId: string;
}

export interface WorkerLoginResponse {
    success: boolean;
    data?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        role: "worker";
        address: Address;
        workTypes: string[];
        preferredWorks: string[];
        status: string;
    };
    error?: string;
}
