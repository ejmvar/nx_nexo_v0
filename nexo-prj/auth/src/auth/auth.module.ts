import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { PermissionsService } from './permissions.service';
import { JwtStrategy } from './jwt.strategy';
import {
  AccountRoleAssignment,
  RolePermission,
  AccountPermission,
  DelegationPermission,
} from '@nexo-prj/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountRoleAssignment,
      RolePermission,
      AccountPermission,
      DelegationPermission,
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [PermissionsService, JwtStrategy],
  exports: [PermissionsService],
})
export class AuthModule {}