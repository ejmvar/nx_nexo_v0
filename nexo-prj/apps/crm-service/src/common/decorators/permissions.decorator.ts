import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route
 * @param permissions - Array of permission names required (e.g., ['client:read', 'client:write'])
 * 
 * @example
 * @RequirePermissions('client:write')
 * @Put('/clients/:id')
 * async updateClient() { ... }
 * 
 * @example
 * @RequirePermissions('client:read', 'project:read')
 * @Get('/dashboard')
 * async getDashboard() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
