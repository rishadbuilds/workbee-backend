import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IPlatformEarningRepository } from "../../../domain/repositories/IPlatformEarningRepository";
import { IGetAdminPaymentStatsUseCase } from "../../ports/admin/IGetAdminPaymentStatsUseCase";
import { AdminPaymentStatsResponseDto } from "../../dtos/admin/AdminPaymentStatsDTO";
import { buildMonthlySeries } from "../../../shared/utils/buildMonthlySeries";

const MONTHS_BACK = 6;
const RECENT_LIMIT = 5;

@injectable()
export class GetAdminPaymentStatsUseCase implements IGetAdminPaymentStatsUseCase {
    constructor(
        @inject("PaymentRepository") private readonly _paymentRepo: IPaymentRepository,
        @inject("PlatformEarningRepository") private readonly _platformEarningRepo: IPlatformEarningRepository
    ) { }

    async execute(): Promise<AdminPaymentStatsResponseDto> {
        const [
            summary,
            completedTransactionsCount,
            pendingPayoutsList,
            monthlyRevenueRaw,
            monthlyPlatformEarningsRaw,
            { payments: recentPayments }
        ] = await Promise.all([
            this._platformEarningRepo.getAdminSummary(),
            this._paymentRepo.countCompletedPayments(),
            this._paymentRepo.findPendingPayouts(RECENT_LIMIT),
            this._paymentRepo.getMonthlyRevenue(MONTHS_BACK),
            this._platformEarningRepo.getMonthlyPlatformEarnings(MONTHS_BACK),
            this._paymentRepo.findAllPaginated(1, RECENT_LIMIT),
        ]);

        const monthlyRevenue = buildMonthlySeries(monthlyRevenueRaw,MONTHS_BACK);
        const monthlyPlatformEarnings = buildMonthlySeries(monthlyPlatformEarningsRaw,MONTHS_BACK);

        return {
            grossRevenue: summary.totalRevenue,
            platformEarnings: summary.totalPlatformFees,
            pendingPayoutsAmount: summary.pendingPayouts,
            pendingPayoutsCount: pendingPayoutsList.length,
            completedTransactionsCount,
            revenueThisMonth: monthlyRevenue[monthlyRevenue.length - 1]?.amount ?? 0,
            revenueLastMonth: monthlyRevenue[monthlyRevenue.length - 2]?.amount ?? 0,
            platformEarningsThisMonth: monthlyPlatformEarnings[monthlyPlatformEarnings.length - 1]?.amount ?? 0,
            platformEarningsLastMonth: monthlyPlatformEarnings[monthlyPlatformEarnings.length - 2]?.amount ?? 0,
            monthlyPlatformEarnings,
            monthlyRevenue,
            recentTransactions: recentPayments.map(p => ({
                id: p.id,
                workId: p.workId,
                amount: p.amount,
                status: p.status,
                createdAt: p.createdAt
            })),
            pendingPayouts: pendingPayoutsList.map(p => ({
                paymentId: p.id,
                workerId: p.workerId,
                workId: p.workId,
                workerPayout: p.workerPayout,
                workCompletedAt: p.workCompletedAt
            }))
        };
    }
}