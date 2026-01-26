import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CrmModule } from '../crm/crm.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { JwtStrategy } from '../auth/jwt.strategy.js';
import { CacheModule } from './cache/cache.module.js';
import { HttpCacheInterceptor } from './cache/http-cache.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: { expiresIn: '15m' },
      }),
    }),
    DatabaseModule,
    CacheModule,
    CrmModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}