import { __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
let ProxyService = class ProxyService {
    constructor(httpService) {
        this.httpService = httpService;
        this.serviceUrls = {
            auth: 'http://localhost:3000',
            crm: 'http://localhost:3002', // Placeholder for future services
            stock: 'http://localhost:3003',
            sales: 'http://localhost:3004',
            purchases: 'http://localhost:3005',
            production: 'http://localhost:3006',
            notifications: 'http://localhost:3007',
        };
    }
    async proxyRequest(service, path, method = 'GET', data, headers) {
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
        }
        catch (error) {
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
            throw new Error(`Service ${service} error: ${error?.message || 'Unknown error'}`);
        }
    }
};
ProxyService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpService])
], ProxyService);
export { ProxyService };
//# sourceMappingURL=proxy.service.js.map