export interface IPaymentConfirmedEvent {
  workerId: string;
  workId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentId: string;
}