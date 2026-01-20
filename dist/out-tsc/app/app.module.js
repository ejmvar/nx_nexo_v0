import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from '../proxy/proxy.module';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [ProxyModule],
        controllers: [AppController],
        providers: [AppService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map