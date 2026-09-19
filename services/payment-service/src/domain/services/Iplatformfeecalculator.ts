export interface PaymentBreakdown {
  platformFee: number;
  workerPayout: number;
}

export interface IPlatformFeeCalculator {
  calculate(amount: number): PaymentBreakdown;
}