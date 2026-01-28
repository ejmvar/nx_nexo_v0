import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

/**
 * Metrics Controller - Exposes Prometheus metrics endpoint
 * 
 * This controller provides the /metrics endpoint that Prometheus scrapes.
 * The endpoint is public (no authentication required) as it's typically
 * only accessible within the observability network.
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * GET /metrics
   * Returns metrics in Prometheus text format
   * 
   * This endpoint is scraped by Prometheus every 15 seconds (configurable)
   * The Content-Type must be 'text/plain; version=0.0.4' for Prometheus
   */
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  /**
   * GET /metrics/json
   * Returns metrics as JSON (for debugging/development)
   * 
   * This endpoint is useful for debugging metrics in a more readable format
   * than the Prometheus text format. Not used by Prometheus itself.
   */
  @Get('json')
  async getMetricsJSON(): Promise<any> {
    return this.metricsService.getMetricsJSON();
  }
}
