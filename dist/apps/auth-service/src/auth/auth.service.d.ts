import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(username: string, password: string): Promise<{
        access_token: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map