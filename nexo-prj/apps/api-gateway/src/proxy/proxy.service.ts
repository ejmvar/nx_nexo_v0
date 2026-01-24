import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly serviceUrls = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    crm: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  };

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(service: string, path: string, method: string = 'GET', data?: any, headers?: any) {
    const baseUrl = this.serviceUrls[service];
    if (!baseUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    const url = `${baseUrl}${path}`;
    
    // Filter out problematic headers
    const cleanHeaders = { ...headers };
    delete cleanHeaders['host'];
    delete cleanHeaders['content-length'];
    
    const config = {
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...cleanHeaders,
      },
      timeout: 30000, // 30 second timeout
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (error: any) {
      console.error('Proxy error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        code: error?.code,
        errno: error?.errno,
        syscall: error?.syscall,
        hostname: error?.hostname,
        config: {
          url: config.url,
          method: config.method,
          headers: config.headers
        }
      });
      
      // If there's a response from the service, return it
      if (error?.response) {
        throw error.response.data;
      }
      
      throw new Error(`Service ${service} error: ${error?.message || 'Unknown error'}`);
    }
  }
}