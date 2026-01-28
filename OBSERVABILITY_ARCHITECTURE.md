# Observability Stack Architecture

## Overview

This document outlines the architecture for a comprehensive, non-intrusive observability solution for the NEXO CRM system using the PLG Stack (Prometheus, Loki, Grafana) with AlertManager.

## Design Principles

1. **Isolation**: Observability stack runs in separate containers with dedicated resources
2. **Non-Intrusive**: No code changes required in application services
3. **Scalability**: Can handle logs/metrics from all services
4. **High Availability**: Optional redundancy for production
5. **Security**: Separate network, authentication, and access controls
6. **Performance**: Minimal impact on application performance (<5% overhead)

## Technology Stack

### PLG Stack Components

| Component | Purpose | Why This Choice |
|-----------|---------|-----------------|
| **Loki** | Log aggregation | Lightweight, S3-compatible storage, labels instead of full-text indexing |
| **Promtail** | Log collection | Agent for shipping logs from containers to Loki |
| **Prometheus** | Metrics collection | Industry standard, pull-based model, powerful query language (PromQL) |
| **Grafana** | Visualization | Unified dashboard for logs + metrics, supports both Loki and Prometheus |
| **AlertManager** | Alert routing | Deduplication, grouping, routing to Slack/email/PagerDuty |
| **Node Exporter** | System metrics | CPU, memory, disk, network metrics from host |
| **cAdvisor** | Container metrics | Per-container resource usage |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐ │
│  │  Auth   │  │   CRM   │  │ Gateway │  │Frontend │  │ Other... │ │
│  │ Service │  │ Service │  │ Service │  │  (Next) │  │ Services │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬─────┘ │
│       │            │            │            │            │        │
│       │ logs       │ logs       │ logs       │ logs       │ logs   │
│       ▼            ▼            ▼            ▼            ▼        │
└───────┼────────────┼────────────┼────────────┼────────────┼────────┘
        │            │            │            │            │
        └────────────┴────────────┴────────────┴────────────┘
                                  │
        ┌─────────────────────────┴──────────────────────────┐
        │                                                      │
        │              Docker Logging Driver                  │
        │           (json-file / syslog / fluentd)           │
        │                                                      │
        └─────────────────────────┬──────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Observability Stack Network                       │
│                    (observability-network)                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Log Pipeline                             │  │
│  │                                                                │  │
│  │  ┌──────────┐      ┌──────────┐      ┌──────────────────┐  │  │
│  │  │ Promtail │─────▶│   Loki   │◀─────│ Loki Querier     │  │  │
│  │  │  Agent   │      │ Ingester │      │ (Query Frontend) │  │  │
│  │  └──────────┘      └──────────┘      └──────────────────┘  │  │
│  │       │                  │                      ▲           │  │
│  │       │                  │                      │           │  │
│  │       │                  ▼                      │           │  │
│  │       │            ┌──────────┐                 │           │  │
│  │       │            │  Volume  │                 │           │  │
│  │       │            │loki-data │                 │           │  │
│  │       │            └──────────┘                 │           │  │
│  │       │                                         │           │  │
│  └───────┼─────────────────────────────────────────┼───────────┘  │
│          │                                         │              │
│          │                                         │              │
│  ┌───────┼─────────────────────────────────────────┼───────────┐  │
│  │       │             Metrics Pipeline            │           │  │
│  │       │                                         │           │  │
│  │  ┌────▼────────┐   ┌─────────────┐   ┌────────┴────────┐  │  │
│  │  │   cAdvisor  │──▶│ Prometheus  │──▶│  AlertManager   │  │  │
│  │  │ (containers)│   │   Server    │   │   (routing)     │  │  │
│  │  └─────────────┘   └──────┬──────┘   └─────────────────┘  │  │
│  │                            │                                │  │
│  │  ┌─────────────┐           │                                │  │
│  │  │Node Exporter│───────────┘                                │  │
│  │  │  (system)   │                                            │  │
│  │  └─────────────┘                                            │  │
│  │                            │                                │  │
│  │                            ▼                                │  │
│  │                      ┌──────────┐                           │  │
│  │                      │  Volume  │                           │  │
│  │                      │prom-data │                           │  │
│  │                      └──────────┘                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Visualization Layer                         │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │                     Grafana                           │    │  │
│  │  │                                                       │    │  │
│  │  │  Data Sources:                                        │    │  │
│  │  │  • Loki (logs)                                        │    │  │
│  │  │  • Prometheus (metrics)                               │    │  │
│  │  │                                                       │    │  │
│  │  │  Features:                                            │    │  │
│  │  │  • Pre-built dashboards                               │    │  │
│  │  │  • Log exploration                                    │    │  │
│  │  │  • Alert visualization                                │    │  │
│  │  │  • User authentication                                │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │                            │                                  │  │
│  │                            ▼                                  │  │
│  │                      ┌──────────┐                             │  │
│  │                      │  Volume  │                             │  │
│  │                      │grafana-  │                             │  │
│  │                      │  data    │                             │  │
│  │                      └──────────┘                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                         External Integrations
                    (Slack, Email, PagerDuty, etc.)
