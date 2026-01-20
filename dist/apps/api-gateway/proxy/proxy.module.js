import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
let ProxyModule = class ProxyModule {
};
ProxyModule = __decorate([
    Module({
        imports: [HttpModule],
        controllers: [ProxyController],
        providers: [ProxyService],
    })
], ProxyModule);
export { ProxyModule };
//# sourceMappingURL=proxy.module.js.map