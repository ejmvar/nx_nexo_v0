import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CrmModule } from '../crm/crm.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { JwtStrategy } from '../auth/jwt.strategy.js';
import { LoggerModule } from '@nexo-prj/shared/logger';
import { HealthModule } from '@nexo-prj/shared/health';
import { MetricsModule } from '@nexo-prj/shared/metrics';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
    LoggerModule,
    HealthModule,
    MetricsModule,
    DatabaseModule,
    CrmModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}