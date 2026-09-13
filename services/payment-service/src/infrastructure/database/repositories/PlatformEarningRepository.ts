import { injectable } from "tsyringe";
import {PlatformEarning as PrismaPlatformEarning,} from "../../../generated/prisma/client";

import { getPrisma } from "../../config/prisma";
import { IPlatformEarningRepository } from "../../../domain/repositories/IPlatformEarningRepository";
import { PlatformEarning } from "../../../domain/entities/Platform";
import { MonthlyPlatformEarningRow } from "../row/MonthlyPlatformEarningRow";


@injectable()
export class PlatformEarningRepository implements IPlatformEarningRepository {
  private get db() {
    return getPrisma();
  }

  private mapEarning(row: PrismaPlatformEarning): PlatformEarning {
    return {
      id: row.id,
      paymentId: row.paymentId,
      workId: row.workId,
      feeAmount: Number(row.feeAmount),
      currency: row.currency,
      collectedAt: row.collectedAt,
    };
  }

  async create(data: Omit<PlatformEarning, "id" | "collectedAt">): Promise<PlatformEarning> {
    const row = await this.db.platformEarning.create({
      data: {
        paymentId: data.paymentId,
        workId: data.workId,
        feeAmount: data.feeAmount,
        currency: data.currency,
      },
    });

    return this.mapEarning(row);
  }

  async getAdminSummary(): Promise<{
    totalRevenue: number;
    totalPlatformFees: number;
    pendingPayouts: number;
    refundedAmount: number;
  }> {
    const [revenueAgg, paidPayoutAgg, refundedAgg] =
      await this.db.$transaction([
        this.db.payment.aggregate({
          where: {
            status: {
              in: ["paid", "worker_credited"],
            },
          },
          _sum: {
            amount: true,
            platformFee: true,
          },
        }),

        this.db.payment.aggregate({
          where: {
            status: "paid",
          },
          _sum: {
            workerPayout: true,
          },
        }),

        this.db.payment.aggregate({
          where: {
            status: "refunded",
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

    return {
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
      totalPlatformFees: Number(
        revenueAgg._sum.platformFee ?? 0
      ),
      pendingPayouts: Number(
        paidPayoutAgg._sum.workerPayout ?? 0
      ),
      refundedAmount: Number(
        refundedAgg._sum.amount ?? 0
      ),
    };
  }

  async findAll(limit = 50, offset = 0): Promise<PlatformEarning[]> {
    const rows = await this.db.platformEarning.findMany({
      orderBy: {
        collectedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return rows.map((row) => this.mapEarning(row));
  }

  async getMonthlyPlatformEarnings(months: number): Promise<
    {
      month: number;
      year: number;
      amount: number;
    }[]
  > {
    const start = new Date();

    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows =
      await this.db.$queryRaw<MonthlyPlatformEarningRow[]>`
        SELECT
          EXTRACT(MONTH FROM collected_at)::int AS month,
          EXTRACT(YEAR FROM collected_at)::int AS year,
          SUM(fee_amount)::float AS amount
        FROM platform_earnings
        WHERE collected_at >= ${start}
        GROUP BY year, month
        ORDER BY year, month;
      `;

    return rows.map((row) => ({
      month: row.month,
      year: row.year,
      amount: Number(row.amount),
    }));
  }
}