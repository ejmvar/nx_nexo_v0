import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './websocket.gateway.js';
import { EventsConsumer } from './events.consumer.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [EventsGateway, EventsConsumer],
  exports: [EventsGateway, EventsConsumer],
})
export class WebSocketModule {}
