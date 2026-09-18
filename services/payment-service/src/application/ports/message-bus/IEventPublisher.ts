import { IWorkerPayoutCreditedEvent } from "../../../domain/message-bus/IWorkerPayoutCreditedEvent";

export interface IEventPublisher {
  publishWorkerPayoutCredited(event: IWorkerPayoutCreditedEvent): Promise<void>;
}