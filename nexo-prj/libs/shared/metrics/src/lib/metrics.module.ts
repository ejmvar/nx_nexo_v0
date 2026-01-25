import { Module } from '@nestjs/common';
import { PrometheusModule as NestPrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    NestPrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
      defaultLabels: {
        app: process.env.SERVICE_NAME || 'nexo-service',
      },
    }),
  ],
  exports: [NestPrometheusModule],
})
export class MetricsModule {}
