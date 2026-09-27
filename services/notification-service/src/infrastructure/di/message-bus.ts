import { container } from "tsyringe";

import { MessageEventConsumer } from "../message-bus/MessageEventConsumer";
import { WorkProgressEventConsumer } from "../message-bus/WorkProgressEventConsumer";
import { PaymentEventConsumer } from "../message-bus/PaymentEventConsumer";
import { PaymentConfirmedEventConsumer } from "../message-bus/PaymentConfirmedEventConsumer";
import { BidOfferEventConsumer } from "../message-bus/BidOfferEventConsumer";
import { BidResponseEventConsumer } from "../message-bus/BidResponseEventConsumer";


/** register messaging consumers */

container.registerSingleton(MessageEventConsumer);
container.registerSingleton(WorkProgressEventConsumer);
container.registerSingleton(PaymentEventConsumer);
container.registerSingleton(PaymentConfirmedEventConsumer);
container.registerSingleton(BidOfferEventConsumer);
container.registerSingleton(BidResponseEventConsumer);

export { container };