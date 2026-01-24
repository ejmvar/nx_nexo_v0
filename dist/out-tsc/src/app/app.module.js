import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CrmModule } from '../crm/crm.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [CrmModule],
        controllers: [AppController],
        providers: [AppService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map