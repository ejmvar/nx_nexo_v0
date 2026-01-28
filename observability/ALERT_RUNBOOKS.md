# Alert Runbooks - NEXO CRM

This document provides detailed runbooks for all Prometheus alerts configured in the NEXO CRM system. Each runbook includes:

- **What it means**: Description of the alert
- **Why it fired**: Common causes
- **How to investigate**: Debugging steps
- **How to resolve**: Remediation actions
- **Escalation**: Who to contact if you can't resolve

---

## Table of Contents

### Service Health Alerts
1. [ServiceDown](#servicedown)
2. [TargetUnreachable](#targetunreachable)
3. [HighRestartRate](#highrestartrate)

### Error Rate Alerts
4. [HighServerErrorRate](#highservererrorrate)
5. [HighClientErrorRate](#highclienterrorrate)
6. [ErrorSpike](#errorspike)

### Performance / Latency Alerts
7. [HighLatencyP95](#highlat encyp95)
8. [HighLatencyP99](#highlatencyp99)
9. [SlowRequestRate](#slowrequestrate)

### Resource Usage Alerts
10. [HighCPUUsage](#highcpuusage)
11. [CriticalCPUUsage](#criticalcpuusage)
12. [HighMemoryUsage](#highmemoryusage)
13. [CriticalMemoryUsage](#criticalmemoryusage)
14. [PossibleMemoryLeak](#possiblememoryleak)

### System-Level Alerts
15. [DiskSpaceLow](#diskspacelow)
16. [DiskSpaceCritical](#diskspacecritical)
17. [HighLoadAverage](#highloadaverage)

### Database Alerts
18. [PostgreSQLDown](#postgresqldown)
19. [HighDatabaseConnections](#highdatabaseconnections)

### Messaging Alerts
20. [RabbitMQDown](#rabbitmqdown)
21. [HighUnackedMessages](#highunackedmessages)

### Cache Alerts
22. [RedisDown](#redisdown)
23. [RedisHighMemory](#redishighmemory)

### Prometheus Self-Monitoring
24. [PrometheusTooManyTimeSeries](#prometheustooomanytimeseries)
25. [PrometheusTargetScrapeFailed](#prometheustargetscrapefailed)

---

## Service Health Alerts

### ServiceDown

**Severity**: Critical  
**Category**: Availability

#### What it means
A critical service (auth, gateway, or CRM) is not responding and Prometheus cannot scrape metrics from it.

#### Why it fired
- Service process crashed or was killed
- Container stopped or failed healthcheck
- Network connectivity issues
- Port conflict or binding failure
- Out of memory (OOM) kill
- Unhandled exception in startup code

#### How to investigate

1. **Check service status**:
   ```bash
   # For Docker containers
   docker ps -a | grep nexo
   
   # For Nx serve processes
   ps aux | grep nx:serve
   ```

2. **Check service logs**:
   ```bash
   # Docker logs
   docker logs nexo-crm-service --tail 100
   
   # Nx logs (if running via pnpm)
   tail -100 /tmp/crm-service.log
   ```

3. **Check Prometheus targets**:
   - Go to http://localhost:9090/targets
   - Find the down service
   - Check error message

4. **Check system resources**:
   ```bash
   # Check if OOM killed the process
   dmesg | grep -i "killed process"
   
   # Check available memory
   free -h
   ```

#### How to resolve

1. **Restart the service**:
   ```bash
   # Docker
   docker restart nexo-crm-service
   
   # Nx serve
   cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj
   pnpm nx serve crm-service
   ```

2. **If restart fails, check for**:
   - Port already in use: `lsof -i :3003`
   - Configuration errors in logs
   - Missing environment variables
   - Database connectivity issues

3. **Verify service is healthy**:
   ```bash
   curl http://localhost:3003/api/health
   curl http://localhost:3003/api/metrics
   ```

#### Escalation
- **Immediate**: Platform Team Lead
- **After hours**: On-call DevOps engineer
- **Communication**: #incidents Slack channel

---

### TargetUnreachable

**Severity**: Warning  
**Category**: Availability

#### What it means
Prometheus cannot scrape metrics from a target for more than 2 minutes.

#### Why it fired
- Network connectivity issues
- Firewall blocking access
- Metrics endpoint not configured
- Service running but metrics port closed
- Rate limiting on metrics endpoint

#### How to investigate

1. **Check Prometheus targets page**:
   - http://localhost:9090/targets
   - Check error message for the target

2. **Test connectivity manually**:
   ```bash
   curl -v http://localhost:3003/api/metrics
   telnet localhost 3003
   ```

3. **Check service logs for metrics endpoint errors**:
   ```bash
   docker logs nexo-crm-service | grep metrics
   ```

4. **Verify Prometheus configuration**:
   ```bash
   docker exec nexo-prometheus promtool check config /etc/prometheus/prometheus.yml
   ```

#### How to resolve

1. **If metrics endpoint is missing**:
   - Check service code has `PrometheusModule` imported
   - Verify `/metrics` or `/api/metrics` route is registered
   - Check controller is properly decorated

2. **If network issue**:
   - Check Docker network connectivity
   - Verify service IP in prometheus.yml matches actual IP
   - Test with `docker exec nexo-prometheus wget -O- http://172.17.0.1:3003/api/metrics`

3. **Reload Prometheus configuration**:
   ```bash
   curl -X POST http://localhost:9090/-/reload
   ```

#### Escalation
- **Immediate**: Platform Team
- **If persists >30 min**: Escalate to DevOps

---

### HighRestartRate

**Severity**: Warning  
**Category**: Availability

#### What it means
A service is restarting frequently, indicating instability.

#### Why it fired
- Crash loop due to bug
- Healthcheck failing repeatedly
- Resource limits causing OOM kills
- Configuration issue causing startup failures
- Dependency (DB, Redis, RabbitMQ) not available

#### How to investigate

1. **Check restart count**:
   ```bash
   docker inspect nexo-crm-service | jq '.[0].RestartCount'
   ```

2. **Check logs for crash pattern**:
   ```bash
   docker logs nexo-crm-service --timestamps | tail -500
   ```

3. **Look for common issues**:
   - Uncaught exceptions
   - Database connection failures
   - Port binding conflicts
   - Missing environment variables

4. **Check resource limits**:
   ```bash
   docker stats nexo-crm-service
   ```

#### How to resolve

1. **If crash loop**:
   - Fix the bug causing crashes
   - Deploy hotfix
   - Rollback to previous stable version

2. **If resource issue**:
   - Increase memory limit in docker-compose
   - Optimize application memory usage
   - Scale horizontally if needed

3. **If dependency issue**:
   - Verify database is accessible
   - Check Redis/RabbitMQ connectivity
   - Fix connection strings

#### Escalation
- **Immediate**: Service owner team
- **If production impact**: Incident Commander

---

## Error Rate Alerts

### HighServerErrorRate

**Severity**: Critical  
**Category**: Errors

#### What it means
More than 5% of requests are returning 5xx errors for 5 consecutive minutes.

#### Why it fired
- Application bugs causing exceptions
- Database connectivity issues
- Dependency service failures
- Timeout errors from slow queries
- Resource exhaustion (memory, connections)

#### How to investigate

1. **Check error dashboard**:
   - Open http://localhost:3300
   - Navigate to service-specific dashboard
   - Check "Error Requests" panel

2. **Query Prometheus for error details**:
   ```promql
   # Error rate by status code
   sum(rate(http_requests_total{service="crm-service",status=~"5.."}[5m])) by (status, method, route)
   
   # Which endpoints are failing?
   topk(10, sum(rate(http_requests_total{status=~"5.."}[5m])) by (route))
   ```

3. **Check application logs**:
   ```bash
   docker logs nexo-crm-service --tail 200 | grep -i error
   ```

4. **Check database connectivity**:
   ```bash
   docker exec nexo-postgres pg_isready
   ```

#### How to resolve

1. **If application bug**:
   - Identify failing endpoint from metrics
   - Check recent deployments
   - Rollback if needed
   - Deploy hotfix

2. **If database issue**:
   - Check database health
   - Check connection pool exhaustion
   - Restart database if needed
   - Scale database if overloaded

3. **If dependency issue**:
   - Check Redis, RabbitMQ status
   - Verify all external APIs are accessible
   - Enable circuit breakers if available

4. **If resource exhaustion**:
   - Check memory usage
   - Check connection pool limits
   - Restart service if memory leak suspected

#### Escalation
- **Immediate**: Service owner + Platform Team
- **Customer impact**: Incident Commander
- **If database**: Database Team

---

### HighClientErrorRate

**Severity**: Warning  
**Category**: Errors

#### What it means
More than 10% of requests are returning 4xx errors for 10 consecutive minutes.

#### Why it fired
- API contract changes breaking clients
- Invalid authentication tokens
- Validation failures
- Malicious traffic or bot activity
- Client-side bugs

#### How to investigate

1. **Check error distribution**:
   ```promql
   # 4xx errors by status code
   sum(rate(http_requests_total{status=~"4.."}[5m])) by (status, route)
   ```

2. **Check if specific status code**:
   - 400: Invalid request body/parameters
   - 401: Authentication failures
   - 403: Authorization failures
   - 404: Routes not found
   - 429: Rate limiting

3. **Check logs for patterns**:
   ```bash
   docker logs nexo-gateway --tail 500 | grep " 4[0-9][0-9] "
   ```

4. **Check if bot/attack**:
   ```promql
   # High request rate from specific clients
   topk(10, sum(rate(http_requests_total{status=~"4.."}[5m])) by (client_ip))
   ```

#### How to resolve

1. **If authentication issue (401)**:
   - Check auth service health
   - Verify JWT signing keys
   - Check token expiration settings

2. **If API contract change**:
   - Review recent API changes
   - Check if clients updated
   - Add backward compatibility if needed

3. **If bot/malicious traffic**:
   - Identify source IPs
   - Apply rate limiting
   - Block malicious IPs at firewall/gateway

4. **If validation failures**:
   - Review validation rules
   - Check if frontend sending correct data
   - Fix validation if too strict

#### Escalation
- **If authentication**: Auth Team
- **If API changes**: API owner team
- **If attack**: Security Team

---

### ErrorSpike

**Severity**: Warning  
**Category**: Errors

#### What it means
Error rate suddenly doubled compared to baseline.

#### Why it fired
- New deployment with bugs
- Traffic spike overwhelming system
- Dependency failure
- Database slowdown
- Cache invalidation causing DB load

#### How to investigate

1. **Compare current vs baseline**:
   ```promql
   # Current error rate
   sum(rate(http_requests_total{status=~"[45].."}[2m])) by (service)
   
   # Baseline (10 minutes ago)
   sum(rate(http_requests_total{status=~"[45].."}[10m] offset 10m)) by (service)
   ```

2. **Check recent changes**:
   - Recent deployments
   - Configuration changes
   - Infrastructure changes

3. **Check traffic patterns**:
   ```promql
   # Request rate
   sum(rate(http_requests_total[2m])) by (service)
   ```

4. **Check dependency health**:
   - Database query time
   - Redis hit rate
   - External API latency

#### How to resolve

1. **If new deployment**:
   - Review deployment logs
   - Quick rollback if critical
   - Deploy fix if known

2. **If traffic spike**:
   - Scale up service instances
   - Enable rate limiting
   - Enable caching

3. **If dependency issue**:
   - Check and fix dependency
   - Enable circuit breakers
   - Use fallback/cached data

4. **If cache issue**:
   - Check cache hit rate
   - Warm up cache
   - Optimize cache strategy

#### Escalation
- **Immediate**: Service owner
- **If persists >15 min**: Platform Team

---

## Performance / Latency Alerts

### HighLatencyP95

**Severity**: Warning  
**Category**: Performance

#### What it means
95th percentile request latency exceeds 500ms for 5 minutes.

#### Why it fired
- Database queries slowing down
- N+1 query problems
- Missing database indexes
- Slow external API calls
- High CPU/memory usage
- Cache misses

#### How to investigate

1. **Check latency dashboard**:
   - Open service dashboard in Grafana
   - Check "Request Duration Percentiles" panel
   - Identify which percentile is high

2. **Check latency by endpoint**:
   ```promql
   # p95 by route
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
   ) * 1000
   ```

3. **Check database query performance**:
   ```bash
   # Connect to database
   docker exec -it nexo-postgres psql -U nexo -d crm_db
   
   # Check slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

4. **Check resource usage**:
   - CPU usage of service
   - Memory usage
   - Database connections

#### How to resolve

1. **If database slow**:
   - Add missing indexes
   - Optimize slow queries
   - Fix N+1 queries (use joins/eager loading)
   - Scale database vertically

2. **If external API slow**:
   - Implement caching
   - Add timeouts
   - Use circuit breakers
   - Call APIs in parallel
   - Use background jobs for non-critical calls

3. **If resource constrained**:
   - Scale up service resources
   - Optimize memory usage
   - Enable connection pooling

4. **If cache misses**:
   - Improve cache hit rate
   - Increase cache size
   - Warm up caches proactively

#### Escalation
- **If database**: Database Team
- **If performance regression**: Service owner + Performance Team

---

### HighLatencyP99

**Severity**: Critical  
**Category**: Performance

#### What it means
99th percentile request latency exceeds 1 second for 5 minutes. User experience degraded.

#### Why it fired
Same as HighLatencyP95 but more severe.

#### How to investigate
Same as HighLatencyP95.

#### How to resolve
Same as HighLatencyP95, but with higher urgency.

**Additional actions**:
- Consider emergency cache bypass
- Consider feature toggle to disable slow features
- Scale immediately while investigating

#### Escalation
- **Immediate**: Service owner + Platform Team
- **Customer impact**: Incident Commander

---

### SlowRequestRate

**Severity**: Warning  
**Category**: Performance

#### What it means
Median (p50) request latency exceeds 200ms, indicating systemic slowness.

#### Why it fired
- Database overloaded
- Connection pool exhausted
- Lock contention
- Slow network
- Resource exhaustion

#### How to investigate

1. **Check p50 latency trend**:
   - Check if gradually increasing (memory leak?)
   - Check if sudden jump (deployment?)

2. **Check database metrics**:
   - Active connections
   - Lock waits
   - Query execution times

3. **Check connection pools**:
   ```bash
   # Check pool exhaustion in logs
   docker logs nexo-crm-service | grep -i "connection pool"
   ```

4. **Check for lock contention**:
   ```sql
   SELECT * FROM pg_locks WHERE NOT granted;
   ```

#### How to resolve

1. **If database overloaded**:
   - Scale database
   - Optimize queries
   - Add read replicas

2. **If connection pool exhausted**:
   - Increase pool size
   - Fix connection leaks
   - Add connection retry logic

3. **If lock contention**:
   - Identify blocking queries
   - Optimize transactions
   - Reduce transaction duration

#### Escalation
- **Immediate**: Database Team + Service owner

---

## Resource Usage Alerts

### HighCPUUsage

**Severity**: Warning  
**Category**: Resources

#### What it means
CPU usage >90% for 10 minutes.

#### Why it fired
- Traffic spike
- CPU-intensive operations
- Inefficient algorithms
- Infinite loops
- Crypto mining malware (rare)

#### How to investigate

1. **Check CPU usage**:
   ```bash
   docker stats nexo-crm-service
   
   # Or for processes
   top -p $(pgrep -f nx:serve:crm)
   ```

2. **Check request rate**:
   ```promql
   rate(http_requests_total{service="crm-service"}[5m])
   ```

3. **Check for CPU-intensive endpoints**:
   - Look for data processing endpoints
   - Report generation
   - Bulk operations

4. **Profile the application** (if needed):
   - Use Node.js profiler
   - Check for hot code paths

#### How to resolve

1. **Immediate relief**:
   - Scale horizontally (add instances)
   - Scale vertically (increase CPU limit)

2. **Long-term fixes**:
   - Optimize hot code paths
   - Move CPU-intensive work to background jobs
   - Implement caching
   - Use pagination for large datasets

3. **If traffic spike**:
   - Enable rate limiting
   - Scale out

#### Escalation
- **If sustained >30 min**: Platform Team
- **If optimization needed**: Service owner + Performance Team

---

### CriticalCPUUsage

**Severity**: Critical  
**Category**: Resources

#### What it means
CPU usage >95% for 5 minutes. Service at risk of becoming unresponsive.

#### Why it fired
Same as HighCPUUsage but more severe.

#### How to investigate
Same as HighCPUUsage.

#### How to resolve
**Emergency actions**:
1. Scale immediately (don't wait for diagnosis)
2. Enable rate limiting to reduce load
3. Kill non-essential background jobs
4. Investigate cause in parallel

#### Escalation
- **Immediate**: Platform Team + Service owner
- **If production impacted**: Incident Commander

---

### HighMemoryUsage

**Severity**: Warning  
**Category**: Resources

#### What it means
Memory usage >90% of limit (>966MB) for 10 minutes.

#### Why it fired
- Memory leak
- Large data structures in memory
- Missing garbage collection
- Caching too much data
- Large bulk operations

#### How to investigate

1. **Check memory usage**:
   ```bash
   docker stats nexo-crm-service
   
   # Detailed memory info
   docker exec nexo-crm-service node -e "console.log(process.memoryUsage())"
   ```

2. **Check for memory leaks**:
   - Look at memory trend over time
   - If steadily increasing → likely leak

3. **Check heap snapshot** (if Node.js):
   ```bash
   # Generate heap snapshot
   kill -USR2 $(pgrep -f nx:serve:crm)
   ```

4. **Check application logs**:
   ```bash
   docker logs nexo-crm-service | grep -i "memory\|heap"
   ```

#### How to resolve

1. **Immediate relief**:
   - Restart service (temporary fix)
   - Increase memory limit (if not a leak)
   - Scale horizontally

2. **Long-term fixes**:
   - Fix memory leaks
   - Implement streaming for large datasets
   - Optimize caching strategies
   - Process data in chunks
   - Clear unused references

3. **If large operations**:
   - Move to background jobs
   - Implement pagination
   - Use database for aggregations

#### Escalation
- **If leak suspected**: Service owner + Platform Team
- **If OOM kills happening**: Immediate escalation

---

### CriticalMemoryUsage

**Severity**: Critical  
**Category**: Resources

#### What it means
Memory usage >95% of limit (>1019MB) for 5 minutes. Risk of OOM kill.

#### Why it fired
Same as HighMemoryUsage but imminent OOM risk.

#### How to investigate
Same as HighMemoryUsage.

#### How to resolve
**Emergency actions**:
1. Restart service immediately to prevent OOM
2. Increase memory limit temporarily
3. Scale horizontally urgently
4. Investigate and fix root cause

#### Escalation
- **Immediate**: Service owner + Platform Team
- **If repeated OOMs**: Incident Commander

---

### PossibleMemoryLeak

**Severity**: Warning  
**Category**: Resources

#### What it means
Memory usage increased by >100MB over the last hour, suggesting a memory leak.

#### Why it fired
- Event listeners not removed
- References not cleared
- Circular references
- Cache growing unbounded
- Background jobs accumulating data

#### How to investigate

1. **Verify it's actually leaking**:
   - Check if memory continues to grow
   - Check if it stabilizes after a while

2. **Take heap snapshots**:
   - Snapshot at start
   - Snapshot after 1 hour
   - Compare to find growing objects

3. **Check common leak sources**:
   - Event emitters
   - Timers/intervals
   - Database connections
   - WebSocket connections
   - Large caches

4. **Review recent code changes**:
   - New features
   - New dependencies

#### How to resolve

1. **Short-term**:
   - Restart service daily (cron job)
   - Monitor memory trend

2. **Long-term**:
   - Fix the memory leak
   - Add proper cleanup in event handlers
   - Implement bounded caches
   - Clear intervals/timeouts
   - Close connections properly

3. **Prevention**:
   - Run memory profiling in tests
   - Set up automated leak detection
   - Perform load testing before production

#### Escalation
- **Immediate**: Service owner
- **If fix not found**: Platform Team for profiling help

---

## System-Level Alerts

### DiskSpaceLow

**Severity**: Warning  
**Category**: Resources

#### What it means
Disk space <15% free on root filesystem.

#### Why it fired
- Logs growing unbounded
- Database growing
- Prometheus TSDB growing
- Temp files not cleaned
- Old Docker images

#### How to investigate

1. **Check disk usage**:
   ```bash
   df -h
   
   # Find large directories
   du -sh /* | sort -h | tail -20
   ```

2. **Check log directories**:
   ```bash
   du -sh /var/log/*
   du -sh /var/lib/docker/containers/*/*-json.log | sort -h | tail -20
   ```

3. **Check Docker disk usage**:
   ```bash
   docker system df
   ```

#### How to resolve

1. **Clean up logs**:
   ```bash
   # Truncate large log files
   truncate -s 0 /var/log/large-file.log
   
   # Configure log rotation
   logrotate -f /etc/logrotate.conf
   ```

2. **Clean Docker**:
   ```bash
   # Remove unused images
   docker image prune -a
   
   # Remove unused volumes
   docker volume prune
   
   # Remove stopped containers
   docker container prune
   ```

3. **Clean Prometheus data**:
   ```bash
   # Reduce retention
   # Edit prometheus.yml --storage.tsdb.retention.time=15d
   ```

4. **Expand disk** (if cloud):
   - Resize volume
   - Expand filesystem

#### Escalation
- **Immediate**: Platform Team / DevOps
- **If cloud**: Cloud Infrastructure Team

---

### DiskSpaceCritical

**Severity**: Critical  
**Category**: Resources

#### What it means
Disk space <10% free. System at risk of becoming unresponsive.

#### Why it fired
Same as DiskSpaceLow but more urgent.

#### How to investigate
Same as DiskSpaceLow.

#### How to resolve
**Emergency actions**:
1. Delete immediately:
   ```bash
   # Delete old logs
   find /var/log -type f -name "*.log" -mtime +7 -delete
   
   # Clean Docker aggressively
   docker system prune -a -f --volumes
   ```

2. Stop non-critical services temporarily

3. Expand disk urgently

#### Escalation
- **Immediate**: DevOps + Platform Team
- **Production system**: Incident Commander

---

### HighLoadAverage

**Severity**: Warning  
**Category**: Resources

#### What it means
5-minute load average >2.0 for 10 minutes.

#### Why it fired
- Too many processes running
- CPU contention
- I/O wait
- Runaway processes
- Traffic spike

#### How to investigate

1. **Check load average**:
   ```bash
   uptime
   top  # Press '1' to see per-CPU
   ```

2. **Check if CPU or I/O bound**:
   ```bash
   # High %wa = I/O wait
   # High %us = user CPU
   # High %sy = system CPU
   iostat -x 1 5
   ```

3. **Find top processes**:
   ```bash
   ps aux --sort=-%cpu | head -20  # CPU hogs
   ps aux --sort=-%mem | head -20  # Memory hogs
   ```

4. **Check I/O**:
   ```bash
   iotop
   ```

#### How to resolve

1. **If CPU bound**:
   - Same as HighCPUUsage

2. **If I/O bound**:
   - Check slow disk
   - Optimize database queries
   - Use faster storage (SSD)
   - Reduce log verbosity

3. **If runaway processes**:
   - Kill rogue processes
   - Investigate why they started

#### Escalation
- **If sustained >30 min**: Platform Team

---

## Database Alerts

### PostgreSQLDown

**Severity**: Critical  
**Category**: Database

#### What it means
PostgreSQL database is not responding.

#### Why it fired
- Database crashed
- Out of disk space
- Out of memory
- Corruption
- Configuration error

#### How to investigate

1. **Check database status**:
   ```bash
   docker ps -a | grep postgres
   docker logs nexo-postgres --tail 100
   ```

2. **Try to connect**:
   ```bash
   docker exec nexo-postgres pg_isready
   docker exec -it nexo-postgres psql -U nexo -d crm_db -c "SELECT 1"
   ```

3. **Check disk space**:
   ```bash
   docker exec nexo-postgres df -h
   ```

4. **Check for corruption**:
   ```bash
   docker logs nexo-postgres | grep -i "corruption\|panic\|fatal"
   ```

#### How to resolve

1. **If stopped**:
   ```bash
   docker start nexo-postgres
   ```

2. **If crashed, restart**:
   ```bash
   docker restart nexo-postgres
   ```

3. **If disk full**:
   - Free up disk space
   - Vacuum database
   - Archive old data

4. **If corruption**:
   - Restore from backup
   - Run REINDEX if needed
   - Escalate to DBA

#### Escalation
- **Immediate**: Database Team + Platform Team
- **If corruption**: Senior DBA
- **Production**: Incident Commander

---

### HighDatabaseConnections

**Severity**: Warning  
**Category**: Database

#### What it means
Database using >80% of max connections.

#### Why it fired
- Connection leaks in application
- Connection pool misconfigured
- Traffic spike
- Max connections set too low

#### How to investigate

1. **Check connection count**:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   SELECT max_conn, used, res_for_super, max_conn-used-res_for_super AS res_for_normal
   FROM (
     SELECT count(*) used FROM pg_stat_activity) t1,
     (SELECT setting::int res_for_super FROM pg_settings WHERE name='superuser_reserved_connections') t2,
     (SELECT setting::int max_conn FROM pg_settings WHERE name='max_connections') t3;
   ```

2. **Check which applications are using connections**:
   ```sql
   SELECT application_name, count(*)
   FROM pg_stat_activity
   GROUP BY application_name
   ORDER BY count DESC;
   ```

3. **Check idle connections**:
   ```sql
   SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
   ```

4. **Check for long-running queries holding connections**:
   ```sql
   SELECT pid, now() - query_start as duration, state, query
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY duration DESC;
   ```

#### How to resolve

1. **If connection leaks**:
   - Find and fix leaking service
   - Ensure connections are released
   - Use connection pooling properly

2. **If too many idle connections**:
   - Reduce connection pool size in apps
   - Set idle timeout

3. **If long-running queries**:
   - Kill long queries if safe:
     ```sql
     SELECT pg_cancel_backend(pid);
     -- or force kill:
     SELECT pg_terminate_backend(pid);
     ```

4. **If insufficient max_connections**:
   - Increase max_connections in postgresql.conf
   - Restart PostgreSQL

#### Escalation
- **Immediate**: Database Team
- **If connection pool issues**: Service owner

---

## Messaging Alerts

### RabbitMQDown

**Severity**: Critical  
**Category**: Messaging

#### What it means
RabbitMQ message broker is not responding.

#### Why it fired
- RabbitMQ crashed
- Out of disk space
- Erlang VM crashed
- Network issues

#### How to investigate

1. **Check RabbitMQ status**:
   ```bash
   docker ps -a | grep rabbitmq
   docker logs nexo-rabbitmq --tail 100
   ```

2. **Check management UI**:
   - http://localhost:15672

3. **Check Erlang process**:
   ```bash
   docker exec nexo-rabbitmq rabbitmqctl status
   ```

#### How to resolve

1. **Restart RabbitMQ**:
   ```bash
   docker restart nexo-rabbitmq
   ```

2. **If disk full**:
   - Free up space
   - Configure disk alarm

3. **If memory alarm**:
   - Increase memory limit
   - Clear old queues

#### Escalation
- **Immediate**: Platform Team
- **Production**: Incident Commander

---

### HighUnackedMessages

**Severity**: Warning  
**Category**: Messaging

#### What it means
Queue has >1000 unacknowledged messages.

#### Why it fired
- Consumer not processing messages
- Consumer crashed
- Messages causing errors
- Processing taking too long

#### How to investigate

1. **Check RabbitMQ management UI**:
   - Check queue depth
   - Check consumer status
   - Check message rate

2. **Check consumer logs**:
   ```bash
   docker logs nexo-crm-service | grep -i "rabbit\|queue\|consumer"
   ```

3. **Check for errors in message processing**:
   - Look for rejected/nacked messages

#### How to resolve

1. **If consumer down**:
   - Restart consumer service
   - Check why it stopped

2. **If messages erroring**:
   - Check dead letter queue
   - Fix message format issues
   - Skip problematic messages

3. **If processing slow**:
   - Scale consumers
   - Optimize processing logic
   - Increase prefetch count

#### Escalation
- **Immediate**: Service owner
- **If queue growing**: Platform Team

---

## Cache Alerts

### RedisDown

**Severity**: Critical  
**Category**: Cache

#### What it means
Redis cache is not responding.

#### Why it fired
- Redis crashed
- Out of memory
- Network issues
- Configuration error

#### How to investigate

1. **Check Redis status**:
   ```bash
   docker ps -a | grep redis
   docker logs nexo-redis --tail 100
   ```

2. **Try to connect**:
   ```bash
   docker exec nexo-redis redis-cli ping
   ```

3. **Check Redis info**:
   ```bash
   docker exec nexo-redis redis-cli INFO
   ```

#### How to resolve

1. **Restart Redis**:
   ```bash
   docker restart nexo-redis
   ```

2. **If memory issue**:
   - Increase maxmemory
   - Configure eviction policy
   - Clear cache if needed

3. **If corrupted**:
   - Restore from RDB/AOF
   - Or flush and rebuild cache

#### Escalation
- **Immediate**: Platform Team
- **Data loss concerns**: CTO

---

### RedisHighMemory

**Severity**: Warning  
**Category**: Cache

#### What it means
Redis using >90% of max memory.

#### Why it fired
- Too much data cached
- Eviction policy not working
- Memory leak in cached data
- Keys not expiring

#### How to investigate

1. **Check memory usage**:
   ```bash
   docker exec nexo-redis redis-cli INFO memory
   ```

2. **Check key count**:
   ```bash
   docker exec nexo-redis redis-cli DBSIZE
   ```

3. **Check largest keys**:
   ```bash
   docker exec nexo-redis redis-cli --bigkeys
   ```

4. **Check TTL distribution**:
   ```bash
   docker exec nexo-redis redis-cli --scan --pattern '*' | xargs -L 1 redis-cli TTL
   ```

#### How to resolve

1. **Clear unused keys**:
   ```bash
   # Clear specific pattern
   docker exec nexo-redis redis-cli --scan --pattern 'temp:*' | xargs redis-cli DEL
   ```

2. **Set expiration on keys without TTL**:
   ```bash
   # Find keys without TTL (returns -1)
   # Set appropriate TTL
   ```

3. **Increase max memory**:
   - Edit redis.conf
   - Restart Redis

4. **Configure eviction policy**:
   - allkeys-lru: Evict least recently used
   - volatile-lru: Evict LRU with TTL
   - allkeys-lfu: Evict least frequently used

#### Escalation
- **Immediate**: Platform Team
- **If architecture issue**: Service owner

---

## Prometheus Self-Monitoring

### PrometheusTooManyTimeSeries

**Severity**: Warning  
**Category**: Monitoring

#### What it means
Prometheus has >100000 time series, which may impact performance.

#### Why it fired
- High cardinality metrics
- Too many labels
- Too many services/instances
- Metrics explosion

#### How to investigate

1. **Check TSDB status**:
   - http://localhost:9090/tsdb-status

2. **Find high cardinality metrics**:
   ```promql
   topk(10, count by (__name__)({__name__=~".+"}))
   ```

3. **Check label cardinality**:
   - Look for labels with many unique values
   - user_id, request_id in labels is bad!

#### How to resolve

1. **Remove high cardinality metrics**:
   - Don't use user IDs as labels
   - Don't use request IDs as labels
   - Use fixed label values

2. **Reduce scrape targets**:
   - Remove unnecessary services
   - Increase scrape interval

3. **Reduce retention**:
   - From 30d to 15d

4. **Scale Prometheus**:
   - Increase resources
   - Use remote storage
   - Use federation

#### Escalation
- **Immediate**: Platform Team
- **Architecture changes needed**: DevOps Lead

---

### PrometheusTargetScrapeFailed

**Severity**: Warning  
**Category**: Monitoring

#### What it means
Prometheus failed to scrape a target.

#### Why it fired
- Target down
- Network issue
- Metrics endpoint error
- Scrape timeout

#### How to investigate

1. **Check targets page**:
   - http://localhost:9090/targets
   - Check error message

2. **Test manually**:
   ```bash
   curl http://172.17.0.1:3003/api/metrics
   ```

3. **Check Prometheus logs**:
   ```bash
   docker logs nexo-prometheus | grep -i error
   ```

#### How to resolve

1. **Same as TargetUnreachable alert**

2. **If scrape timeout**:
   - Optimize metrics endpoint
   - Increase scrape_timeout

3. **If metrics endpoint erroring**:
   - Fix application code
   - Check for metric name collisions

#### Escalation
- **Immediate**: Platform Team

---

## Summary

This runbook covers all configured alerts for the NEXO CRM system. Remember:

1. **Check dashboards first**: http://localhost:3300
2. **Check Prometheus alerts**: http://localhost:9090/alerts
3. **Check AlertManager**: http://localhost:9093
4. **Follow escalation paths**: Don't hesitate to escalate critical issues
5. **Document incidents**: Update runbooks with new learnings
6. **Post-mortems**: Conduct blameless post-mortems for critical incidents

## Additional Resources

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3300  (admin/admin)
- **AlertManager**: http://localhost:9093
- **Runbook repo**: https://github.com/nexo-crm/runbooks
- **On-call rotation**: https://pagerduty.com/schedules/nexo-platform
- **Incident channel**: #incidents on Slack
- **Documentation**: https://docs.nexo-crm.com
