import { HttpService } from '@nestjs/axios';
export declare class ProxyService {
    private readonly httpService;
    private readonly serviceUrls;
    constructor(httpService: HttpService);
    proxyRequest(service: string, path: string, method?: string, data?: any, headers?: any): Promise<any>;
}
//# sourceMappingURL=proxy.service.d.ts.map