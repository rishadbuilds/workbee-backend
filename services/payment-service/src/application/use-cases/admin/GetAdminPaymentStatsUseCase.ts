import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IPlatformEarningRepository } from "../../../domain/repositories/IPlatformEarningRepository";
import { IGetAdminPaymentStatsUseCase } from "../../ports/admin/IGetAdminPaymentStatsUseCase";
import { AdminPaymentStatsResponseDto, MonthlyAmountDto } from "../../dtos/admin/AdminPaymentStatsDTO";
import { MONTH_LABELS } from "../../../shared/constants/MonthLabels";

const MONTHS_BACK = 6;
const RECENT_LIMIT = 5;

/** builds a complete monthly time series to easly show stats */

function buildMonthlySeries(raw: { month: number; year: number; amount: number }[]): MonthlyAmountDto[] {
    const now = new Date();
    const series: MonthlyAmountDto[] = [];
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const match = raw.find(m => m.month === d.getMonth() + 1 && m.year === d.getFullYear());
        series.push({
            month: MONTH_LABELS[d.getMonth()],
            year: d.getFullYear(),
            amount: match ? match.amount : 0
        });
    }
    return series;
}

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

        const monthlyRevenue = buildMonthlySeries(monthlyRevenueRaw);
        const monthlyPlatformEarnings = buildMonthlySeries(monthlyPlatformEarningsRaw);

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