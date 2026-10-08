/** worker resettoekn service interface */

export interface IWorkerResetTokenService {
    createToken(workerId: string): Promise<string>;
    getWorkerId(token: string): Promise<string | null>;
    invalidate(token: string, workerId: string): Promise<void>;
}