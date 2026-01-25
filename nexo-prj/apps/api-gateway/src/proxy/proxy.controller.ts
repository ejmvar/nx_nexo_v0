import { Controller, All, Body, Headers, Req, Get, Param } from '@nestjs/common';
import { ProxyService } from './proxy.service.js';

@Controller('api')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        crm: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
      },
    };
  }

  // Use modern path parameter syntax instead of deprecated wildcard
  @All('auth/*splat')
  async proxyAuth(@Req() req: any, @Body() body: any, @Headers() headers: any, @Param('splat') splat: string) {
    const path = req.url.replace('/api/auth', '/api/auth');
    return this.proxyService.proxyRequest('auth', path, req.method, body, headers);
  }

  @All('crm/*splat')
  async proxyCrm(@Req() req: any, @Body() body: any, @Headers() headers: any, @Param('splat') splat: string) {
    // Strip /api/crm prefix and forward the rest to CRM service at /api
    const path = req.url.replace('/api/crm', '/api');
    return this.proxyService.proxyRequest('crm', path, req.method, body, headers);
  }
}