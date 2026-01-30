import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { EventsGateway } from './websocket.gateway.js';

interface CrmEvent {
  type: string;
  resource: string;
  accountId: string;
  userId: string;
  data: any;
  timestamp: string;
}

@Injectable()
export class EventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsConsumer.name);
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly exchangeName = 'crm_events';
  private readonly queueName = 'websocket_events';

  constructor(private eventsGateway: EventsGateway) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitmqUrl =
        process.env.RABBITMQ_URL || 'amqp://nexo_user:nexo_password@localhost:5672';

      this.logger.log(`🔌 Connecting to RabbitMQ: ${rabbitmqUrl.replace(/\/\/.*@/, '//***@')}`);
      this.connection = await amqplib.connect(rabbitmqUrl) as any;
      this.channel = await (this.connection as any).createChannel();

      // Assert exchange (should already exist from publisher)
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      // Assert queue for WebSocket gateway
      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      // Bind queue to exchange with wildcard pattern (all events)
      await this.channel.bindQueue(this.queueName, this.exchangeName, '#');

      this.logger.log(`✅ RabbitMQ consumer connected - Queue: ${this.queueName}`);

      // Start consuming messages
      await this.channel.consume(
        this.queueName,
        (msg) => {
          if (msg) {
            this.handleMessage(msg);
          }
        },
        { noAck: false } // Manual acknowledgment
      );

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed, reconnecting...');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to connect to RabbitMQ: ${err.message}`);
      // Retry connection after delay
      setTimeout(() => this.connect(), 5000);
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
      this.logger.log('🔌 RabbitMQ consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  private handleMessage(msg: amqplib.ConsumeMessage) {
    try {
      const content = msg.content.toString();
      const event: CrmEvent = JSON.parse(content);

      this.logger.debug(
        `📥 Received event: ${event.resource}.${event.type} for account ${event.accountId}`
      );

      // Broadcast event to WebSocket clients in the account room
      const eventName = `${event.resource}.${event.type}`;
      this.eventsGateway.broadcastToAccount(event.accountId, eventName, event);

      // Acknowledge message
      if (this.channel) {
        this.channel.ack(msg);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to handle message: ${err.message}`,
        err.stack
      );

      // Reject message and requeue
      if (this.channel) {
        this.channel.nack(msg, false, true);
      }
    }
  }
}
