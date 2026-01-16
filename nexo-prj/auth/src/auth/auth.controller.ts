import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private permissionsService: PermissionsService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Mock login - in real app, validate with Keycloak or DB
    if (body.email && body.password) {
      const payload = { email: body.email, accountId: 'mock-account-id' };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    return { error: 'Invalid credentials' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async checkPermission(@Request() req, @Body() body: { resource: string; action: string }) {
    const accountId = req.user.accountId;
    const hasPerm = await this.permissionsService.hasPermission(accountId, body.resource, body.action);
    return { hasPermission: hasPerm };
  }
}