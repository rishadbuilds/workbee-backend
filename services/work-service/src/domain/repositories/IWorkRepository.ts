import { Work } from "../entities/Work";
import { LiveWorkBucketCounts, LiveWorksQueryOptions, UserBucketCounts, UserWorksQueryOptions, WorkerBucketCounts, WorkerWorksQueryOptions } from "../types/IWorkRepository";

export interface IWorkRepository {
    create(work: Work): Promise<Work>;
    findById(id: string): Promise<Work | null>;
    findByUserId(userId: string): Promise<Work[]>;
    update(id: string, workData: Partial<Work>): Promise<Work | null>;
    delete(id: string): Promise<boolean>;
    findAll(filters?: {
        search?: string;
        status?: string;
        page?: number;
        limit?: number;
        latitude?: number;
        longitude?: number;
        maxDistance?: number;
    }): Promise<{ works: Work[]; total: number }>;

    getMyWorksPaginated(userId: string, options: UserWorksQueryOptions): Promise<{ works: Work[]; total: number }>;
    countUserWorkBuckets(userId: string): Promise<UserBucketCounts>;
    
    getLiveWorksByUserId(userId: string, options: LiveWorksQueryOptions): Promise<{ works: Work[]; total: number }>;
    countLiveWorkBuckets(userId: string): Promise<LiveWorkBucketCounts>;

    getMyWorks(id: string): Promise<{ works: Work[] | null }>;
    findByWorkerId(workerId: string, options: WorkerWorksQueryOptions): Promise<{ works: Work[]; total: number }>;
    countWorkerBuckets(workerId: string): Promise<WorkerBucketCounts>;

    countCompletedByWorkerId(workerId: string): Promise<number>;

    //worker dashboard
    countActiveByWorkerId(workerId: string): Promise<number>;
    countDueThisWeek(workerId: string): Promise<number>;
    getMonthlyCompletedCounts(workerId: string, months: number): Promise<{ month: number; year: number; count: number }[]>;
    getRecentCompletedWorks(workerId: string, limit: number): Promise<Work[]>;

    // admin dash
    countAllActive(): Promise<number>;
    countAllCompleted(): Promise<number>;
}
