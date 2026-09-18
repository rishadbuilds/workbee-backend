import 'reflect-metadata';
import { container } from 'tsyringe';
import { EventPublisher } from '../message-bus/PaymentCreditedEventPublisher';

container.registerSingleton("EventPublisher", EventPublisher);

export { container };