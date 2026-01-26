import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private db: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has at least one of the required permissions
    const hasPermission = await this.checkUserPermissions(
      user.userId,
      requiredPermissions
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(' OR ')}`
      );
    }

    return true;
  }

  private async checkUserPermissions(
    userId: string,
    requiredPermissions: string[]
  ): Promise<boolean> {
    try {
      // Query to check if user has any of the required permissions
      // Uses the wildcard permission logic (e.g., 'client:*' grants all client permissions)
      const result = await this.db.query(
        `SELECT EXISTS (
          SELECT 1
          FROM user_roles ur
          JOIN role_permissions rp ON ur.role_id = rp.role_id
          JOIN permissions p ON rp.permission_id = p.id
          WHERE ur.user_id = $1
          AND (
            p.name = ANY($2::varchar[])
            OR p.name = ANY(
              SELECT SPLIT_PART(perm, ':', 1) || ':*'
              FROM unnest($2::varchar[]) AS perm
            )
          )
        ) as has_permission`,
        [userId, requiredPermissions]
      );

      return result.rows[0]?.has_permission || false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
}
