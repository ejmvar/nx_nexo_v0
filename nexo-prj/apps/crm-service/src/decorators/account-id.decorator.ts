import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract account_id from JWT payload in the request
 * Usage: @AccountId() accountId: string
 */
export const AccountId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.accountId) {
      throw new Error('Account ID not found in request. Ensure JwtAuthGuard is applied.');
    }

    return user.accountId;
  },
);
