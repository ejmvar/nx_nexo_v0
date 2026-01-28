import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsInterceptor } from './metrics.interceptor';

/**
 * Metrics Module - Provides Prometheus metrics collection
 * 
 * This is a global module that can be imported once in the root AppModule
 * and used throughout the application. It provides:
 * - MetricsService: For recording metrics
 * - MetricsController: For exposing /metrics endpoint
 * - MetricsInterceptor: For automatically recording HTTP request metrics
 * 
 * Usage in AppModule:
 * ```typescript
 * import { MetricsModule } from '@nexo-prj/shared';
 * 
 * @Module({
 *   imports: [MetricsModule],
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
@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, MetricsInterceptor],
  exports: [MetricsService, MetricsInterceptor],
})
export class MetricsModule {}
