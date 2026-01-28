import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DatabaseService } from '../../database/database.service.js';

/**
 * AuditLoggerInterceptor automatically logs all CRUD operations to the audit_logs table.
 * 
 * Usage:
 *   @UseInterceptors(AuditLoggerInterceptor)
 *   @Controller('api')
 *   export class MyController { ... }
 * 
 * The interceptor captures:
 * - User ID (from request.user)
 * - Action type (CREATE/READ/UPDATE/DELETE based on HTTP method)
 * - Entity type and ID (parsed from route)
 * - Request metadata (IP, user agent, method, path)
 * - Response status code
 * - Error messages (if operation fails)
 */
@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  constructor(private readonly database: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<any>();
    const response = context.switchToHttp().getResponse<any>();
    
    // Extract metadata from request
    const user = request.user as any;
    const accountId = user?.accountId || user?.account_id;
    const userId = user?.userId || user?.sub || user?.id;
    const method = request.method;
    const path = request.route?.path || request.path;
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent');
    
    // Parse entity info from route
    const entityInfo = this.parseEntityFromRoute(path, request.params);
    
    // Map HTTP method to action
    const action = this.mapMethodToAction(method);
    
    // Start timestamp for duration tracking
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        // Log successful operations
        const duration = Date.now() - startTime;
        this.logAudit({
          accountId,
          userId,
          action,
          entityType: entityInfo.type,
          entityId: entityInfo.id,
          changes: this.extractChanges(method, request.body, data),
          ipAddress,
          userAgent,
          requestMethod: method,
          requestPath: path,
          statusCode: response.statusCode,
          errorMessage: null,
          duration,
        });
      }),
      catchError((error) => {
        // Log failed operations
        const duration = Date.now() - startTime;
        this.logAudit({
          accountId,
          userId,
          action,
          entityType: entityInfo.type,
          entityId: entityInfo.id,
          changes: null,
          ipAddress,
          userAgent,
          requestMethod: method,
          requestPath: path,
          statusCode: error.status || 500,
          errorMessage: error.message || 'Unknown error',
          duration,
        });
        
        // Re-throw error to continue error handling chain
        throw error;
      })
    );
  }

  /**
   * Parse entity type and ID from route path and params
   * Examples:
   *   /api/clients/:id -> { type: 'client', id: '...' }
   *   /api/tasks -> { type: 'task', id: null }
   */
  private parseEntityFromRoute(path: string, params: any): { type: string; id: string | null } {
    // Remove /api prefix
    const cleanPath = path.replace(/^\/api\/?/, '');
    
    // Extract entity type (first path segment)
    const segments = cleanPath.split('/').filter(s => s && s !== ':id');
    const entityType = segments[0] || 'unknown';
    
    // Remove trailing 's' to get singular form (clients -> client)
    const singularType = entityType.endsWith('s') ? entityType.slice(0, -1) : entityType;
    
    // Get entity ID from params if available
    const entityId = params?.id || null;
    
    return { type: singularType, id: entityId };
  }

  /**
   * Map HTTP method to audit action
   */
  private mapMethodToAction(method: string): string {
    const actionMap: Record<string, string> = {
      'GET': 'READ',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'PATCH': 'UPDATE',
      'DELETE': 'DELETE',
    };
    
    return actionMap[method] || 'UNKNOWN';
  }

  /**
   * Extract changes from request/response for audit trail
   */
  private extractChanges(method: string, requestBody: any, responseData: any): any {
    if (method === 'POST') {
      // CREATE: Log the new resource
      return {
        new: requestBody || responseData,
      };
    } else if (method === 'PUT' || method === 'PATCH') {
      // UPDATE: Log changed fields
      return {
        changes: requestBody,
      };
    } else if (method === 'DELETE') {
      // DELETE: Log the deleted resource ID
      return {
        deleted: true,
      };
    } else if (method === 'GET') {
      // READ: Don't log the full response to save space
      // Only log if it's a single record (has id in response)
      if (responseData?.id) {
        return {
          accessed: { id: responseData.id },
        };
      }
      return null;
    }
    
    return null;
  }

  /**
   * Insert audit log into database
   */
  private async logAudit(params: {
    accountId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string | null;
    changes: any;
    ipAddress: string;
    userAgent: string;
    requestMethod: string;
    requestPath: string;
    statusCode: number;
    errorMessage: string | null;
    duration: number;
  }): Promise<void> {
    try {
      // Only log if we have required identifiers
      if (!params.accountId || !params.userId) {
        return;
      }

      await this.database.query(
        `
          SELECT log_audit(
            $1::uuid,  -- account_id
            $2::uuid,  -- user_id
            $3,        -- action
            $4,        -- entity_type
            $5::uuid,  -- entity_id
            $6::jsonb, -- changes
            $7::inet,  -- ip_address
            $8,        -- user_agent
            $9,        -- request_method
            $10,       -- request_path
            $11,       -- status_code
            $12        -- error_message
          )
        `,
        [
          params.accountId,
          params.userId,
          params.action,
          params.entityType,
          params.entityId,
          params.changes ? JSON.stringify(params.changes) : null,
          params.ipAddress,
          params.userAgent,
          params.requestMethod,
          params.requestPath,
          params.statusCode,
          params.errorMessage,
        ]
      );
    } catch (error) {
      // Log audit failures to console but don't throw
      // (we don't want audit logging failures to break the application)
      console.error('[AuditLogger] Failed to log audit:', error instanceof Error ? error.message : String(error));
    }
  }
}
