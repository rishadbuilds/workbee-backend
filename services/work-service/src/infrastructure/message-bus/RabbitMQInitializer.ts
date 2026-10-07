import { container } from 'tsyringe';
import { RabbitMQConnection } from '../config/rabbitmq';
import { WorkerValidationConsumer } from './WorkerValidationConsumer';
import { logger } from '../logger/logger';
import { WorkerChangePasswordConsumer } from './WorkerChangePasswordConsumer';
import { WorkerPasswordResetConsumer } from './WorkerPasswordResetConsumer';

/**
 * Rabbitmq Clients Initializer
 * 
 */

export class RabbitMQInitializer {
    private static isInitialized = false;

    static async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.info('- Messaging service already initialized');
            return;
        }

        try {
            await RabbitMQConnection.connect();
            logger.info('- RabbitMQ connected');

            const channel = await RabbitMQConnection.getChannel();

            // consumers --------------

            // Start Worker Validation Consumer
            const workerValidationConsumer = container.resolve(WorkerValidationConsumer);
            await workerValidationConsumer.start(channel);
            logger.info('- Worker Validation Consumer started');


            //  Worker Change Password
            const workerChangePasswordConsumer = container.resolve(WorkerChangePasswordConsumer);
            await workerChangePasswordConsumer.start(channel);
            logger.info('- Worker Change Password Consumer started');

            //  Worker reset pass
            const workerPasswordResetConsumer = container.resolve(WorkerPasswordResetConsumer);
            await workerPasswordResetConsumer.start(channel);
            logger.info('- Worker Reset Password Consumer started');


            this.isInitialized = true;
            logger.info('- Messaging Service initialized successfully');
        } catch (error) {
            logger.error('- Failed to initialize Messaging Service:', error);
            throw error;
        }
    }
}

export { RabbitMQConnection } from '../config/rabbitmq';
export { WorkerValidationConsumer } from './WorkerValidationConsumer';
export { WorkerChangePasswordConsumer } from './WorkerChangePasswordConsumer';