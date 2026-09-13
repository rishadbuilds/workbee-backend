import { injectable } from "tsyringe";
import {PaymentStatus,Prisma,Payment as PrismaPayment,} from "../../../generated/prisma/client";

import { getPrisma } from "../../config/prisma";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { Payment } from "../../../domain/entities/Payment";
import { MonthlyRevenueRow } from "../row/MonthlyRevenueRow";


@injectable()
export class PaymentRepository implements IPaymentRepository {
  private get db() {
    return getPrisma();
  }

  private mapPayment(row: PrismaPayment): Payment {
    return {
      id: row.id,
      workId: row.workId,
      userId: row.userId,
      workerId: row.workerId,

      razorpayOrderId: row.razorpayOrderId ?? undefined,
      razorpayPaymentId: row.razorpayPaymentId ?? undefined,

      amount: Number(row.amount),
      platformFee: Number(row.platformFee),
      workerPayout: Number(row.workerPayout),

      currency: row.currency,
      status: row.status,

      workCompletedAt: row.workCompletedAt ?? undefined,
      payoutScheduledAt: row.payoutScheduledAt ?? undefined,
      payoutCompletedAt: row.payoutCompletedAt ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async create(data: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    const row = await this.db.payment.create({
      data: {
        workId: data.workId,
        userId: data.userId,
        workerId: data.workerId,

        razorpayOrderId: data.razorpayOrderId ?? null,
        razorpayPaymentId: data.razorpayPaymentId ?? null,

        amount: data.amount,
        platformFee: data.platformFee,
        workerPayout: data.workerPayout,

        currency: data.currency,
        status: data.status,
      },
    });

    return this.mapPayment(row);
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.db.payment.findUnique({
      where: { id },
    });

    return row ? this.mapPayment(row) : null;
  }

  async findByWorkId(workId: string): Promise<Payment | null> {
    const row = await this.db.payment.findFirst({
      where: { workId },
      orderBy: { createdAt: "desc" },
    });
    return row ? this.mapPayment(row) : null;
  }

  async findByRazorpayOrderId(orderId: string): Promise<Payment | null> {
    const row = await this.db.payment.findUnique({
      where: {
        razorpayOrderId: orderId,
      },
    });

    return row ? this.mapPayment(row) : null;
  }

  async findByRazorpayPaymentId(paymentId: string): Promise<Payment | null> {
    const row = await this.db.payment.findUnique({
      where: {
        razorpayPaymentId: paymentId,
      },
    });

    return row ? this.mapPayment(row) : null;
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filters?: {
      status?: PaymentStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    payments: Payment[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt.gte = new Date(
          `${filters.startDate}T00:00:00.000`
        );
      }

      if (filters.endDate) {
        const endDate = new Date(
          `${filters.endDate}T00:00:00.000`
        );

        endDate.setDate(endDate.getDate() + 1);

        where.createdAt.lt = endDate;
      }
    }

    const [rows, total] = await this.db.$transaction([
      this.db.payment.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      }),

      this.db.payment.count({
        where,
      }),
    ]);

    return {
      payments: rows.map((row) => this.mapPayment(row)),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: Payment["status"], extra: Partial<Payment> = {}): Promise<Payment> {
    const data: Prisma.PaymentUpdateInput = { status, };

    if (extra.razorpayPaymentId !== undefined) {
      data.razorpayPaymentId = extra.razorpayPaymentId;
    }

    if (extra.razorpayOrderId !== undefined) {
      data.razorpayOrderId = extra.razorpayOrderId;
    }

    if (extra.workCompletedAt !== undefined) {
      data.workCompletedAt = extra.workCompletedAt;
    }

    if (extra.payoutScheduledAt !== undefined) {
      data.payoutScheduledAt = extra.payoutScheduledAt;
    }

    if (extra.payoutCompletedAt !== undefined) {
      data.payoutCompletedAt = extra.payoutCompletedAt;
    }

    const row = await this.db.payment.update({
      where: { id },
      data,
    });

    return this.mapPayment(row);
  }

  async countCompletedPayments(): Promise<number> {
    return this.db.payment.count({
      where: {
        status: {
          in: ["paid", "worker_credited"],
        },
      },
    });
  }

  async findPendingPayouts(limit: number): Promise<Payment[]> {
    const rows = await this.db.payment.findMany({
      where: {
        status: "paid",
      },
      orderBy: {
        workCompletedAt: "desc",
      },
      take: limit,
    });

    return rows.map((row) => this.mapPayment(row));
  }

  async getMonthlyRevenue(months: number): Promise<{ month: number; year: number; amount: number; }[]
  > {
    const start = new Date();

    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await this.db.$queryRaw<MonthlyRevenueRow[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS month,
        EXTRACT(YEAR FROM created_at)::int AS year,
        SUM(amount)::float AS amount
      FROM payments
      WHERE status IN ('paid', 'worker_credited')
        AND created_at >= ${start}
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