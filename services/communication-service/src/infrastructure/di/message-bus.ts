import { container } from "tsyringe";
import { BidEventPublisher } from "../message-bus/BidEventPublisher";
import { IBidEventPublisher } from "../../application/ports/message-bus/IBidEventPublisher";

container.registerSingleton<IBidEventPublisher>("BidEventPublisher", BidEventPublisher);