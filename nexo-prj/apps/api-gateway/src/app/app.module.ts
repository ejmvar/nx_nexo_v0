import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProxyModule } from '../proxy/proxy.module.js';
import { LoggerModule } from '@nexo-prj/shared/logger';
import { HealthModule } from '@nexo-prj/shared/health';
import { MetricsModule } from '@nexo-prj/shared/metrics';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule,
    HealthModule,
    MetricsModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}