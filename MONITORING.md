# NEXO Monitoring & Logging Setup

This project includes comprehensive monitoring and logging infrastructure using Winston (logging), Prometheus (metrics), and Grafana (visualization).

## Components

### 1. Structured Logging (Winston)
All services use Winston for structured JSON logging with:
- Console output with colors (development)
- File output for production (error.log, combined.log)
- Contextual logging with service names
- Multiple log levels: error, warn, info, http, verbose, debug

### 2. Health Checks
Each service exposes health check endpoints:
- `GET /health` - Full health check (memory, dependencies)
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### 3. Metrics (Prometheus)
Each service exposes metrics at `/metrics` endpoint:
- Default Node.js metrics (CPU, memory, event loop)
- HTTP request metrics (rate, duration, status codes)
- Custom business metrics

### 4. Visualization (Grafana)
Pre-configured dashboards for:
- Request rates across services
- Response times (p50, p95, p99)
- Memory and CPU usage
- Error rates and status codes

## Quick Start

### 1. Start Monitoring Stack
```bash
# Start Prometheus & Grafana
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Dashboards
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3030
  - Username: `admin`
  - Password: `admin123`

### 3. View Service Metrics
- Auth Service: http://localhost:3001/metrics
- API Gateway: http://localhost:3002/metrics
- CRM Service: http://localhost:3003/metrics

### 4. Check Service Health
- Auth Service: http://localhost:3001/health
- API Gateway: http://localhost:3002/health
- CRM Service: http://localhost:3003/health

## Configuration

### Prometheus
Configuration file: `monitoring/prometheus/prometheus.yml`
- Scrape interval: 15 seconds
- Targets: All NEXO services

### Grafana
- Datasources: `monitoring/grafana/provisioning/datasources/`
- Dashboards: `monitoring/grafana/provisioning/dashboards/`

### Logger Configuration
Environment variables for each service:
- `LOG_LEVEL`: Set logging level (error, warn, info, debug)
- `SERVICE_NAME`: Service identifier in logs
- `NODE_ENV`: production/development (affects log output)

## Usage Examples

### Using Logger in NestJS Services
```typescript
import { LoggerService } from '@nexo-prj/shared/logger';

export class MyService {
  constructor(private logger: LoggerService) {
    this.logger.setContext('MyService');
  }

  someMethod() {
    this.logger.info('Processing request', { userId: 123 });
    this.logger.error('Failed to process', 'Error stack trace');
  }
}
```

### Viewing Logs
```bash
# Development (console)
pnpm nx serve auth-service

# Production logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Creating Custom Metrics
```typescript
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  providers: [
    makeCounterProvider({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
    }),
  ],
})
```

## Grafana Dashboards

### Pre-configured Dashboards
1. **NEXO Services Overview** - High-level metrics for all services
   - Request rates
   - Response times
   - Memory usage
   - CPU usage
   - Error rates

### Adding Custom Dashboards
1. Create JSON in `monitoring/grafana/provisioning/dashboards/`
2. Restart Grafana container
3. Dashboard will auto-load

## Troubleshooting

### Prometheus can't scrape services
- Check that services are running
- Verify `/metrics` endpoint is accessible
- Check `host.docker.internal` resolves correctly

### Grafana shows no data
- Verify Prometheus datasource connection
- Check Prometheus is scraping targets (Status > Targets)
- Ensure time range in dashboard is correct

### Logs not appearing
- Check `LOG_LEVEL` environment variable
- Verify Winston transports are configured
- For production, check `logs/` directory exists

## Production Recommendations

1. **Log Aggregation**: Consider ELK stack or Loki for centralized logs
2. **Metrics Retention**: Configure Prometheus retention period
3. **Alerting**: Set up Prometheus AlertManager for critical alerts
4. **Security**: 
   - Change default Grafana password
   - Restrict metrics endpoints
   - Use TLS for Grafana access
5. **Backup**: Regularly backup Grafana dashboards and Prometheus data

## Environment Variables

```bash
# Logging
LOG_LEVEL=info                # error | warn | info | debug
SERVICE_NAME=auth-service     # Service identifier
NODE_ENV=production           # production | development

# Metrics
METRICS_PORT=9090            # Port for metrics endpoint (optional)
```

## References
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [NestJS Terminus](https://docs.nestjs.com/recipes/terminus)
