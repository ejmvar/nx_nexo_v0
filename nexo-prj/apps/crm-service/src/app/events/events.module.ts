import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsPublisher } from './events.publisher.js';
import { EventsInterceptor } from './events.interceptor.js';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true, // Enable ** wildcard support
      delimiter: '.', // Event name delimiter
      maxListeners: 10,
    }),
  ],
  providers: [EventsPublisher, EventsInterceptor],
  exports: [EventsPublisher, EventsInterceptor],
})
export class EventsModule {}
