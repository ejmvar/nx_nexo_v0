import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key-change-in-production'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Support both accountId (camelCase) and account_id (snake_case)
    const accountId = payload.accountId || payload.account_id;
    
    if (!accountId) {
      throw new UnauthorizedException('Account ID missing from token');
    }

    return {
      userId: payload.sub,
      accountId: accountId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
