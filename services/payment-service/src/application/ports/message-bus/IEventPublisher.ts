import { IPaymentConfirmedEvent } from "../../../domain/message-bus/IPaymentConfirmedEvent";
import { IWorkerPayoutCreditedEvent } from "../../../domain/message-bus/IWorkerPayoutCreditedEvent";

export interface IEventPublisher {
  publishWorkerPayoutCredited(event: IWorkerPayoutCreditedEvent): Promise<void>;
  publishPaymentConfirmed(event: IPaymentConfirmedEvent): Promise<void>;
}