import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            PassportModule,
            JwtModule.register({
                secret: 'secretKey', // Use environment variable in production
                signOptions: { expiresIn: '60m' },
            }),
        ],
        controllers: [AuthController],
        providers: [AuthService, JwtStrategy],
        exports: [AuthService],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map