import { inject, injectable } from "tsyringe";
import { IWorkerRepository } from "../../../domain/repositories/IWorkerRepository";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { WorkerStatus } from "../../../infrastructure/database/models/WorkerSchema";
import { IGetAdminWorkStatsUseCase } from "../../ports/admin/IGetAdminWorkStatsUseCase";
import { AdminWorkStatsResponseDto } from "../../dtos/admin/AdminWorkStatsDTO";

const RECENT_LIMIT = 5;

@injectable()
export class GetAdminWorkStatsUseCase implements IGetAdminWorkStatsUseCase {
    constructor(
        @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository,
        @inject("WorkRepository") private readonly _workRepository: IWorkRepository
    ) { }

    async execute(): Promise<AdminWorkStatsResponseDto> {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [
            totalWorkers,
            newWorkersThisMonth,
            newWorkersLastMonth,
            newAppliersCount,
            activeJobsCount,
            worksCompletedTotal,
            recentWorks,
            recentApplierResult
        ] = await Promise.all([
            this._workerRepository.getWorkersCount(),
            this._workerRepository.countCreatedBetween(WorkerStatus.APPROVED, startOfThisMonth, now),
            this._workerRepository.countCreatedBetween(WorkerStatus.APPROVED, startOfLastMonth, startOfThisMonth),
            this._workerRepository.countPendingAppliers(),
            this._workRepository.countAllActive(),
            this._workRepository.countAllCompleted(),
            this._workRepository.findRecentAssigned(RECENT_LIMIT),
            this._workerRepository.getNewAppliers(1, RECENT_LIMIT, "", "pending"),
        ]);

        // worker names for the recent bookings table
        const workerIds = [...new Set(
            recentWorks.map((w) => w.workerId).filter((id): id is string => !!id)
        )];
        const workers = workerIds.length ? await this._workerRepository.findByIds(workerIds) : [];
        const workerNameById = new Map(workers.map((w) => [w.id, w.name]));

        const recentAssignedWorks = recentWorks.map((w) => ({
            id: w.id as string,
            workTitle: w.workTitle,
            workCategory: w.workCategory,
            workType: w.workType,
            date: w.date,
            startDate: w.startDate,
            endDate: w.endDate,
            status: w.status,
            workerId: w.workerId as string,
            workerName: workerNameById.get(w.workerId as string) ?? "Unknown worker",
        }));

        const recentAppliers = recentApplierResult.workers.map((w) => ({
            id: w.id as string,
            name: w.name,
            email: w.email,
            city: w.address?.city ?? "",
            workTypes: w.workTypes,
            createdAt: w.createdAt as Date,
        }));

        return {
            totalWorkers,
            newWorkersThisMonth,
            newWorkersLastMonth,
            newAppliersCount,
            activeJobsCount,
            worksCompletedTotal,
            recentAssignedWorks,
            recentAppliers,
        };
    }
}