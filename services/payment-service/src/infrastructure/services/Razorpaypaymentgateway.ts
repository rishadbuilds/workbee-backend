import Razorpay from "razorpay";
import { inject, injectable } from "tsyringe";

import {CreateGatewayOrderInput,GatewayOrder,IPaymentGateway,} from "../../application/ports/payment-gateways/Ipaymentgateway";
import { RazorpayConfig } from "../config/razorpay";

@injectable()
export class RazorpayPaymentGateway implements IPaymentGateway {
  private readonly client: Razorpay;

  constructor(
    @inject("RazorpayConfig") private readonly config: RazorpayConfig
  ) {
    this.client = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });
  }

  async createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrder> {
    const order = await this.client.orders.create({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  }

  getPublicKey(): string {
    return this.config.keyId;
  }
}