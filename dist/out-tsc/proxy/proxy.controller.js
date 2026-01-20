import { __decorate, __metadata, __param } from "tslib";
import { Controller, All, Body, Headers, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
let ProxyController = class ProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async proxyAuth(req, body, headers) {
        console.log('Proxying auth request:', req.method, req.url);
        const path = req.url.replace('/api/v1', '');
        console.log('Forwarding to path:', path);
        return this.proxyService.proxyRequest('auth', path, req.method, body, headers);
    }
    async proxyCrm(req, body, headers) {
        console.log('Proxying crm request:', req.method, req.url);
        const path = req.url.replace('/api/v1', '');
        console.log('Forwarding to path:', path);
        return this.proxyService.proxyRequest('crm', path, req.method, body, headers);
    }
    async proxyStock(req, body, headers) {
        const path = req.url.replace('/api/v1', '');
        return this.proxyService.proxyRequest('stock', path, req.method, body, headers);
    }
    async proxySales(req, body, headers) {
        const path = req.url.replace('/api/v1', '');
        return this.proxyService.proxyRequest('sales', path, req.method, body, headers);
    }
    async proxyPurchases(req, body, headers) {
        const path = req.url.replace('/api/v1', '');
        return this.proxyService.proxyRequest('purchases', path, req.method, body, headers);
    }
    async proxyProduction(req, body, headers) {
        const path = req.url.replace('/api/v1', '');
        return this.proxyService.proxyRequest('production', path, req.method, body, headers);
    }
    async proxyNotifications(req, body, headers) {
        const path = req.url.replace('/api/v1', '');
        return this.proxyService.proxyRequest('notifications', path, req.method, body, headers);
    }
};
__decorate([
    All('auth/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyAuth", null);
__decorate([
    All('crm/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyCrm", null);
__decorate([
    All('stock/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyStock", null);
__decorate([
    All('sales/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxySales", null);
__decorate([
    All('purchases/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyPurchases", null);
__decorate([
    All('production/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyProduction", null);
__decorate([
    All('notifications/*path'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyNotifications", null);
ProxyController = __decorate([
    Controller('api/v1'),
    __metadata("design:paramtypes", [ProxyService])
], ProxyController);
export { ProxyController };
//# sourceMappingURL=proxy.controller.js.map