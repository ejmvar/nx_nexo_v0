# NEXO CRM - Observability Stack

Complete observability solution using the **PLG Stack** (Prometheus, Loki, Grafana) for centralized metrics, logging, and alerting.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Components](#components)
- [Access URLs](#access-urls)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Dashboards](#dashboards)
- [Alerting](#alerting)
- [Troubleshooting](#troubleshooting)
- [Production Considerations](#production-considerations)

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Ensure backend services are running
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/docker
docker compose up -d

# Verify backend network exists
docker network ls | grep nexo-backend
```

### 2. Start Observability Stack

```bash
# Start all observability services
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/docker
docker compose -f docker-compose.observability.yml up -d

# Verify all services are running
docker compose -f docker-compose.observability.yml ps

# Check service health
docker compose -f docker-compose.observability.yml logs -f
```

### 3. Access Grafana

1. Open browser: **http://localhost:3300**
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Change password on first login
4. Navigate to **Explore** or **Dashboards**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │   CRM    │  │ Gateway  │  │ Frontend │       │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│        │            │             │             │               │
│    [/metrics]   [/metrics]   [/metrics]   [/metrics]            │
│        │            │             │             │               │
│    [Docker Logs] [Docker Logs] [Docker Logs] [Docker Logs]     │
└────────┼────────────┼─────────────┼─────────────┼───────────────┘
         │            │             │             │
         │            │             │             │
    ┌────▼────────────▼─────────────▼─────────────▼─────┐
    │          Observability Network                     │
    │    ┌──────────────────┐     ┌───────────────┐     │
    │    │   Prometheus     │◄────┤ Node Exporter │     │
    │    │  (Metrics)       │     └───────────────┘     │
    │    └────────┬─────────┘     ┌───────────────┐     │
    │             │           ┌───►│   cAdvisor    │     │
    │             │           │    └───────────────┘     │
    │             │           │                          │
    │    ┌────────▼───────────▼────┐                    │
    │    │      Grafana             │                    │
    │    │   (Visualization)        │                    │
    │    └────────┬─────────────────┘                    │
    │             │                                       │
    │    ┌────────▼─────────┐     ┌───────────────┐     │
    │    │       Loki       │◄────┤   Promtail    │     │
    │    │     (Logs)       │     │ (Log Collector)│    │
    │    └────────┬─────────┘     └───────────────┘     │
    │             │                                       │
    │    ┌────────▼─────────┐                            │
    │    │   AlertManager   │─────► Slack/Email          │
    │    │    (Alerting)    │                            │
    │    └──────────────────┘                            │
    └───────────────────────────────────────────────────┘
```

**Key Features:**
- **Network Isolation**: Separate `observability-network` (172.20.0.0/16)
- **Persistent Storage**: Local volumes for metrics and logs
- **Non-Intrusive**: No application code changes required
- **Resource Limited**: CPU and memory limits prevent resource theft

---

## 🧩 Components

### Prometheus (Port 9090)
- **Purpose**: Metrics collection and storage (TSDB)
- **Scrape Interval**: 15 seconds
- **Retention**: 30 days or 50GB
- **Resources**: 2 CPU cores, 2GB RAM

### Loki (Port 3100)
- **Purpose**: Log aggregation and indexing
- **Storage**: Filesystem (local volume)
- **Retention**: 30 days
- **Resources**: 1 CPU core, 1GB RAM

### Promtail (No external port)
- **Purpose**: Log collection agent
- **Sources**: Docker container logs, host logs
- **Format**: Parses JSON structured logs
- **Resources**: 0.2 CPU cores, 128MB RAM

### Grafana (Port 3300)
- **Purpose**: Visualization and dashboards
- **Datasources**: Prometheus (metrics) + Loki (logs)
- **Features**: Pre-configured dashboards, Explore view
- **Resources**: 0.5 CPU cores, 512MB RAM

### AlertManager (Port 9093)
- **Purpose**: Alert routing and deduplication
- **Integrations**: Slack, Email, PagerDuty, Webhook
- **Features**: Grouping, silencing, inhibition
- **Resources**: 0.2 CPU cores, 256MB RAM

### Node Exporter (Port 9100)
- **Purpose**: System/host metrics
- **Metrics**: CPU, memory, disk, network, filesystem
- **Resources**: 0.1 CPU cores, 64MB RAM

### cAdvisor (Port 8080)
- **Purpose**: Container resource metrics
- **Metrics**: Per-container CPU, memory, network, disk I/O
- **Resources**: 0.3 CPU cores, 256MB RAM

**Total Resources:**
- **CPU**: ~4.3 cores
- **Memory**: ~4.2GB
- **Disk**: 156GB+ (for logs/metrics storage)

---

## 🌐 Access URLs

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| **Grafana** | http://localhost:3300 | admin/admin | Dashboards & Explore |
| **Prometheus** | http://localhost:9090 | None | Metrics UI & PromQL |
| **AlertManager** | http://localhost:9093 | None | Alert management |
| **Loki** | http://localhost:3100 | None | Log API (internal) |
| **Node Exporter** | http://localhost:9100/metrics | None | System metrics |
| **cAdvisor** | http://localhost:8080 | None | Container metrics |

⚠️ **Security Note**: In production, restrict access to internal network only or add authentication.

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `docker/` directory:

```bash
# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure_password_here

# AlertManager (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL_TO=alerts@nexo.com
ALERT_EMAIL_FROM=monitoring@nexo.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Prometheus Configuration

Edit `observability/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'my-new-service'
    static_configs:
      - targets: ['my-service:3004']
        labels:
          service: 'my-service'
          component: 'backend'
```

Reload configuration (no restart):
```bash
curl -X POST http://localhost:9090/-/reload
```

### Loki Configuration

Edit `observability/loki/loki-config.yaml` for retention:

```yaml
limits_config:
  retention_period: 30d  # Change retention period
```

Requires restart:
```bash
docker compose -f docker-compose.observability.yml restart loki
```

---

## 📚 Usage Guide

### 1. View Metrics (Prometheus)

**Basic Queries:**
```promql
# Total HTTP requests
sum(rate(http_requests_total[5m]))

# Error rate by service
sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))

# P95 response time
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# Database connections
sum(db_connections_active)

# Cache hit rate
sum(rate(cache_hits_total[5m])) / sum(rate(cache_requests_total[5m]))
```

**Access Prometheus:**
1. Go to http://localhost:9090
2. Click **Graph**
3. Enter PromQL query
4. Click **Execute**
5. Switch between **Table** and **Graph** views

### 2. View Logs (Loki via Grafana)

**Basic LogQL Queries:**
```logql
# All logs from CRM service
{service="crm-service"}

# Error logs only
{service="crm-service", level="error"}

# Logs containing "upload"
{service="crm-service"} |= "upload"

# Parse JSON and filter
{service="crm-service"} | json | account_id="uuid-here"

# Count errors per minute
sum(rate({level="error"}[1m]))

# Top 10 error messages
topk(10, sum by (message) (count_over_time({level="error"}[1h])))
```

**Access Loki (via Grafana):**
1. Go to http://localhost:3300
2. Click **Explore** (compass icon)
3. Select **Loki** datasource
4. Enter LogQL query
5. Click **Run query**
6. Use **Live** button for real-time tail

### 3. Create Dashboards

**Dashboard Creation:**
1. Click **+** → **Create Dashboard**
2. Click **Add visualization**
3. Select datasource: **Prometheus** or **Loki**
4. Enter query (PromQL or LogQL)
5. Configure visualization type (Graph, Table, Gauge, etc.)
6. Set panel title and description
7. Click **Apply**
8. Click **Save dashboard** (disk icon)

**Import Pre-built Dashboards:**
1. Go to **Dashboards** → **Import**
2. Enter dashboard ID:
   - Node Exporter: `1860`
   - Docker: `893`
   - Loki Logs: `13639`
   - Prometheus Stats: `3662`
3. Click **Load**
4. Select Prometheus/Loki datasource
5. Click **Import**

### 4. Set Up Alerts

**Create Alert Rule:**
1. Go to **Alerting** → **Alert rules**
2. Click **New alert rule**
3. Enter query (e.g., `rate(http_requests_total{status="500"}[5m]) > 0.05`)
4. Set evaluation interval (e.g., 1m)
5. Set conditions (e.g., threshold > 0.05 for 5 minutes)
6. Add labels: `severity=critical`, `service=crm`
7. Add annotations: Summary and description
8. Click **Save**

**Configure Notifications:**
1. Go to **Alerting** → **Contact points**
2. Click **New contact point**
3. Select type: **Slack**, **Email**, **Webhook**, **PagerDuty**
4. Configure integration (webhook URL, email, etc.)
5. Test notification
6. Click **Save**

---

## 📊 Dashboards

### Pre-configured Dashboards

*Note: Dashboards will be created in Phase 14-16 implementation*

| Dashboard | Purpose | Key Metrics |
|-----------|---------|-------------|
| **Overview** | System health at a glance | Request rate, error rate, latency, availability |
| **Auth Service** | Authentication metrics | Login success/failures, JWT issuance, token validation |
| **CRM Service** | CRM operations | Entity CRUD operations, cache performance, WebSocket |
| **Gateway** | API Gateway metrics | Request routing, rate limiting, upstream latency |
| **Infrastructure** | Database, cache, queue | PostgreSQL connections, Redis hit rate, RabbitMQ queues |
| **Logs** | Centralized log view | Real-time logs, error tracking, search |
| **Alerts** | Alert status | Active alerts, alert history, silences |

### Dashboard Best Practices

1. **Use Variables**: Create dashboard variables for `service`, `environment`, `time_range`
2. **Panel Linking**: Link panels to drill down (e.g., error rate → error logs)
3. **Time Ranges**: Default to last 1 hour, allow override
4. **Refresh**: Auto-refresh every 30s for live monitoring
5. **Annotations**: Mark deployments, incidents on timeline

---

## 🚨 Alerting

### Alert Types

#### 1. Application Alerts
- High error rate (>5% for 5 minutes)
- Slow response times (P95 > 1s for 10 minutes)
- Authentication failures spike (>100/minute)
- WebSocket connection failures
- File upload failures

#### 2. Infrastructure Alerts
- Service down (Prometheus target unreachable)
- Database connection pool exhausted
- Redis cache unavailable
- RabbitMQ queue growing (>1000 messages)
- Disk space low (<10% free)

#### 3. Resource Alerts
- High CPU usage (>80% for 15 minutes)
- High memory usage (>80% for 15 minutes)
- Container restart (>3 restarts in 10 minutes)
- Network errors increasing

#### 4. Business Alerts
- No user activity for 30 minutes (dead man's switch)
- Revenue-impacting errors (payment failures)
- Security events (brute force attempts)

### Alert Configuration Example

**Prometheus Alert Rule** (`observability/prometheus/alerts/app-alerts.yml`):

```yaml
groups:
  - name: application
    interval: 1m
    rules:
      - alert: HighErrorRate
        expr: |
          sum by (service) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (service) (
            rate(http_requests_total[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: critical
          team: product
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "{{ $labels.service }} is experiencing {{ $value | humanizePercentage }} error rate"
```

**AlertManager Routing** (`observability/alertmanager/alertmanager.yml`):

```yaml
route:
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-critical'
  routes:
    - match:
        severity: critical
      receiver: 'slack-critical'
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'slack-critical'
    slack_configs:
      - api_url: 'YOUR_WEBHOOK_URL'
        channel: '#alerts-critical'
        title: '🚨 {{ .CommonLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}'
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Prometheus not scraping targets

**Symptoms**: Targets show as "DOWN" in http://localhost:9090/targets

**Diagnosis:**
```bash
# Check Prometheus logs
docker logs nexo-prometheus

# Verify service is accessible from Prometheus container
docker exec nexo-prometheus wget -O- http://auth-service:3001/metrics

# Check if /metrics endpoint exists
curl http://localhost:3001/metrics
```

**Solutions:**
- Ensure service exposes `/metrics` endpoint
- Verify service is on correct network (`docker network inspect nexo-backend`)
- Check firewall rules (internal Docker network should be open)
- Verify service name in prometheus.yml matches Docker service name

#### 2. Loki not receiving logs

**Symptoms**: No logs in Grafana Explore → Loki

**Diagnosis:**
```bash
# Check Promtail logs
docker logs nexo-promtail

# Verify Promtail can reach Loki
docker exec nexo-promtail wget -O- http://loki:3100/ready

# Check Loki ingestion rate
curl http://localhost:3100/metrics | grep loki_ingester_streams_created_total
```

**Solutions:**
- Verify Promtail has access to Docker socket (`/var/run/docker.sock`)
- Check Promtail configuration (container name filters)
- Ensure application logs are structured (JSON format)
- Verify Loki is not rejecting logs (check labels cardinality)

#### 3. Grafana datasource connection failed

**Symptoms**: "HTTP Error Bad Gateway" when querying

**Diagnosis:**
```bash
# Check Grafana logs
docker logs nexo-grafana

# Test datasource connectivity
docker exec nexo-grafana wget -O- http://prometheus:9090/-/healthy
docker exec nexo-grafana wget -O- http://loki:3100/ready
```

**Solutions:**
- Restart Grafana: `docker compose -f docker-compose.observability.yml restart grafana`
- Verify datasource configuration in `observability/grafana/provisioning/datasources/`
- Check if Prometheus/Loki are running: `docker ps | grep prometheus\|loki`

#### 4. High disk usage

**Symptoms**: Disk space running out

**Diagnosis:**
```bash
# Check volume sizes
docker system df -v | grep nexo

# Check Prometheus data size
du -sh observability/volumes/prometheus-data

# Check Loki data size
du -sh observability/volumes/loki-data
```

**Solutions:**
- Reduce retention period in Prometheus config
- Reduce retention period in Loki config
- Enable compression in Loki config
- Set up automated backup and archive old data
- Increase sampling rate for high-volume logs

#### 5. Alerts not firing

**Symptoms**: No alerts received despite conditions being met

**Diagnosis:**
```bash
# Check AlertManager status
curl http://localhost:9093/api/v2/status

# Check active alerts
curl http://localhost:9093/api/v2/alerts

# Check Prometheus alert rules
curl http://localhost:9090/api/v1/rules
```

**Solutions:**
- Verify alert rule query is correct in Prometheus UI
- Check AlertManager routing configuration
- Test notification channel (Slack webhook, email SMTP)
- Check AlertManager logs: `docker logs nexo-alertmanager`

### Debug Commands

```bash
# View all observability containers
docker ps --filter "label=nexo.service=observability"

# Restart all observability services
docker compose -f docker-compose.observability.yml restart

# View aggregated logs
docker compose -f docker-compose.observability.yml logs -f

# Check resource usage
docker stats --filter "label=nexo.service=observability"

# Verify network connectivity
docker network inspect nexo-observability

# Clean up old data (WARNING: deletes all metrics and logs)
docker compose -f docker-compose.observability.yml down -v
```

---

## 🏭 Production Considerations

### 1. Security

```yaml
# Use secrets for sensitive data
secrets:
  grafana_admin_password:
    file: ./secrets/grafana_password.txt

# Restrict external access via firewall
# Only expose Grafana (port 3300), not Prometheus/Loki
```

### 2. High Availability

- Run multiple Prometheus instances (federation)
- Use S3/GCS for Loki chunk storage (shared across instances)
- Deploy Grafana behind load balancer
- Use remote storage for long-term metrics (Thanos, Cortex, Mimir)

### 3. Backup Strategy

```bash
# Automated daily backups
./observability/scripts/backup-metrics.sh

# Backup Prometheus data
curl -XPOST http://localhost:9090/api/v1/admin/tsdb/snapshot
tar -czf prometheus-backup-$(date +%Y%m%d).tar.gz observability/volumes/prometheus-data

# Backup Loki chunks
tar -czf loki-backup-$(date +%Y%m%d).tar.gz observability/volumes/loki-data

# Backup Grafana dashboards
curl -H "Authorization: Bearer GRAFANA_API_KEY" \
  http://localhost:3300/api/search?type=dash-db | \
  jq -r '.[].uid' | \
  xargs -I {} curl -H "Authorization: Bearer GRAFANA_API_KEY" \
  http://localhost:3300/api/dashboards/uid/{} > dashboard-{}.json
```

### 4. Scaling

**Vertical Scaling:**
- Increase CPU/memory limits in docker-compose.yml
- Increase retention storage

**Horizontal Scaling:**
- Multiple Prometheus instances with federation
- Loki multi-tenant deployment
- Grafana read replicas

### 5. Cost Optimization

- Reduce retention (30d → 15d saves 50% storage)
- Increase scrape interval (15s → 30s reduces load)
- Sample high-volume logs (health checks)
- Use remote storage with compression
- Archive old data to S3/GCS (cheaper storage)

---

## 📖 Additional Resources

- **Prometheus**: https://prometheus.io/docs/
- **Loki**: https://grafana.com/docs/loki/
- **Grafana**: https://grafana.com/docs/grafana/
- **PromQL**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **LogQL**: https://grafana.com/docs/loki/latest/logql/
- **AlertManager**: https://prometheus.io/docs/alerting/latest/alertmanager/

---

## 🎯 Next Steps

1. **Start observability stack** (see [Quick Start](#quick-start))
2. **Add /metrics endpoints** to application services (Phase 14)
3. **Create custom dashboards** for business metrics
4. **Set up alerting** rules and notification channels
5. **Configure backups** for metrics and logs
6. **Document runbooks** for alert responses

---

**Need Help?** Check [Troubleshooting](#troubleshooting) or review [OBSERVABILITY_ARCHITECTURE.md](../OBSERVABILITY_ARCHITECTURE.md) for detailed design decisions.
