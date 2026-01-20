import { Controller, All, Body, Headers, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service.js';

@Controller('api/v1')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('auth/*path')
  async proxyAuth(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    console.log('Proxying auth request:', req.method, req.url);
    const path = req.url.replace('/api/v1', '');
    console.log('Forwarding to path:', path);
    return this.proxyService.proxyRequest('auth', path, req.method, body, headers);
  }

  @All('crm/*path')
  async proxyCrm(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    console.log('Proxying crm request:', req.method, req.url);
    const path = req.url.replace('/api/v1', '');
    console.log('Forwarding to path:', path);
    return this.proxyService.proxyRequest('crm', path, req.method, body, headers);
  }

  @All('stock/*path')
  async proxyStock(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyService.proxyRequest('stock', path, req.method, body, headers);
  }

  @All('sales/*path')
  async proxySales(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyService.proxyRequest('sales', path, req.method, body, headers);
  }

  @All('purchases/*path')
  async proxyPurchases(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyService.proxyRequest('purchases', path, req.method, body, headers);
  }

  @All('production/*path')
  async proxyProduction(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyService.proxyRequest('production', path, req.method, body, headers);
  }

  @All('notifications/*path')
  async proxyNotifications(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyService.proxyRequest('notifications', path, req.method, body, headers);
  }
}