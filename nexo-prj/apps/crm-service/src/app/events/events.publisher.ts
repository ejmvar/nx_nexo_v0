import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as amqplib from 'amqplib';

interface CrmEvent {
  type: string;
  resource: string;
  accountId: string;
  userId: string;
  data: any;
  timestamp: string;
}

@Injectable()
export class EventsPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsPublisher.name);
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly exchangeName = 'crm_events';
  private connecting = false;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    if (this.connecting || this.connection) {
      return;
    }

    this.connecting = true;

    try {
      const rabbitmqUrl =
        process.env.RABBITMQ_URL || 'amqp://nexo_user:nexo_password@localhost:5672';

      this.logger.log(`🔌 Connecting to RabbitMQ: ${rabbitmqUrl.replace(/\/\/.*@/, '//***@')}`);
      this.connection = await amqplib.connect(rabbitmqUrl) as any;
      this.channel = await (this.connection as any).createChannel();

      // Declare exchange for events (fanout - broadcast to all consumers)
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      this.logger.log(`✅ RabbitMQ connected - Exchange: ${this.exchangeName}`);

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
      });
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      this.connection = null;
      this.channel = null;
    } finally {
      this.connecting = false;
    }
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await (this.channel as any).close();
        this.channel = null;
      }
      if (this.connection) {
        await (this.connection as any).close();
        this.connection = null;
      }
      this.logger.log('🔌 RabbitMQ disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  // Generic event listener that catches all CRM events
  @OnEvent('**')
  async handleEvent(event: CrmEvent) {
    // Only handle events with proper structure
    if (!event || !event.type || !event.resource || !event.accountId) {
      return;
    }

    await this.publishEvent(event);
  }

  private async publishEvent(event: CrmEvent) {
    try {
      // Reconnect if connection lost
      if (!this.channel || !this.connection) {
        await this.connect();
      }

      // Still no connection? Log and skip
      if (!this.channel) {
        this.logger.warn('Cannot publish event: No RabbitMQ connection');
        return;
      }

      // Routing key format: resource.type (e.g., "clients.created")
      const routingKey = `${event.resource}.${event.type}`;

      // Publish to exchange
      const message = JSON.stringify(event);
      this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          contentType: 'application/json',
        }
      );

      this.logger.debug(
        `📤 Published event: ${routingKey} to account ${event.accountId}`
      );
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error.message}`, error.stack);
    }
  }
}
