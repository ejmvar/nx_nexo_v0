import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface CacheConfig {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  prefix?: string; // Cache key prefix (default: 'nexo')
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly defaultTTL = 300; // 5 minutes
  private readonly keyPrefix = 'nexo';

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    this.redis = new Redis(redisConfig);

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error.message);
    });

    this.redis.on('close', () => {
      this.logger.warn('⚠️  Redis connection closed');
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
    this.logger.log('Redis connection closed');
  }

  /**
   * Generate cache key with prefix
   */
  private getCacheKey(key: string, accountId?: string): string {
    const parts = [this.keyPrefix];
    if (accountId) {
      parts.push(`account:${accountId}`);
    }
    parts.push(key);
    return parts.join(':');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, accountId?: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key, accountId);
      const value = await this.redis.get(cacheKey);
      
      if (!value) {
        this.logger.debug(`Cache MISS: ${cacheKey}`);
        return null;
      }

      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, config?: CacheConfig): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key, config?.prefix);
      const ttl = config?.ttl || this.defaultTTL;
      
      await this.redis.setex(cacheKey, ttl, JSON.stringify(value));
      this.logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete specific key from cache
   */
  async del(key: string, accountId?: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key, accountId);
      await this.redis.del(cacheKey);
      this.logger.debug(`Cache DEL: ${cacheKey}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern: string, accountId?: string): Promise<void> {
    try {
      const searchPattern = this.getCacheKey(pattern, accountId);
      const keys = await this.redis.keys(searchPattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Cache DEL pattern: ${searchPattern} (${keys.length} keys)`);
      }
    } catch (error) {
      this.logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Invalidate all cache for an account
   */
  async invalidateAccount(accountId: string): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}:account:${accountId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Invalidated ${keys.length} cache keys for account ${accountId}`);
      }
    } catch (error) {
      this.logger.error(`Cache invalidate account error for ${accountId}:`, error);
    }
  }

  /**
   * Flush all cache (use with caution)
   */
  async flush(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.warn('⚠️  All cache flushed');
    } catch (error) {
      this.logger.error('Cache flush error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string;
    hits?: number;
    misses?: number;
  }> {
    try {
      const info = await this.redis.info('stats');
      const memory = await this.redis.info('memory');
      const dbsize = await this.redis.dbsize();

      // Parse stats
      const stats: any = { connected: true, keys: dbsize };
      
      // Extract memory usage
      const memMatch = memory.match(/used_memory_human:([\d.]+[KMG]?)/);
      if (memMatch) {
        stats.memory = memMatch[1];
      }

      // Extract hit/miss ratio
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      if (hitsMatch) stats.hits = parseInt(hitsMatch[1], 10);
      if (missesMatch) stats.misses = parseInt(missesMatch[1], 10);

      return stats;
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return { connected: false, keys: 0, memory: '0' };
    }
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.redis.status === 'ready';
  }
}
