import { inject, injectable } from "tsyringe";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { IGetWorkerDashboardStatsUseCase } from "../../ports/worker/IGetWorkerDashboardStatsUseCase";
import { WorkerDashboardStatsResponseDto, MonthlyCountDto, } from "../../dtos/worker/WorkerDashboardStatsDTO";

import { MONTH_LABELS } from "../../../shared/constants/Common";

const MONTHS_BACK = 6;

@injectable()
export class GetWorkerDashboardStatsUseCase implements IGetWorkerDashboardStatsUseCase {
    constructor(
        @inject("WorkRepository") private readonly _workRepository: IWorkRepository,
        @inject("ReviewRepository") private readonly _reviewRepository: IReviewRepository
    ) { }

    async execute(workerId: string): Promise<WorkerDashboardStatsResponseDto> {
        const [
            totalWorksCompleted,
            activeWorksCount,
            worksDueThisWeek,
            monthlyRaw,
            recentCompleted,
            { avgRating, totalReviews },
            { reviews: recentReviewDocs },
        ] = await Promise.all([
            this._workRepository.countCompletedByWorkerId(workerId),

            this._workRepository.countActiveByWorkerId(workerId),

            this._workRepository.countDueThisWeek(workerId),

            this._workRepository.getMonthlyCompletedCounts(workerId, MONTHS_BACK),

            this._workRepository.getRecentCompletedWorks(workerId, 4),

            this._reviewRepository.getWorkerStats(workerId),

            this._reviewRepository.findByWorkerId(workerId, 1, 3),
        ]);

        const now = new Date();

        const monthlyCompletedWorks: MonthlyCountDto[] = [];

        for (let i = MONTHS_BACK - 1; i >= 0; i--) {
            const d = new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

            const match = monthlyRaw.find(
                (m) =>
                    m.month === d.getMonth() + 1 &&
                    m.year === d.getFullYear()
            );

            monthlyCompletedWorks.push({
                month: MONTH_LABELS[d.getMonth()],
                year: d.getFullYear(),
                count: match ? match.count : 0,
            });
        }

        return {
            totalWorksCompleted,

            worksCompletedThisMonth: monthlyCompletedWorks[monthlyCompletedWorks.length - 1]?.count ?? 0,
            worksCompletedLastMonth: monthlyCompletedWorks[monthlyCompletedWorks.length - 2]?.count ?? 0,

            activeWorksCount,
            worksDueThisWeek,
            avgRating,
            totalReviews,
            monthlyCompletedWorks,
            recentCompletedWorks: recentCompleted.map((w) => ({
                id: w.id!,
                workTitle: w.workTitle,
                budget: w.budget
                    ? Number(w.budget)
                    : undefined,
                status: w.status,
                completedAt: w.updatedAt!,
            })),

            recentReviews: recentReviewDocs.map((r) => ({
                rating: r.rating,
                testimonial: r.testimonial,
                createdAt: r.createdAt,
            })),
        };
    }
}