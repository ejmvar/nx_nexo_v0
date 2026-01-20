# NEXO CRM - Advanced Monitoring Guide

Complete monitoring, observability, and APM setup for NEXO CRM.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Grafana Dashboards](#grafana-dashboards)
- [Prometheus Alerts](#prometheus-alerts)
- [Application Performance Monitoring](#application-performance-monitoring)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

NEXO CRM monitoring stack includes:

- **Grafana**: Visualization and dashboards
- **Prometheus**: Metrics collection and storage
- **OpenTelemetry Collector**: APM and distributed tracing
- **Jaeger**: Distributed tracing UI
- **Alert Manager**: Alert routing and notification

### Monitoring Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Backend  │───▶│   OTEL   │───▶│  Jaeger  │             │
│  │   API    │    │Collector │    │   (UI)   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │                  │                                   │
│       │                  ▼                                   │
│       │          ┌──────────────┐                           │
│       └─────────▶│  Prometheus  │                           │
│                  └──────────────┘                           │
│                         │                                    │
│                         ▼                                    │
│                  ┌──────────────┐                           │
│                  │   Grafana    │                           │
│                  │ Dashboards   │                           │
│                  └──────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Start Monitoring Stack

```bash
# Start all services including monitoring
docker compose up -d

# Or using MISE/Make
mise run docker:up
make docker-up
```

### Access Monitoring Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| Grafana | http://localhost:3002 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger UI | http://localhost:16686 | - |
| OTEL Collector (zpages) | http://localhost:55679 | - |

### View Dashboards

```bash
# Open Grafana
open http://localhost:3002

# Navigate to:
# - Dashboards → NEXO CRM - System Overview
# - Dashboards → NEXO CRM - Backend API Metrics
# - Dashboards → NEXO CRM - Database Metrics
```

## 📊 Grafana Dashboards

### 1. System Overview Dashboard

**Location**: `monitoring/grafana/dashboards/nexo-overview.json`

**Metrics**:
- Backend API request rate
- Response time (p95, p99)
- Error rates (4xx, 5xx)
- CPU usage by service
- Memory usage by service
- Database connections
- Redis operations rate
- Service health status

**Use Cases**:
- Quick system health check
- Capacity planning
- Performance monitoring
- Incident investigation

### 2. Backend API Metrics Dashboard

**Location**: `monitoring/grafana/dashboards/nexo-backend.json`

**Metrics**:
- GraphQL query performance (p50, p95, p99)
- Database query performance
- Active database queries
- Cache hit rate
- Event loop lag
- Heap memory usage
- Garbage collection duration
- Authentication & authorization metrics

**Use Cases**:
- API performance optimization
- Query optimization
- Cache tuning
- Memory leak detection

### 3. Database Metrics Dashboard

**Location**: `monitoring/grafana/dashboards/nexo-database.json`

**Metrics**:
- Database size and growth
- Connection pool usage
- Transaction rate (commits/rollbacks)
- Cache hit ratio
- Slow queries
- Deadlocks
- Top 10 slowest queries

**Use Cases**:
- Database performance tuning
- Query optimization
- Connection pool sizing
- Storage planning

### Dashboard Import

If auto-provisioning doesn't work:

1. Open Grafana → http://localhost:3002
2. Go to Dashboards → Import
3. Upload JSON files from `monitoring/grafana/dashboards/`
4. Select Prometheus data source
5. Click Import

## 🚨 Prometheus Alerts

### Alert Categories

**Location**: `monitoring/prometheus/alerts.yml`

#### Critical Alerts

| Alert | Condition | Duration | Action |
|-------|-----------|----------|--------|
| ServiceDown | Service unavailable | 1 minute | Immediate investigation |
| HighErrorRate | 5xx errors > 5% | 5 minutes | Check logs, rollback if needed |
| DatabaseConnectionPoolExhausted | Connections > 90% | 2 minutes | Scale database or app |
| DiskSpaceCritical | < 10% available | 1 minute | Clean up or expand disk |

#### Warning Alerts

| Alert | Condition | Duration | Action |
|-------|-----------|----------|--------|
| HighMemoryUsage | > 1.5GB | 5 minutes | Monitor, consider scaling |
| HighCPUUsage | > 80% | 5 minutes | Optimize or scale |
| SlowAPIResponse | p95 > 1s | 5 minutes | Performance investigation |
| HighEventLoopLag | > 100ms | 3 minutes | Check blocking operations |
| LowCacheHitRate | < 80% | 10 minutes | Review caching strategy |

#### Security Alerts

| Alert | Condition | Duration | Action |
|-------|-----------|----------|--------|
| HighAuthFailureRate | > 10 failures/sec | 3 minutes | Check for brute force attack |
| HighInvalidTokenRate | > 5 invalid/sec | 3 minutes | Investigate token issues |
| SuspiciousActivityPattern | > 50 401s/sec | 2 minutes | Block IP, investigate |

### Alert Configuration

Edit alert thresholds in `monitoring/prometheus/alerts.yml`:

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate on {{ $labels.service }}"
```

### Alert Testing

```bash
# Run comprehensive monitoring validation tests
bash scripts/test-monitoring.sh

# Or using MISE/Make
mise run test:monitoring
make test-monitoring

# Manual testing commands
# Test alert rules syntax
promtool check rules monitoring/prometheus/alerts.yml

# Force trigger test alert
curl -X POST http://localhost:9090/-/reload

# Check alert rules are loaded
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | {alert: .name, state: .state}'
```

### Monitoring Validation

The monitoring test suite (`scripts/test-monitoring.sh`) validates:

- **Configuration Files**: Checks all config files exist and are valid
- **Prometheus Configuration**: Validates scrape configs and alert rules
- **Alert Rules**: Verifies all critical alerts are defined
- **OpenTelemetry Configuration**: Checks OTEL collector setup
- **Grafana Dashboards**: Validates dashboard JSON syntax
- **Docker Compose**: Confirms monitoring services are configured
- **Service Health** (if running): Tests endpoints and connectivity
- **Documentation**: Verifies comprehensive monitoring docs exist

Run before deploying monitoring stack to catch configuration errors.

## 🔍 Application Performance Monitoring (APM)

### OpenTelemetry Setup

**Configuration**: `monitoring/otel/otel-collector-config.yaml`

**Features**:
- Distributed tracing
- Metrics collection
- Log aggregation
- Performance profiling

### Distributed Tracing

#### View Traces

1. Open Jaeger UI → http://localhost:16686
2. Select service: `nexo-crm`
3. Click "Find Traces"

#### Trace Information

Each trace shows:
- Request path through services
- Database queries
- External API calls
- Latency breakdown
- Error details

### Instrumentation

#### Backend API (NestJS)

Add to your NestJS application:

```typescript
// main.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4317',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'nexo-backend',
});

sdk.start();
```

#### Frontend (Next.js)

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    
    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url: 'http://otel-collector:4318/v1/traces',
      }),
      serviceName: 'nexo-frontend',
    });
    
    sdk.start();
  }
}
```

### Custom Metrics

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('nexo-crm');
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

// Increment counter
requestCounter.add(1, {
  method: 'GET',
  path: '/api/users',
  status: 200,
});
```

### Custom Spans

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('nexo-crm');

async function processOrder(orderId: string) {
  const span = tracer.startSpan('processOrder');
  
  try {
    span.setAttribute('order.id', orderId);
    
    // Your business logic
    await validateOrder(orderId);
    await chargePayment(orderId);
    await shipOrder(orderId);
    
    span.setStatus({ code: 0 }); // Success
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2 }); // Error
    throw error;
  } finally {
    span.end();
  }
}
```

## ⚙️ Configuration

### Prometheus Configuration

**File**: `docker/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - '/etc/prometheus/alerts.yml'

scrape_configs:
  - job_name: 'backend'
    scrape_interval: 10s
    static_configs:
      - targets: ['backend:3001']
```

### Grafana Data Source

Auto-configured Prometheus data source:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

### OpenTelemetry Collector

**File**: `monitoring/otel/otel-collector-config.yaml`

Key configurations:
- **Receivers**: OTLP (gRPC/HTTP), Prometheus
- **Processors**: Batch, memory limiter, resource
- **Exporters**: Prometheus, Jaeger, logging

## 📈 Metrics Reference

### Backend API Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request duration |
| `graphql_query_duration_seconds` | Histogram | GraphQL query duration |
| `database_query_duration_seconds` | Histogram | Database query duration |
| `cache_hits_total` | Counter | Cache hits |
| `cache_misses_total` | Counter | Cache misses |
| `nodejs_eventloop_lag_seconds` | Gauge | Event loop lag |
| `nodejs_heap_size_used_bytes` | Gauge | Heap memory used |

### Database Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_database_size_bytes` | Gauge | Database size |
| `pg_stat_database_numbackends` | Gauge | Active connections |
| `pg_stat_database_xact_commit` | Counter | Committed transactions |
| `pg_stat_database_xact_rollback` | Counter | Rolled back transactions |
| `pg_stat_database_blks_hit` | Counter | Cache hits |
| `pg_stat_database_blks_read` | Counter | Disk reads |

## 🐛 Troubleshooting

### Prometheus Not Scraping

```bash
# Check Prometheus targets
open http://localhost:9090/targets

# Check logs
docker logs nexo-prometheus

# Verify prometheus.yml
docker exec nexo-prometheus cat /etc/prometheus/prometheus.yml
```

### Grafana Dashboards Not Showing Data

```bash
# Check Grafana data sources
open http://localhost:3002/datasources

# Test Prometheus connection
curl http://localhost:9090/api/v1/query?query=up

# Check Grafana logs
docker logs nexo-grafana
```

### OpenTelemetry Collector Issues

```bash
# Check collector health
curl http://localhost:13133

# View zpages
open http://localhost:55679/debug/tracez

# Check logs
docker logs nexo-otel-collector

# Verify configuration
docker exec nexo-otel-collector cat /etc/otel/config.yaml
```

### No Traces in Jaeger

```bash
# Check Jaeger UI
open http://localhost:16686

# Verify OTEL collector is receiving traces
curl http://localhost:55679/debug/tracez

# Check backend is sending traces
# Add debug logging to your instrumentation code
```

### High Memory Usage by Prometheus

```bash
# Check retention settings
docker exec nexo-prometheus cat /prometheus/wal/

# Reduce retention period (add to prometheus.yml)
--storage.tsdb.retention.time=7d

# Restart Prometheus
docker restart nexo-prometheus
```

## 📚 Best Practices

### 1. Dashboard Design

- Keep dashboards focused (one concern per dashboard)
- Use consistent time ranges
- Add alerts to critical panels
- Use template variables for filtering
- Document complex queries

### 2. Alert Configuration

- Start with critical alerts only
- Avoid alert fatigue
- Set appropriate thresholds
- Use clear, actionable messages
- Test alerts regularly

### 3. Tracing

- Instrument critical paths
- Add context with attributes
- Keep span names consistent
- Sample traces in production (1-10%)
- Review traces regularly

### 4. Performance

- Use recording rules for expensive queries
- Set appropriate retention periods
- Monitor monitoring stack resource usage
- Archive old data

### 5. Security

- Secure Grafana with strong passwords
- Use HTTPS in production
- Restrict Prometheus/Jaeger access
- Don't log sensitive data in traces

## 🔧 Advanced Topics

### Custom Recording Rules

Create `monitoring/prometheus/rules.yml`:

```yaml
groups:
  - name: nexo_recording_rules
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: rate(http_requests_total[5m])
      
      - record: job:http_errors:rate5m
        expr: rate(http_requests_total{status=~"5.."}[5m])
```

### Alert Manager Integration

```yaml
# alertmanager.yml
route:
  receiver: 'team-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/...'
        channel: '#alerts'
```

### Grafana Provisioning

Auto-provision dashboards:

```yaml
# grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1
providers:
  - name: 'default'
    folder: 'NEXO CRM'
    type: file
    options:
      path: /etc/grafana/provisioning/dashboards
```

## 📞 Support

For monitoring issues:

1. Check service logs: `docker logs <service-name>`
2. Verify configurations in `monitoring/` directory
3. Review [Prometheus documentation](https://prometheus.io/docs/)
4. Review [Grafana documentation](https://grafana.com/docs/)
5. Review [OpenTelemetry documentation](https://opentelemetry.io/docs/)

---

**Last Updated**: 2026-01-20  
**Maintained By**: NEXO Development Team
