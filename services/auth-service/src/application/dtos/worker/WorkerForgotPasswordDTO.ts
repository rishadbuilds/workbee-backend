export interface WorkerForgotPasswordRequestDTO {
    email: string;
}

export interface WorkerResetPasswordRequestDTO {
    token: string;
    newPassword: string;
}