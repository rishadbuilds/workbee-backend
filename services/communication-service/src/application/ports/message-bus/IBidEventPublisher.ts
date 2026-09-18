import { IBidOfferEvent } from "../../../domain/message-contracts/IBidOfferEvent";
import { IBidResponseEvent } from "../../../domain/message-contracts/IBidResponseEvent";

export interface IBidEventPublisher {
  publishBidOffer(event: IBidOfferEvent): Promise<void>;

  publishBidResponse(event: IBidResponseEvent): Promise<void>;
}