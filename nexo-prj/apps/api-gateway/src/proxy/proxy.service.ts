import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly serviceUrls = {
    auth: 'http://localhost:3000',
    crm: 'http://localhost:3002', // Placeholder for future services
    stock: 'http://localhost:3003',
    sales: 'http://localhost:3004',
    purchases: 'http://localhost:3005',
    production: 'http://localhost:3006',
    notifications: 'http://localhost:3007',
  };

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(service: string, path: string, method: string = 'GET', data?: any, headers?: any) {
    const baseUrl = this.serviceUrls[service];
    if (!baseUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    const url = `${baseUrl}${path}`;
    const config = {
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (error: any) {
      throw new Error(`Service ${service} error: ${error?.message || 'Unknown error'}`);
    }
  }
}