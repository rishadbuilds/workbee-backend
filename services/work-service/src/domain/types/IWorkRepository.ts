export type WorkerBucket = 'all' | 'assigned' | 'started' | 'ongoing' | 'completed';

export interface WorkerWorksQueryOptions {
    page: number;
    limit: number;
    bucket: WorkerBucket;
    startDate?: string;
    endDate?: string;
}

export interface WorkerBucketCounts {
    all: number;
    assigned: number;
    started: number;
    ongoing: number;
    completed: number;
}

export type UserWorkBucket = 'all' | 'active' | 'completed' | 'pending' | 'cancelled';

export interface UserWorksQueryOptions {
    page: number;
    limit: number;
    bucket: UserWorkBucket;
}

export interface UserBucketCounts {
    all: number;
    active: number;
    completed: number;
    pending: number;
    cancelled: number;
}

export type LiveWorkBucket = 'active' | 'completed';

export interface LiveWorksQueryOptions {
    page: number;
    limit: number;
    bucket: LiveWorkBucket;
}

export interface LiveWorkBucketCounts {
    active: number;
    completed: number;
}