```

## Directory Structure

```
nexo-crm/
├── docker/
│   ├── docker-compose.yml                      # Main application stack
│   └── docker-compose.observability.yml        # Observability stack (separate)
│
├── observability/                              # NEW: Observability configuration
│   ├── README.md                               # Setup and usage guide
│   ├── .env.example                            # Environment variables
│   │
│   ├── loki/
│   │   ├── loki-config.yaml                   # Loki configuration
│   │   └── rules/                             # Log-based alerting rules
│   │       └── alerts.yaml
│   │
│   ├── promtail/
│   │   └── promtail-config.yaml               # Log collection config
│   │
│   ├── prometheus/
│   │   ├── prometheus.yml                      # Scrape configuration
│   │   ├── alerts/                             # Alert rules
│   │   │   ├── app-alerts.yml                 # Application alerts
│   │   │   ├── infra-alerts.yml               # Infrastructure alerts
│   │   │   └── business-alerts.yml            # Business metrics alerts
│   │   └── targets/                            # Service discovery
│   │       └── services.json
│   │
│   ├── alertmanager/
│   │   └── alertmanager.yml                    # Alert routing config
│   │
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── datasources/
│   │   │   │   ├── loki.yaml                  # Loki datasource
│   │   │   │   └── prometheus.yaml            # Prometheus datasource
│   │   │   └── dashboards/
│   │   │       ├── dashboard.yaml             # Dashboard provider
│   │   │       └── default/
│   │   │           ├── overview.json          # System overview
│   │   │           ├── logs.json              # Log analysis
│   │   │           ├── auth-service.json      # Auth service metrics
│   │   │           ├── crm-service.json       # CRM service metrics
│   │   │           ├── gateway.json           # Gateway metrics
│   │   │           ├── frontend.json          # Frontend metrics
│   │   │           ├── database.json          # Database metrics
│   │   │           ├── redis.json             # Redis metrics
│   │   │           └── rabbitmq.json          # RabbitMQ metrics
│   │   └── grafana.ini                         # Grafana configuration
│   │
│   └── scripts/
│       ├── start-observability.sh              # Start observability stack
│       ├── stop-observability.sh               # Stop observability stack
│       ├── backup-metrics.sh                   # Backup Prometheus data
│       ├── backup-logs.sh                      # Backup Loki data
│       └── health-check.sh                     # Verify all components
│
├── nexo-prj/
│   └── apps/
│       ├── auth-service/
│       │   └── src/
│       │       └── metrics/                    # Metrics endpoints
│       │           └── metrics.controller.ts
│       ├── crm-service/
│       │   └── src/
│       │       └── metrics/
│       │           └── metrics.controller.ts
│       └── api-gateway/
│           └── src/
│               └── metrics/
│                   └── metrics.controller.ts
│
└── scripts/
    └── test-observability.sh                   # E2E observability tests
```

## Network Architecture

### Separate Network for Observability

```yaml
networks:
  # Application networks (existing)
  backend-network:
    driver: bridge
  frontend-network:
    driver: bridge
  
  # Observability network (new, isolated)
  observability-network:
    driver: bridge
    internal: false  # Allows external alert integrations
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

**Key Points:**
- Observability stack has its own dedicated network
- Application containers connect to both networks (multi-network)
- Metrics endpoints only accessible within observability network
- Grafana accessible from external (port mapping) for users

## Volume Strategy

### Persistent Volumes

```yaml
volumes:
  # Observability data (separate from application data)
  loki-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./observability/volumes/loki
  
  prometheus-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./observability/volumes/prometheus
  
  grafana-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./observability/volumes/grafana
  
  alertmanager-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./observability/volumes/alertmanager
```

**Benefits:**
- Easy backup/restore
- Portable across environments
- No data loss on container restart
- Separate from application data (clean separation)

