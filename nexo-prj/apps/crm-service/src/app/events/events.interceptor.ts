import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface CrmEvent {
  type: string; // 'created' | 'updated' | 'deleted'
  resource: string; // 'clients' | 'employees' | 'projects' | 'tasks' | etc.
  accountId: string;
  userId: string;
  data: any;
  timestamp: string;
}

@Injectable()
export class EventsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventsInterceptor.name);

  constructor(private eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // Only emit events for mutation operations (not GET)
    if (method === 'GET') {
      return next.handle();
    }

    // Extract resource from URL (e.g., /api/clients -> clients)
    const resourceMatch = url.match(/\/api\/([^\/\?]+)/);
    const resource = resourceMatch ? resourceMatch[1] : null;

    // Skip health checks and non-resource endpoints
    if (!resource || resource === 'health') {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response) => {
        try {
          // Get user info from request
          const user = request.user;
          if (!user || !user.accountId) {
            return;
          }

          // Determine event type based on HTTP method
          let eventType: string;
          switch (method) {
            case 'POST':
              eventType = 'created';
              break;
            case 'PUT':
            case 'PATCH':
              eventType = 'updated';
              break;
            case 'DELETE':
              eventType = 'deleted';
              break;
            default:
              return;
          }

          // Create event payload
          const event: CrmEvent = {
            type: eventType,
            resource: resource,
            accountId: user.accountId,
            userId: user.sub || user.userId,
            data: response,
            timestamp: new Date().toISOString(),
          };

          // Emit event (will be picked up by RabbitMQ publisher)
          const eventName = `${resource}.${eventType}`;
          this.eventEmitter.emit(eventName, event);

          this.logger.debug(
            `📡 Event emitted: ${eventName} for account ${user.accountId}`
          );
        } catch (error) {
          this.logger.error(
            `Failed to emit event: ${error.message}`,
            error.stack
          );
        }
      })
    );
  }
}
