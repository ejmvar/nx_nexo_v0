import { __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        // Mock validation - replace with real logic
        if (username === 'admin' && password === 'password') {
            return { userId: 1, username: 'admin' };
        }
        return null;
    }
    async login(username, password) {
        const user = await this.validateUser(username, password);
        if (user) {
            const payload = { username: user.username, sub: user.userId };
            return {
                access_token: this.jwtService.sign(payload),
            };
        }
        throw new Error('Invalid credentials');
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map