## Resource Allocation

### Recommended Resources (Production)

| Service | CPU | Memory | Disk | Priority |
|---------|-----|--------|------|----------|
| Loki | 1.0 | 1GB | 50GB+ | High |
| Promtail | 0.2 | 128MB | - | Low |
| Prometheus | 2.0 | 2GB | 100GB+ | High |
| Grafana | 0.5 | 512MB | 5GB | Medium |
| AlertManager | 0.2 | 256MB | 1GB | Medium |
| Node Exporter | 0.1 | 64MB | - | Low |
| cAdvisor | 0.3 | 256MB | - | Low |

**Total overhead:** ~4.3 CPU cores, ~4.2GB RAM

### Resource Limits (Docker Compose)

```yaml
services:
  loki:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Implementation Phases

### Phase 14: Monitoring & Metrics (Prometheus + Grafana)

**Goal:** Implement metrics collection and basic dashboards

**Tasks:**
1. Add Prometheus metrics endpoints to all services
   - Auth Service: `/metrics`
   - CRM Service: `/metrics`
   - Gateway: `/metrics`
   - Frontend: `/metrics` (NextJS API route)

2. Deploy Prometheus + Grafana containers
   - Configure scrape targets
   - Set up service discovery
   - Create basic dashboards

3. Instrument application code
   - HTTP request duration
   - HTTP request count
   - Error rates
   - Database query performance
   - Cache hit/miss ratios
   - WebSocket connections

4. Create dashboards
   - System overview
   - Per-service dashboards
   - Database performance
   - Redis performance

**Deliverables:**
- `docker-compose.observability.yml` (Prometheus + Grafana)
- Metrics endpoints in all services
- 5+ pre-built dashboards
- Documentation: `observability/prometheus/README.md`

### Phase 15: Centralized Logging (Loki + Promtail)

**Goal:** Aggregate logs from all containers

**Tasks:**
1. Deploy Loki + Promtail containers
   - Configure Promtail to collect from Docker
   - Set up log parsing and labels
   - Configure retention policies

2. Integrate with existing structured logging
   - Parse JSON logs
   - Extract fields (level, accountId, userId, requestId)
   - Create meaningful labels

3. Connect Loki to Grafana
   - Add Loki datasource
   - Create log exploration dashboards
   - Set up log-based alerts

4. Create log dashboards
   - Real-time log stream
   - Error logs dashboard
   - Audit logs dashboard
   - Per-service log analysis

**Deliverables:**
- Loki + Promtail configuration
- Log parsing rules
- 3+ log dashboards
- Log query examples
- Documentation: `observability/loki/README.md`

### Phase 16: Alerting & Complete Observability

**Goal:** Complete observability stack with alerting

**Tasks:**
1. Deploy AlertManager
   - Configure routing rules
   - Set up Slack integration
   - Set up email integration
   - Set up PagerDuty (optional)

2. Create alert rules
   - High error rates
   - Service down
   - High response times
   - Database connection issues
   - High CPU/Memory usage
   - Disk space alerts
   - Failed authentication attempts
   - Suspicious activity patterns

3. Create comprehensive dashboards
   - Unified overview (logs + metrics)
   - Alert status dashboard
   - Business metrics dashboard
   - Cost tracking dashboard

4. Documentation and runbooks
   - Alert response procedures
   - Troubleshooting guides
   - Dashboard user guide

**Deliverables:**
- Complete observability stack
- 15+ alert rules
- Slack/Email integration
- Alert response runbooks
- Complete documentation

## Integration with Application Services

### Non-Intrusive Design

**No changes required for basic observability:**
- Logs: Collected via Docker logging driver
- Container metrics: cAdvisor scrapes Docker API
- System metrics: Node Exporter on host

**Optional enhancements (recommended):**
- Add `/metrics` endpoints for detailed application metrics
- Add structured logging with consistent format
- Add trace IDs for request correlation

### Structured Logging Format (Already Implemented ✓)

All services already use structured logging:

```typescript
this.logger.log(
  `📤 Upload request: file="${file}" size=${size} account=${accountId}`
);
```

**Promtail extracts:**
- Timestamp
- Level (INFO, WARN, ERROR)
- Service name (from container label)
- Account ID (from log message)
- User ID (from log message)
- Request ID (from log message)

### Metrics Endpoints (To Be Added)

Example for NestJS services:

```typescript
// metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  @Get()
  @Public() // No JWT required
  getMetrics() {
    return register.metrics(); // Prometheus client
  }
}
```

## Security Considerations

### Access Control

1. **Grafana Authentication**
   - OAuth2 integration (optional)
   - User/role-based access
   - View-only mode for non-admins

2. **Metrics Endpoints**
   - Only accessible from observability network
   - No sensitive data in metrics
   - Rate limiting

3. **Log Data**
   - Sanitize sensitive data before logging
   - Encrypt logs at rest (optional)
   - Access logs for who views what

### Network Isolation

```yaml
# Application service (e.g., CRM)
services:
  crm-service:
    networks:
      - backend-network      # Application communication
      - observability-network # Metrics collection only
