import { container } from "tsyringe";
import { BidEventPublisher } from "../message-bus/BidEventPublisher";

container.registerSingleton("BidEventPublisher", BidEventPublisher);