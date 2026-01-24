import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';
let CrmModule = class CrmModule {
};
CrmModule = __decorate([
    Module({
        controllers: [CrmController],
        providers: [CrmService],
        exports: [CrmService],
    })
], CrmModule);
export { CrmModule };
//# sourceMappingURL=crm.module.js.map