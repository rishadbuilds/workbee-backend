import crypto from "crypto";
import { inject, injectable } from "tsyringe";

import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/repositories/ITransactionRepository";
import { IVerifyRazorpayPaymentUseCase } from "../../ports/payment/IVerifyRazorpayPaymentUseCase";
import { VerifyPaymentRequestDTO, VerifyPaymentResponseDTO } from "../../dtos/payment/VerifyPaymentDTO";
import { IEventPublisher } from "../../ports/message-bus/IEventPublisher";

@injectable()
export class VerifyRazorpayPaymentUseCase implements IVerifyRazorpayPaymentUseCase {
  constructor(
    @inject("PaymentRepository") private paymentRepo: IPaymentRepository,
    @inject("WalletRepository") private walletRepo: IWalletRepository,
    @inject("TransactionRepository") private txRepo: ITransactionRepository,
    @inject("EventPublisher") private eventPublisher: IEventPublisher
  ) { }

  async execute(data: VerifyPaymentRequestDTO): Promise<VerifyPaymentResponseDTO> {
    const body = `${data.razorpayOrderId}|${data.razorpayPaymentId}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== data.razorpaySignature) {
      throw new Error("Payment signature verification failed");
    }

    const payment = await this.paymentRepo.findByRazorpayOrderId(data.razorpayOrderId);
    if (!payment) throw new Error("Payment record not found");
    if (payment.status !== "pending") {
      return { success: true, paymentId: payment.id };
    }

    await this.paymentRepo.updateStatus(payment.id, "paid", {
      razorpayPaymentId: data.razorpayPaymentId,
    });

    const userWallet = await this.walletRepo.findOrCreate(payment.userId, "user");
    await this.txRepo.create({
      walletId: userWallet.id,
      workId: payment.workId,
      razorpayPaymentId: data.razorpayPaymentId,
      type: "payment",
      amount: payment.amount,
      currency: payment.currency,
      status: "completed",
      description: `Payment for work ${payment.workId}`,
      metadata: {
        workId: payment.workId,
        workerId: payment.workerId,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
      },
    });

    await this.walletRepo.incrementTotalSpent(userWallet.id,payment.amount);

    await this.walletRepo.updatePendingBalance(userWallet.id,payment.amount);

    const workerWallet = await this.walletRepo.findOrCreate(payment.workerId, "worker");
    await this.walletRepo.updatePendingBalance(workerWallet.id, payment.workerPayout);
    await this.txRepo.create({
      walletId: workerWallet.id,
      workId: payment.workId,
      razorpayPaymentId: data.razorpayPaymentId,
      type: "hold",
      amount: payment.workerPayout,
      currency: payment.currency,
      status: "pending",
      description: `Pending payout for work ${payment.workId} (releases after completion)`,
    });

    // notify worker — best-effort, doesn't block payment success
    await this.eventPublisher.publishPaymentConfirmed({
      workerId: payment.workerId,
      workId: payment.workId,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment.id,
    });

    return { success: true, paymentId: payment.id };
  }
}