import { __decorate, __metadata, __param } from "tslib";
import { Controller, All, Body, Headers, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
let ProxyController = class ProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async proxyAuth(req, body, headers) {
        const path = req.url.replace('/api/v1/auth', '');
        return this.proxyService.proxyRequest('auth', path, req.method, body, headers);
    }
    async proxyCrm(req, body, headers) {
        const path = req.url.replace('/api/v1/crm', '');
        return this.proxyService.proxyRequest('crm', path, req.method, body, headers);
    }
    async proxyStock(req, body, headers) {
        const path = req.url.replace('/api/v1/stock', '');
        return this.proxyService.proxyRequest('stock', path, req.method, body, headers);
    }
    async proxySales(req, body, headers) {
        const path = req.url.replace('/api/v1/sales', '');
        return this.proxyService.proxyRequest('sales', path, req.method, body, headers);
    }
    async proxyPurchases(req, body, headers) {
        const path = req.url.replace('/api/v1/purchases', '');
        return this.proxyService.proxyRequest('purchases', path, req.method, body, headers);
    }
    async proxyProduction(req, body, headers) {
        const path = req.url.replace('/api/v1/production', '');
        return this.proxyService.proxyRequest('production', path, req.method, body, headers);
    }
    async proxyNotifications(req, body, headers) {
        const path = req.url.replace('/api/v1/notifications', '');
        return this.proxyService.proxyRequest('notifications', path, req.method, body, headers);
    }
};
__decorate([
    All('auth/*'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyAuth", null);
__decorate([
    All('crm/*'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyCrm", null);
__decorate([
    All('stock/*'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyStock", null);
__decorate([
    All('sales/*'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxySales", null);
__decorate([
    All('purchases/*'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyPurchases", null);
__decorate([
    All('production/*'),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyProduction", null);
__decorate([
    All('notifications/*'),
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