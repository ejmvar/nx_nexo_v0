import { Controller, All, Body, Headers, Req, Get } from '@nestjs/common';
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
    };
  }

  @All('auth/*')
  async proxyAuth(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/auth', '/api/auth');
    return this.proxyService.proxyRequest('auth', path, req.method, body, headers);
  }

  @All('crm/*')
  async proxyCrm(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/crm', '/api/crm');
    return this.proxyService.proxyRequest('crm', path, req.method, body, headers);
  }
}