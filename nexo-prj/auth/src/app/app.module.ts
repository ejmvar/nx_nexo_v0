import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  User,
  Account,
  UserAccount,
  Role,
  AccountRoleAssignment,
  Permission,
  RolePermission,
  AccountPermission,
  Delegation,
  DelegationPermission,
  AuditLog,
  MetricsModule,
  MetricsInterceptor,
} from '@nexo-prj/shared';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MetricsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'nexo_user',
      password: process.env.DB_PASSWORD || 'nexo_password',
      database: process.env.DB_NAME || 'nexo',
      entities: [
        User,
        Account,
        UserAccount,
        Role,
        AccountRoleAssignment,
        Permission,
        RolePermission,
        AccountPermission,
        Delegation,
        DelegationPermission,
        AuditLog,
      ],
      synchronize: true, // For dev, use migrations in prod
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
