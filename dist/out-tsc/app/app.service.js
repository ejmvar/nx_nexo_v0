import { __decorate } from "tslib";
import { Injectable } from '@nestjs/common';
let AppService = class AppService {
    getHello() {
        return 'API Gateway is running!';
    }
};
AppService = __decorate([
    Injectable()
], AppService);
export { AppService };
//# sourceMappingURL=app.service.js.map