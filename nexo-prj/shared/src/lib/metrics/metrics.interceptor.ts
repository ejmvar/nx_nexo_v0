import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

/**
 * Metrics Interceptor - Automatically records HTTP request metrics
 * 
 * This interceptor captures all HTTP requests and records:
 * - Request count (by method, route, status)
 * - Request duration (histogram for percentiles)
 * - Error count (4xx and 5xx status codes)
 * 
 * It runs on all endpoints except /metrics (to avoid recursion)
 * 
 * Usage: Register as APP_INTERCEPTOR in AppModule
 * ```typescript
 * import { APP_INTERCEPTOR } from '@nestjs/core';
 * import { MetricsInterceptor } from '@nexo-prj/shared';
 * 
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_INTERCEPTOR,
 *       useClass: MetricsInterceptor,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Skip metrics endpoint to avoid recursion
    if (request.url?.startsWith('/metrics')) {
      return next.handle();
    }
    
    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.url;
    const serviceName = process.env.SERVICE_NAME || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          // Success - record metrics
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds
          const status = response.statusCode;
          
          this.metricsService.recordHttpRequest(
            method,
            route,
            status,
            duration,
            serviceName
          );
        },
        error: (error) => {
          // Error - record with error status
          const duration = (Date.now() - startTime) / 1000;
          const status = error?.status || 500;
          
          this.metricsService.recordHttpRequest(
            method,
            route,
            status,
            duration,
            serviceName
          );
        },
      })
    );
  }
}