```

## Cost Optimization

### Retention Policies

```yaml
# Loki retention (logs)
retention_enabled: true
retention_period: 720h  # 30 days

# Prometheus retention (metrics)
--storage.tsdb.retention.time=30d
--storage.tsdb.retention.size=50GB
```

### Sampling

- Sample high-volume logs (e.g., health checks)
- Reduce metrics cardinality
- Archive old data to S3/MinIO

### Resource Limits

- Set CPU/memory limits
- Use host volumes (faster than network volumes)
- Enable compression

## Backup Strategy

### Automated Backups

```bash
# Daily backup script
#!/bin/bash
# backup-observability.sh

# Timestamp
DATE=$(date +%Y%m%d-%H%M%S)

# Backup Prometheus data (snapshots)
docker exec prometheus curl -XPOST http://localhost:9090/api/v1/admin/tsdb/snapshot
docker cp prometheus:/prometheus/snapshots/$SNAPSHOT ./backups/prometheus-$DATE

# Backup Loki data
docker cp loki:/loki/chunks ./backups/loki-$DATE

# Backup Grafana dashboards/datasources
docker cp grafana:/var/lib/grafana ./backups/grafana-$DATE

# Compress and upload to S3
tar -czf observability-backup-$DATE.tar.gz backups/*
aws s3 cp observability-backup-$DATE.tar.gz s3://nexo-backups/observability/
```

## Monitoring the Monitors

**Meta-monitoring:** Ensure observability stack is healthy

1. **Health checks**
   - Prometheus targets up/down
   - Loki ingestion rate
   - Grafana datasource connectivity

2. **Alerts on observability**
   - Prometheus disk full
   - Loki ingestion lag
   - AlertManager down

3. **External monitoring**
   - Uptime checks (e.g., UptimeRobot)
   - Dead man's switch (periodic alert that should always fire)

## Migration Strategy

### Zero Downtime Deployment

1. **Phase 1: Deploy in parallel**
   - Run observability stack alongside existing services
   - No changes to application code
   - Validate data collection

2. **Phase 2: Gradual rollout**
   - Enable metrics endpoints service by service
   - Add log labels gradually
   - Test alerts in test environment

3. **Phase 3: Full cutover**
   - Switch to using observability for monitoring
   - Decommission old monitoring (if any)
   - Train team on new tools

## Advantages of This Architecture

1. **Isolation**: Observability failure doesn't affect applications
2. **Scalability**: Can scale observability independently
3. **Performance**: Minimal overhead on applications (<5%)
4. **Maintainability**: Clear separation of concerns
5. **Cost-Effective**: Open source tools, no vendor lock-in
6. **Flexibility**: Easy to add new services/metrics
7. **Standards-Based**: Industry-standard tools (Prometheus, Grafana)
8. **Multi-Language**: Works with Node.js, Python, Go, any language
9. **Cloud-Ready**: Easy to migrate to k8s/cloud later

## Alternative Approaches Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **ELK Stack** | Full-text search, mature | Heavy (ES requires 4GB+ RAM), complex | ❌ Too resource-intensive |
| **Datadog** | Managed, easy setup | Expensive ($15/host/month), vendor lock-in | ❌ Cost prohibitive |
| **CloudWatch** | AWS native | AWS only, expensive, limited queries | ❌ Not cloud-agnostic |
| **Splunk** | Enterprise features | Very expensive | ❌ Overkill for project size |
| **PLG Stack** | Lightweight, free, integrated | Newer than ELK | ✅ **SELECTED** |

## Next Steps

See detailed implementation plans in:
- `observability/prometheus/README.md` (Phase 14)
- `observability/loki/README.md` (Phase 15)
- `observability/alertmanager/README.md` (Phase 16)

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/clients/promtail/)
- [AlertManager Guide](https://prometheus.io/docs/alerting/latest/alertmanager/)
