import { Injectable } from '@nestjs/common';
import { register, Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Metrics Service - Prometheus metrics collection
 * 
 * This service provides a centralized way to collect and expose metrics
 * for monitoring with Prometheus. It includes:
 * - HTTP request metrics (count, duration, errors)
 * - Business metrics (operations, entities)
 * - System metrics (CPU, memory, event loop)
 */
@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  
  // HTTP Metrics
  public readonly httpRequestsTotal: Counter;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestErrors: Counter;
  
  // Database Metrics
  public readonly dbQueriesTotal: Counter;
  public readonly dbQueryDuration: Histogram;
  public readonly dbConnectionsActive: Gauge;
  
  // Cache Metrics
  public readonly cacheHitsTotal: Counter;
  public readonly cacheMissesTotal: Counter;
  public readonly cacheSize: Gauge;
  
  // Business Metrics
  public readonly operationsTotal: Counter;
  public readonly entitiesTotal: Gauge;
  
  // WebSocket Metrics (for CRM service)
  public readonly wsConnectionsActive: Gauge;
  public readonly wsMessagesTotal: Counter;

  constructor() {
    this.registry = register;
    
    // Clear existing metrics (prevents duplicate metrics on hot reload)
    this.registry.clear();
    
    // Collect default metrics (CPU, memory, event loop, etc.)
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'nodejs_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });
    
    // HTTP Request Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status', 'service'],
      registers: [this.registry],
    });
    
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status', 'service'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });
    
    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type', 'service'],
      registers: [this.registry],
    });
    
    // Database Metrics
    this.dbQueriesTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'service'],
      registers: [this.registry],
    });
    
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table', 'service'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
    
    this.dbConnectionsActive = new Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      labelNames: ['service'],
      registers: [this.registry],
    });
    
    // Cache Metrics
    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_key', 'service'],
      registers: [this.registry],
    });
    
    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_key', 'service'],
      registers: [this.registry],
    });
    
    this.cacheSize = new Gauge({
      name: 'cache_size_bytes',
      help: 'Current size of cache in bytes',
      labelNames: ['service'],
      registers: [this.registry],
    });
    
    // Business Metrics
    this.operationsTotal = new Counter({
      name: 'business_operations_total',
      help: 'Total number of business operations',
      labelNames: ['operation', 'entity_type', 'status', 'service'],
      registers: [this.registry],
    });
    
    this.entitiesTotal = new Gauge({
      name: 'business_entities_total',
      help: 'Total number of entities by type',
      labelNames: ['entity_type', 'service'],
      registers: [this.registry],
    });
    
    // WebSocket Metrics
    this.wsConnectionsActive = new Gauge({
      name: 'ws_connections_active',
      help: 'Number of active WebSocket connections',
      labelNames: ['service'],
      registers: [this.registry],
    });
    
    this.wsMessagesTotal = new Counter({
      name: 'ws_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['type', 'direction', 'service'],
      registers: [this.registry],
    });
  }
  
  /**
   * Get metrics in Prometheus text format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
  
  /**
   * Get metrics as JSON (for debugging)
   */
  async getMetricsJSON(): Promise<any> {
    return this.registry.getMetricsAsJSON();
  }
  
  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
    service: string
  ): void {
    this.httpRequestsTotal.inc({ method, route, status: status.toString(), service });
    this.httpRequestDuration.observe({ method, route, status: status.toString(), service }, duration);
    
    if (status >= 400) {
      const errorType = status >= 500 ? 'server_error' : 'client_error';
      this.httpRequestErrors.inc({ method, route, error_type: errorType, service });
    }
  }
  
  /**
   * Record database query metrics
   */
  recordDbQuery(
    operation: string,
    table: string,
    duration: number,
    service: string
  ): void {
    this.dbQueriesTotal.inc({ operation, table, service });
    this.dbQueryDuration.observe({ operation, table, service }, duration);
  }
  
  /**
   * Record cache metrics
   */
  recordCacheHit(cacheKey: string, service: string): void {
    this.cacheHitsTotal.inc({ cache_key: cacheKey, service });
  }
  
  recordCacheMiss(cacheKey: string, service: string): void {
    this.cacheMissesTotal.inc({ cache_key: cacheKey, service });
  }
  
  /**
   * Record business operation metrics
   */
  recordOperation(
    operation: string,
    entityType: string,
    status: 'success' | 'failure',
    service: string
  ): void {
    this.operationsTotal.inc({ operation, entity_type: entityType, status, service });
  }
}
