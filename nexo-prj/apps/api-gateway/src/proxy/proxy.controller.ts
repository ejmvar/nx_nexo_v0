import { Controller, All, Body, Headers, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('api/v1')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('auth/*')
  async proxyAuth(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/auth', '');
    return this.proxyService.proxyRequest('auth', path, req.method, body, headers);
  }

  @All('crm/*')
  async proxyCrm(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/crm', '');
    return this.proxyService.proxyRequest('crm', path, req.method, body, headers);
  }

  @All('stock/*')
  async proxyStock(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/stock', '');
    return this.proxyService.proxyRequest('stock', path, req.method, body, headers);
  }

  @All('sales/*')
  async proxySales(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/sales', '');
    return this.proxyService.proxyRequest('sales', path, req.method, body, headers);
  }

  @All('purchases/*')
  async proxyPurchases(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/purchases', '');
    return this.proxyService.proxyRequest('purchases', path, req.method, body, headers);
  }

  @All('production/*')
  async proxyProduction(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/production', '');
    return this.proxyService.proxyRequest('production', path, req.method, body, headers);
  }

  @All('notifications/*')
  async proxyNotifications(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/api/v1/notifications', '');
    return this.proxyService.proxyRequest('notifications', path, req.method, body, headers);
  }
}