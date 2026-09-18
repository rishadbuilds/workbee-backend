import 'reflect-metadata';

import { container } from 'tsyringe';
import { EventPublisher } from '../message-bus/PaymentEventPublisher';
import { IEventPublisher } from '../../application/ports/message-bus/IEventPublisher';

container.registerSingleton<IEventPublisher>("EventPublisher", EventPublisher);

export { container };