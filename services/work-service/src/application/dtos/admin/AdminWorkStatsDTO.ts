export interface AdminRecentAssignedWorkDto {
    id: string;
    workTitle: string;
    workCategory: string;
    workType: 'oneDay' | 'multipleDay';
    date?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    workerId: string;
    workerName: string;
}

export interface AdminRecentApplierDto {
    id: string;
    name: string;
    email: string;
    city: string;
    workTypes: string[];
    createdAt: Date;
}

export interface AdminWorkStatsResponseDto {
    totalWorkers: number;
    newWorkersThisMonth: number;
    newWorkersLastMonth: number;
    newAppliersCount: number;
    activeJobsCount: number;
    worksCompletedTotal: number;
    recentAssignedWorks: AdminRecentAssignedWorkDto[];
    recentAppliers: AdminRecentApplierDto[];          
}