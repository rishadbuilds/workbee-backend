/**
* rabbitmq connection and client intialization also in this file
*/

import amqp, { Channel, ChannelModel } from 'amqplib';
import { ENV } from './env';
import { logger } from './logger';

// How long to wait before trying to reconnect after a dropped connection
const RECONNECT_DELAY_MS = 5000;

export class RabbitMQConnection {
  private static connection: ChannelModel | null = null;
  private static channel: Channel | null = null;
  private static isReconnecting = false;

  static async connect(): Promise<void> {
    try {

      // heartbeat:120 gives 2 minutes tolerance instead of 60s
      const connection = await amqp.connect(ENV.RABBITMQ_URL, { heartbeat: 120 });
      const channel = await connection.createChannel();

      RabbitMQConnection.connection = connection;
      RabbitMQConnection.channel = channel;

      logger.info('- RabbitMQ connected successfully');
      RabbitMQConnection.isReconnecting = false;

      // Handle connection errors (network blip, RabbitMQ restart)
      connection.on('error', (err: Error) => {
        console.error('- RabbitMQ connection error:', err.message);
        RabbitMQConnection.connection = null;
        RabbitMQConnection.channel = null;
        RabbitMQConnection.scheduleReconnect();
      });

      // Handle heartbeat timeout — RabbitMQ fires 'close' when
      // the heartbeat is missed. Without this handler the dead connection
      // stays in memory and every subsequent getChannel() call uses it.
      connection.on('close', () => {
        logger.warn('- RabbitMQ connection closed — scheduling reconnect...');
        RabbitMQConnection.connection = null;
        RabbitMQConnection.channel = null;
        RabbitMQConnection.scheduleReconnect();
      });

    } catch (error) {
      logger.error('- RabbitMQ connection failed:', error);
      RabbitMQConnection.connection = null;
      RabbitMQConnection.channel = null;
      RabbitMQConnection.scheduleReconnect();
      throw error;
    }
  }

  static async getChannel(): Promise<Channel> {
    // Check both connection AND channel — both can die independently
    if (!RabbitMQConnection.connection || !RabbitMQConnection.channel) {
      await RabbitMQConnection.connect();
    }

    if (!RabbitMQConnection.channel) {
      throw new Error('RabbitMQ channel unavailable after connect attempt');
    }

    return RabbitMQConnection.channel;
  }

  private static scheduleReconnect(): void {
    // Guard: don't stack multiple reconnect timers
    if (RabbitMQConnection.isReconnecting) return;

    RabbitMQConnection.isReconnecting = true;
    logger.info(`- Reconnecting to RabbitMQ in ${RECONNECT_DELAY_MS / 1000}s...`);

    setTimeout(async () => {
      try {
        await RabbitMQConnection.connect();
        logger.info('- RabbitMQ reconnected successfully');
      } catch (err) {
        logger.error('- RabbitMQ reconnect attempt failed:', err);
        // connect() will call scheduleReconnect() again on failure,
        // so we reset the flag here to allow that
        RabbitMQConnection.isReconnecting = false;
      }
    }, RECONNECT_DELAY_MS);
  }

  static async close(): Promise<void> {
    if (RabbitMQConnection.channel) await RabbitMQConnection.channel.close();
    if (RabbitMQConnection.connection) await RabbitMQConnection.connection.close();
    RabbitMQConnection.connection = null;
    RabbitMQConnection.channel = null;
  }
}