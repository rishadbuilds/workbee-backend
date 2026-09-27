import 'reflect-metadata';
import { container } from 'tsyringe';
import { NotificationRepository } from '../database/repositories/NotificationRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';

// Register repositories
container.registerSingleton<INotificationRepository>("NotificationRepository", NotificationRepository);

export { container };