import { injectable } from "tsyringe";
import { getPrisma } from "../../config/prisma";
import {ITransactionRepository,PaginatedTransactions,TransactionQueryOptions,} from "../../../domain/repositories/ITransactionRepository";
import {Transaction,TransactionStatus,TransactionType,JsonObject,JsonValue,} from "../../../domain/entities/Transaction";
import {Prisma,Transaction as PrismaTransaction,TransactionType as PrismaTransactionType,TransactionStatus as PrismaTransactionStatus,} from "../../../generated/prisma/client";

function toDomainJsonObject(value: unknown): JsonObject | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const clean: JsonObject = {};
  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined) {
      clean[key] = val as JsonValue;
    }
  }
  return clean;
}

@injectable()
export class TransactionRepository implements ITransactionRepository {
  private get db() {
    return getPrisma();
  }

  private mapTx(row: PrismaTransaction): Transaction {
    return {
      id: row.id,
      walletId: row.walletId,
      workId: row.workId ?? undefined,
      razorpayPaymentId: row.razorpayPaymentId ?? undefined,
      type: row.type as unknown as TransactionType,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status as unknown as TransactionStatus,
      description: row.description ?? undefined,
      metadata: toDomainJsonObject(row.metadata),
      createdAt: row.createdAt,
    };
  }

  async create(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const row = await this.db.transaction.create({
      data: {
        walletId: data.walletId,
        workId: data.workId ?? null,
        razorpayPaymentId: data.razorpayPaymentId ?? null,
        type: data.type as unknown as PrismaTransactionType,
        amount: data.amount,
        currency: data.currency,
        status: data.status as unknown as PrismaTransactionStatus,
        description: data.description ?? null,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return this.mapTx(row);
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const row = await this.db.transaction.update({
      where: { id },
      data: { status: status as unknown as PrismaTransactionStatus },
    });
    return this.mapTx(row);
  }

  async findByWalletId(
    walletId: string,
    options: TransactionQueryOptions
  ): Promise<PaginatedTransactions> {
    const { page, limit, status, startDate, endDate, excludeTypes } = options;

    const where: Prisma.TransactionWhereInput = {
      walletId,
      ...(status && status !== "all"
        ? { status: status as unknown as PrismaTransactionStatus }
        : {}),
      ...(excludeTypes && excludeTypes.length > 0
        ? { type: { notIn: excludeTypes as unknown as PrismaTransactionType[] } }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.db.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.db.transaction.count({ where }),
    ]);

    return {
      transactions: rows.map((r) => this.mapTx(r)),
      total,
    };
  }

  async findByWorkId(workId: string): Promise<Transaction[]> {
    const rows = await this.db.transaction.findMany({
      where: { workId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.mapTx(r));
  }

  async getMonthlyEarnings(
    walletId: string,
    months: number
  ): Promise<{ month: number; year: number; amount: number }[]> {
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    interface MonthlyEarningRow {
      month: number;
      year: number;
      amount: Prisma.Decimal | number | string;
    }

    const rows = await this.db.$queryRaw<MonthlyEarningRow[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS month,
        EXTRACT(YEAR FROM created_at)::int AS year,
        SUM(amount) AS amount
      FROM transactions
      WHERE wallet_id = ${walletId}
        AND type IN ('credit', 'release')
        AND status = 'completed'
        AND created_at >= ${start}
      GROUP BY year, month
      ORDER BY year, month;
    `;

    return rows.map((r) => ({
      month: r.month,
      year: r.year,
      amount: Number(r.amount),
    }));
  }
}