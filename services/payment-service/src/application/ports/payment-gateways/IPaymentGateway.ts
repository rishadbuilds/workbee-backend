export interface CreateGatewayOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface IPaymentGateway {
  createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrder>;

  /** Public (client-safe) key the frontend needs to open the checkout. */
  getPublicKey(): string;
}