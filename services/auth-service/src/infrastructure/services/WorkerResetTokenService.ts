import { injectable } from "tsyringe";
import crypto from "crypto";
import RedisClient from "../config/RedisClient";
import { IWorkerResetTokenService } from "../../domain/services/IWorkerResetTokenService";

const RESET_TOKEN_TTL = 10 * 60; // 10 min

@injectable()
export class WorkerResetTokenService implements IWorkerResetTokenService {
    private redis = RedisClient.getInstance();

    private hash(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    private tokenKey(hash: string) {
        return `worker_reset:${hash}`;
    }

    private workerKey(workerId: string) {
        return `worker_reset_by_worker:${workerId}`;
    }

    async createToken(workerId: string): Promise<string> {
        // invalidate any previous link for this worker
        const previousHash = await this.redis.get(this.workerKey(workerId));
        if (previousHash) {
            await this.redis.del(this.tokenKey(previousHash));
        }

        const token = crypto.randomBytes(32).toString("hex");
        const hash = this.hash(token);

        await this.redis.setex(this.tokenKey(hash), RESET_TOKEN_TTL, workerId);
        await this.redis.setex(this.workerKey(workerId), RESET_TOKEN_TTL, hash);

        return token;
    }

    async getWorkerId(token: string): Promise<string | null> {
        return this.redis.get(this.tokenKey(this.hash(token)));
    }

    async invalidate(token: string, workerId: string): Promise<void> {
        await this.redis.del(this.tokenKey(this.hash(token)));
        await this.redis.del(this.workerKey(workerId));
    }
}