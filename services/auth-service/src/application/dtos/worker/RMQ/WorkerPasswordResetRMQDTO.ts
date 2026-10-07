export interface WorkerLookupResponseRMQDTO {
    success: boolean;
    data?: { id: string; name: string; email: string };
    error?: string;
}

export interface WorkerResetPasswordResponseRMQDTO {
    success: boolean;
    message?: string;
    error?: string;
}