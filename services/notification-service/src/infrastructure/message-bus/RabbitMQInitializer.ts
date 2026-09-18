import { container } from "tsyringe";
import { logger } from "../config/logger";
import { RabbitMQConnection } from "../config/rabbitmq";
import { MessageEventConsumer } from "./MessageEventConsumer";
import { WorkProgressEventConsumer } from "./WorkProgressEventConsumer";
import { PaymentEventConsumer } from "./PaymentEventConsumer";

export class RabbitMQInitializer {
    private static isInitialized = false;

    static async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.warn('- Messaging service already initialized');
            return;
        }

        try {
            await RabbitMQConnection.connect();
            logger.info('- RabbitMQ connected');

            /** consumers */

            // msg 
            const messageConsumer = container.resolve(MessageEventConsumer);
            await messageConsumer.start();
            logger.info("- Message event consumer started");

            // work progress
            const workProgressEventConsumer = container.resolve(WorkProgressEventConsumer);
            await workProgressEventConsumer.start();
            logger.info("- Work Progress Notification Consumer started");

            // inside initialize()
            const paymentEventConsumer = container.resolve(PaymentEventConsumer);
            await paymentEventConsumer.start();
            logger.info("- Payment Notification Consumer started");

            this.isInitialized = true;
            logger.info('- Messaging Service initialized successfully');
        } catch (error) {
            logger.error('- Failed to initialize Messaging Service:', error);
            throw error;
        }
    }
}