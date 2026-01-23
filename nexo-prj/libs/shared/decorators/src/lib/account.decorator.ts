import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract account_id from JWT payload
 * Usage: @AccountId() accountId: string
 */
export const AccountId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return user?.account_id || user?.accountId || null;
  },
);
