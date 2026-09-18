import { inject, injectable } from "tsyringe";
import { logger } from "../../../infrastructure/logger/logger";

import { IPlatformEarningRepository } from "../../../domain/repositories/IPlatformEarningRepository";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/repositories/ITransactionRepository";
import { IReleaseWorkerPayoutUseCase } from "../../ports/worker/IReleaseWorkerPayoutUseCase";

import { ReleaseWorkerPayoutRequestDTO, ReleaseWorkerPayoutResponseDTO } from "../../dtos/worker/WorkerPayoutDTO";
import { EventPublisher } from "../../../infrastructure/message-bus/PaymentCreditedEventPublisher";

@injectable()
export class ReleaseWorkerPayoutUseCase implements IReleaseWorkerPayoutUseCase {
  constructor(
    @inject("PaymentRepository") private paymentRepo: IPaymentRepository,
    @inject("WalletRepository") private walletRepo: IWalletRepository,
    @inject("TransactionRepository") private txRepo: ITransactionRepository,
    @inject("PlatformEarningRepository") private platformEarningRepo: IPlatformEarningRepository,
    @inject("EventPublisher") private eventPublisher: EventPublisher
  ) { }

  async execute(data: ReleaseWorkerPayoutRequestDTO): Promise<ReleaseWorkerPayoutResponseDTO> {

    const payment = await this.paymentRepo.findById(data.paymentId);

    if (!payment || payment.status !== "paid") {
      logger.info(`[ReleaseWorkerPayout] skipping ${data.paymentId} — status: ${payment?.status}`);

      return { released: false };
    }

    // - client: remove money from pending

    const userWallet = await this.walletRepo.findOrCreate(payment.userId, "user");

    await this.walletRepo.updatePendingBalance(userWallet.id, -payment.amount);

    // - worker: move pending → available balance

    const workerWallet = await this.walletRepo.findOrCreate(payment.workerId, "worker");

    await this.walletRepo.movePendingToBalance(
      workerWallet.id,
      payment.workerPayout
    );

    // - worker: increase total earned

    await this.walletRepo.incrementTotalEarned(
      workerWallet.id,
      payment.workerPayout
    );

    // - Worker credit transaction

    await this.txRepo.create({
      walletId: workerWallet.id,
      workId: payment.workId,
      razorpayPaymentId: payment.razorpayPaymentId,
      type: "credit",
      amount: payment.workerPayout,
      currency: payment.currency,
      status: "completed",
      description: `Payout for completed work ${payment.workId}`,
      metadata: {
        platformFee: payment.platformFee,
        totalAmount: payment.amount
      },
    });

    // - Platform fee

    await this.txRepo.create({
      walletId: workerWallet.id,
      workId: payment.workId,
      type: "platform_fee",
      amount: payment.platformFee,
      currency: payment.currency,
      status: "completed",
      description: `1% platform fee for work ${payment.workId}`,
    });

    await this.platformEarningRepo.create({
      paymentId: payment.id,
      workId: payment.workId,
      feeAmount: payment.platformFee,
      currency: payment.currency,
    });

    // - Mark payment as released

    await this.paymentRepo.updateStatus(payment.id, "worker_credited", {
      payoutCompletedAt: new Date(),
    }
    );


    // - notify worker (best-effort, non-blocking of payout success)

    await this.eventPublisher.publishWorkerPayoutCredited({
      workerId: payment.workerId,
      workId: payment.workId,
      amount: payment.workerPayout,
      currency: payment.currency,
      paymentId: payment.id,
    });

    // - Complete worker hold transaction

    try {
      const holdTxs = await this.txRepo.findByWorkId(payment.workId);

      const holdTx = holdTxs.find(tx => tx.type === "hold" && tx.status === "pending");

      if (holdTx) {
        await this.txRepo.updateStatus(holdTx.id, "completed");
      }

    } catch (err) {
      logger.error("ReleaseWorkerPayout - Could not update hold tx status:", err);
    }

    logger.info(`ReleaseWorkerPayout - Released ₹${payment.workerPayout} to worker ${payment.workerId}`);

    return {
      released: true,
      workerId: payment.workerId,
      amount: payment.workerPayout
    };
  }
}