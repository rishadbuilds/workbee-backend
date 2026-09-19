import { IPlatformFeeCalculator,PaymentBreakdown } from "../../domain/services/Iplatformfeecalculator";

/**
 * Pure business rule: no framework, SDK or environment access.
 * `feeRate` is a fraction (0.01 = 1%).
 */

export class PlatformFeeCalculator implements IPlatformFeeCalculator {
  constructor(private readonly feeRate: number) {}

  calculate(amount: number): PaymentBreakdown {
    const platformFee = parseFloat((amount * this.feeRate).toFixed(2));
    const workerPayout = parseFloat((amount - platformFee).toFixed(2));

    return { platformFee, workerPayout };
  }
}