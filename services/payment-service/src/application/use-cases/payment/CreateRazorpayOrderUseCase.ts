import { inject, injectable } from "tsyringe";

import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IPlatformFeeCalculator } from "../../../domain/services/Iplatformfeecalculator";
import { IPaymentGateway } from "../../ports/payment-gateways/Ipaymentgateway";
import { ICreateRazorpayOrderUseCase } from "../../ports/user/ICreateRazorpayOrderUseCase";
import {CreateOrderRequestDTO,CreateOrderResponseDTO,} from "../../dtos/payment/CreateOrderDTO";
import { DEFAULT_CURRENCY, MINOR_UNITS_PER_MAJOR_UNIT } from "../../../shared/constants/Payment";

@injectable()
export class CreateRazorpayOrderUseCase implements ICreateRazorpayOrderUseCase {
  constructor(
    @inject("PaymentRepository") private readonly paymentRepo: IPaymentRepository,
    @inject("PaymentGateway") private readonly paymentGateway: IPaymentGateway,
    @inject("PlatformFeeCalculator") private readonly feeCalculator: IPlatformFeeCalculator
  ) {}

  async execute(data: CreateOrderRequestDTO): Promise<CreateOrderResponseDTO> {
    const currency = (data.currency || DEFAULT_CURRENCY).toUpperCase();
    const amountInMinorUnits = Math.round(
      data.amount * MINOR_UNITS_PER_MAJOR_UNIT
    );
    const { platformFee, workerPayout } = this.feeCalculator.calculate(data.amount);

    const order = await this.paymentGateway.createOrder({
      amount: amountInMinorUnits,
      currency,
      receipt: `work_${data.workId}`,
      notes: {
        workId: data.workId,
        userId: data.userId,
        workerId: data.workerId,
      },
    });

    const payment = await this.paymentRepo.create({
      workId: data.workId,
      userId: data.userId,
      workerId: data.workerId,
      razorpayOrderId: order.id,
      amount: data.amount,
      platformFee,
      workerPayout,
      currency,
      status: "pending",
    });

    return {
      orderId: order.id,
      amount: amountInMinorUnits,
      currency,
      keyId: this.paymentGateway.getPublicKey(),
      paymentId: payment.id,
    };
  }
}