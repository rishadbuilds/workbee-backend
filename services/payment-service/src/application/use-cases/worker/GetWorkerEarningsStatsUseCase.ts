import { inject, injectable } from "tsyringe";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/repositories/ITransactionRepository";
import { IGetWorkerEarningsStatsUseCase } from "../../ports/worker/IGetWorkerEarningsStatsUseCase";
import { WorkerEarningsStatsResponseDto, MonthlyEarningDto } from "../../dtos/worker/WorkerEarningsStatsDTO";
import { MONTH_LABELS } from "../../../shared/constants/MonthLabels";

const MONTHS_BACK = 6;

@injectable()
export class GetWorkerEarningsStatsUseCase implements IGetWorkerEarningsStatsUseCase {
    constructor(
        @inject("WalletRepository") private readonly _walletRepo: IWalletRepository,
        @inject("TransactionRepository") private readonly _txRepo: ITransactionRepository
    ) { }

    async execute(workerId: string): Promise<WorkerEarningsStatsResponseDto> {
        const wallet = await this._walletRepo.findOrCreate(workerId, "worker");
        const monthlyRaw = await this._txRepo.getMonthlyEarnings(wallet.id, MONTHS_BACK);

        const now = new Date();
        const monthlyEarnings: MonthlyEarningDto[] = [];
        for (let i = MONTHS_BACK - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const match = monthlyRaw.find(m => m.month === d.getMonth() + 1 && m.year === d.getFullYear());
            monthlyEarnings.push({
                month: MONTH_LABELS[d.getMonth()],
                year: d.getFullYear(),
                amount: match ? match.amount : 0
            });
        }

        return {
            totalEarnings: wallet.totalEarned,
            withdrawableBalance: wallet.balance,
            pendingBalance: wallet.pendingBalance,
            earningsThisMonth: monthlyEarnings[monthlyEarnings.length - 1]?.amount ?? 0,
            earningsLastMonth: monthlyEarnings[monthlyEarnings.length - 2]?.amount ?? 0,
            monthlyEarnings
        };
    }
}