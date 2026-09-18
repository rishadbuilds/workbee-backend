export interface IPaymentCreditedEvent {
  workerId: string;
  workId: string;
  amount: number;
  currency: string;
  paymentId: string;
}