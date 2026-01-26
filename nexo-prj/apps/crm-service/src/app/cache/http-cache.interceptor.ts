import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service.js';

/**
 * HTTP Cache Interceptor
 * Automatically caches GET requests and invalidates cache on mutations
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);
  
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    
    // Only cache GET requests
    if (method !== 'GET') {
      // For mutations, invalidate relevant cache
      return next.handle().pipe(
        tap(() => {
          this.invalidateCacheForMutation(method, url, user?.accountId);
        }),
      );
    }

    // Skip health checks
    if (url.includes('/health') || url.includes('/api/health')) {
      return next.handle();
    }

    // Generate cache key
    const accountId = user?.accountId || 'public';
    const cacheKey = this.generateCacheKey(url, accountId);

    try {
      // Try to get from cache
      const cachedData = await this.cacheService.get(cacheKey, accountId);
      
      if (cachedData) {
        this.logger.debug(`Serving from cache: ${cacheKey}`);
        return of(cachedData);
      }

      // If not in cache, execute request and cache the result
      return next.handle().pipe(
        tap(async (data) => {
          if (data) {
            await this.cacheService.set(cacheKey, data, { 
              ttl: this.getTTL(url),
              prefix: accountId 
            });
            this.logger.debug(`Cached response: ${cacheKey}`);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache error for ${cacheKey}:`, error);
      return next.handle();
    }
  }

  /**
   * Generate cache key from URL and account
   */
  private generateCacheKey(url: string, accountId: string): string {
    // Remove query params for consistency
    const cleanUrl = url.split('?')[0];
    return `${accountId}:${cleanUrl}`;
  }

  /**
   * Get TTL based on endpoint
   */
  private getTTL(url: string): number {
    // List endpoints: 5 minutes
    if (url.includes('/clients') || 
        url.includes('/employees') || 
        url.includes('/projects') ||
        url.includes('/tasks') ||
        url.includes('/suppliers') ||
        url.includes('/professionals')) {
      return 300; // 5 minutes
    }

    // Detail endpoints: 10 minutes
    if (url.match(/\/\d+$/)) {
      return 600; // 10 minutes
    }

    // Default: 5 minutes
    return 300;
  }

  /**
   * Invalidate cache based on mutation
   */
  private async invalidateCacheForMutation(
    method: string,
    url: string,
    accountId?: string,
  ): Promise<void> {
    if (!accountId) return;

    try {
      // Extract resource from URL (clients, employees, etc.)
      const resource = this.extractResource(url);
      
      if (!resource) return;

      // Invalidate list cache for this resource
      await this.cacheService.delPattern(`*/${resource}`, accountId);
      this.logger.debug(`Invalidated cache for ${resource} (${method})`);

      // For specific resource updates/deletes, invalidate detail cache
      if (method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
        const resourceId = this.extractResourceId(url);
        if (resourceId) {
          await this.cacheService.delPattern(`*/${resource}/${resourceId}`, accountId);
        }
      }

      // Related entities that might be affected
      const relatedEntities = this.getRelatedEntities(resource);
      for (const related of relatedEntities) {
        await this.cacheService.delPattern(`*/${related}`, accountId);
      }
    } catch (error) {
      this.logger.error(`Cache invalidation error:`, error);
    }
  }

  /**
   * Extract resource name from URL
   */
  private extractResource(url: string): string | null {
    const match = url.match(/\/(clients|employees|suppliers|professionals|projects|tasks)/);
    return match ? match[1] : null;
  }

  /**
   * Extract resource ID from URL
   */
  private extractResourceId(url: string): string | null {
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // Check if it's a UUID
    if (lastSegment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      return lastSegment;
    }
    
    return null;
  }

  /**
   * Get related entities that should be invalidated
   */
  private getRelatedEntities(resource: string): string[] {
    const relationships: Record<string, string[]> = {
      clients: ['projects'],
      employees: ['tasks'],
      projects: ['tasks', 'clients'],
      tasks: ['projects'],
      suppliers: [],
      professionals: [],
    };

    return relationships[resource] || [];
  }
}
