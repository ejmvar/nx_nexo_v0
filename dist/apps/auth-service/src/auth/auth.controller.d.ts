import { AuthService } from './auth.service.js';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): any;
}
//# sourceMappingURL=auth.controller.d.ts.map