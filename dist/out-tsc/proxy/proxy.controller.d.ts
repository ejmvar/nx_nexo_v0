import { ProxyService } from './proxy.service';
export declare class ProxyController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    proxyAuth(req: any, body: any, headers: any): Promise<any>;
    proxyCrm(req: any, body: any, headers: any): Promise<any>;
    proxyStock(req: any, body: any, headers: any): Promise<any>;
    proxySales(req: any, body: any, headers: any): Promise<any>;
    proxyPurchases(req: any, body: any, headers: any): Promise<any>;
    proxyProduction(req: any, body: any, headers: any): Promise<any>;
    proxyNotifications(req: any, body: any, headers: any): Promise<any>;
}
//# sourceMappingURL=proxy.controller.d.ts.map