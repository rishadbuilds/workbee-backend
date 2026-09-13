import { inject, injectable } from "tsyringe";

import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/repositories/ITransactionRepository";
import { IMarkPaymentFailedUseCase } from "../../ports/payment/IMarkPaymentFailedUseCase";
import {MarkPaymentFailedRequestDTO,MarkPaymentFailedResponseDTO} from "../../dtos/payment/MarkPaymentFailedDTO";

@injectable()
export class MarkPaymentFailedUseCase implements IMarkPaymentFailedUseCase {
  constructor(
    @inject("PaymentRepository") private paymentRepo: IPaymentRepository,
    @inject("WalletRepository") private walletRepo: IWalletRepository,
    @inject("TransactionRepository") private txRepo: ITransactionRepository
  ) {}

  async execute(data: MarkPaymentFailedRequestDTO): Promise<MarkPaymentFailedResponseDTO> {
    const payment = await this.paymentRepo.findByRazorpayOrderId(data.razorpayOrderId);

    // No order record, or it was already resolved (paid/failed/etc) — nothing to do.
    // This also makes the endpoint safe to call more than once for the same order.
    if (!payment || payment.status !== "pending") {
      return { recorded: false };
    }

    await this.paymentRepo.updateStatus(payment.id, "failed");

    const userWallet = await this.walletRepo.findOrCreate(payment.userId, "user");

    await this.txRepo.create({
      walletId: userWallet.id,
      workId: payment.workId,
      razorpayPaymentId: undefined,
      type: "payment",
      amount: payment.amount,
      currency: payment.currency,
      status: "failed",
      description: data.reason
        ? `Payment failed for work ${payment.workId} (${data.reason})`
        : `Payment failed for work ${payment.workId}`,
      metadata: {
        workId: payment.workId,
        workerId: payment.workerId,
        razorpayOrderId: data.razorpayOrderId,
        reason: data.reason ?? "unknown",
      },
    });

    return { recorded: true };
  }
}