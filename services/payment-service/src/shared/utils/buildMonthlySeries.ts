import { MONTH_LABELS } from "../constants/MonthLabels";
import { MonthlyAmountDto } from "../../application/dtos/admin/AdminPaymentStatsDTO";

interface MonthlyAmount {
    month: number;
    year: number;
    amount: number;
}

/**
 * builds a complete monthly time series to easly show stats 
 *
 * missing months are included with an amount of zero so consumers
 * can render a consistent time-series without filling gaps themselves
 */

export function buildMonthlySeries(raw: MonthlyAmount[], monthsBack: number): MonthlyAmountDto[] {
    const now = new Date();
    const series: MonthlyAmountDto[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        const match = raw.find((item) =>
            item.month === date.getMonth() + 1 &&
            item.year === date.getFullYear()
        );

        series.push({
            month: MONTH_LABELS[date.getMonth()],
            year: date.getFullYear(),
            amount: match?.amount ?? 0,
        });
    }

    return series;
}