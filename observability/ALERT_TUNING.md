# NEXO CRM - Alert Threshold Tuning Guide

**Version:** 1.0  
**Last Updated:** 2026-01-29  
**Owner:** DevOps Team

---

## Table of Contents

1. [Overview](#overview)
2. [Baseline Observation Period](#baseline-observation-period)
3. [Alert Health Metrics](#alert-health-metrics)
4. [Tuning Process](#tuning-process)
5. [Common Adjustments](#common-adjustments)
6. [Alert-Specific Tuning](#alert-specific-tuning)
7. [Review Schedule](#review-schedule)
8. [Tools & Queries](#tools--queries)

---

## Overview

Alert threshold tuning is an ongoing process to balance between:

- **Too Sensitive:** Causes alert fatigue, false positives, burnout
- **Too Lenient:** Misses real issues, incidents discovered too late

**Goal:** Each alert should be **actionable, accurate, and valuable**.

### Golden Rules of Alerting

1. **Every alert should require action** (not just information)
2. **Alerts should fire before users notice** (proactive, not reactive)
3. **False positive rate should be <5%** (95% of alerts should be real issues)
4. **Page during off-hours only for SEV1** (respect personal time)

---

## Baseline Observation Period

### Initial Period: 1-2 Weeks

**Purpose:** Observe normal system behavior before making adjustments

#### Week 1: Observation Only
- **Do NOT adjust thresholds yet** (except for obvious mistakes)
- Collect data on alert frequency and patterns
- Note false positives but don't react immediately
- Document normal operating ranges for key metrics

#### Week 2: Pattern Analysis
- Review top 10 most frequent alerts
- Identify time-of-day or day-of-week patterns
- Correlate alerts with deployments, maintenance, peak traffic
- Calculate false positive rate per alert

### Data to Collect

Create a spreadsheet or dashboard to track:

```
| Alert Name | Fires/Day | False Positives | True Positives | FP Rate | Action Taken | Avg Duration |
|------------|-----------|-----------------|----------------|---------|--------------|--------------|
| HighCPUUsage | 12 | 9 | 3 | 75% | Often ignored | 5 min |
| ServiceDown | 1 | 0 | 1 | 0% | Always acted on | 3 min |
| HighLatencyP95 | 8 | 5 | 3 | 62.5% | Sometimes checked | 10 min |
```

### Grafana Dashboard for Alert Analysis

Create a dashboard with:
1. **Alert Firing Rate** (per alert, per day)
2. **Alert Duration** (how long alerts stay active)
3. **Alert Frequency Heatmap** (by hour of day / day of week)
4. **Alert Resolution Time** (time from fire to resolve)

---

## Alert Health Metrics

### Key Metrics to Track

#### 1. Alert Frequency
```promql
# Number of times each alert fired in the last 7 days
count_over_time(ALERTS{alertstate="firing"}[7d])
```

**Good:** 1-5 times per week  
**Warning:** >10 times per week (too sensitive)  
**Critical:** >50 times per week (alert fatigue territory)

#### 2. False Positive Rate
```
FP Rate = (False Positives / Total Alerts) * 100
```

**Good:** <5% false positive rate  
**Acceptable:** 5-10% during tuning phase  
**Bad:** >10% (needs immediate tuning)

#### 3. Time to Acknowledge
```
Avg Time = Sum(time to ack) / Total Alerts
```

**Good:** <5 minutes for SEV1, <15 minutes for SEV2  
**Warning:** >15 minutes for SEV1 (alert ignored?)  
**Action:** If consistently >15 minutes, alert may not be actionable

#### 4. Alert Duration
```promql
# Average time alerts stay firing
avg_over_time((ALERTS{alertstate="firing"} == 1)[7d:])
```

**Good:** 5-30 minutes (issue detected and resolved)  
**Warning:** <5 minutes (flapping, threshold too sensitive)  
**Bad:** >2 hours (alert ignored or unresolvable)

#### 5. Resolution Rate
```
Resolution Rate = (Resolved Alerts / Total Alerts) * 100
```

**Good:** >95% (most alerts resolve after action)  
**Warning:** <80% (alerts timing out without resolution)

---

## Tuning Process

### 5-Step Tuning Workflow

#### Step 1: Identify Noisy Alerts
```promql
# Top 10 most frequent alerts in last 7 days
topk(10, count_over_time(ALERTS{alertstate="firing"}[7d]))
```

**Action:** Start with the noisiest alerts first (biggest impact on alert fatigue)

#### Step 2: Analyze Root Cause of False Positives

**Common Causes:**
- **Threshold too low:** Normal spikes trigger alert
- **Evaluation window too short:** Brief anomalies cause alert
- **Missing context:** Alert doesn't account for time of day or deployment
- **Flapping:** Metric oscillates around threshold

**Investigation Questions:**
1. What was the metric value when alert fired?
2. What is the normal range for this metric?
3. Was there user impact? (check error logs, user reports)
4. Did the alert lead to any action?

#### Step 3: Calculate Proper Threshold

**Approach A: Percentile-Based** (recommended for most metrics)
```promql
# Find 99th percentile over last 7 days
histogram_quantile(0.99, rate(metric_bucket[7d]))
```
- Use 99th percentile as threshold
- Alerts on top 1% of outliers
- Reduces false positives while catching real issues

**Approach B: Standard Deviation** (for normally distributed metrics)
```promql
# Calculate mean and stddev
avg_over_time(metric[7d]) + (3 * stddev_over_time(metric[7d]))
```
- Threshold = Mean + 3 * StdDev
- Alerts on values >3 standard deviations from mean
- Statistically significant outliers

**Approach C: Historical Max + Buffer** (for bounded metrics)
```
Threshold = (Historical Max * 1.2)
```
- Use maximum value seen during baseline period
- Add 20% buffer for safety

#### Step 4: Adjust Alert Configuration

**Options:**
1. **Raise/Lower Threshold:** Change the value that triggers alert
2. **Lengthen Evaluation Window:** Change `for: 5m` to `for: 10m`
3. **Add Inhibition Rules:** Suppress dependent alerts (e.g., don't alert on high latency if service is down)
4. **Change Severity:** Downgrade from critical to warning (page less)
5. **Add Time-Based Logic:** Different thresholds for peak vs off-peak hours

#### Step 5: Monitor Impact

After adjusting:
- **Track for 1 week:** Did alert frequency decrease?
- **Check coverage:** Did we miss any real issues?
- **Iterate:** Tune again if needed

---

## Common Adjustments

### 1. High CPU Usage

**Initial Configuration:**
```yaml
alert: HighCPUUsage
expr: node_cpu_usage > 90
for: 5m
```

**Problem:** Fires during normal traffic spikes (false positives)

**Tuning Options:**

**Option A:** Increase threshold
```yaml
expr: node_cpu_usage > 95  # More lenient (allow 95%)
for: 5m
```

**Option B:** Lengthen evaluation window
```yaml
expr: node_cpu_usage > 90
for: 15m  # Only alert if sustained for 15 minutes
```

**Option C:** Use average instead of instant
```yaml
expr: avg_over_time(node_cpu_usage[5m]) > 90  # Average over 5 min
for: 3m
```

**Recommendation:** Start with Option B (lengthen eval window), then adjust threshold if needed.

---

### 2. High Latency (P95)

**Initial Configuration:**
```yaml
alert: HighLatencyP95
expr: http_request_duration_p95 > 500  # 500ms
for: 5m
```

**Problem:** P95 latency varies by endpoint (e.g., /search is slower than /health)

**Tuning Options:**

**Option A:** Different thresholds per endpoint
```yaml
expr: |
  (http_request_duration_p95{endpoint="/search"} > 2000) or
  (http_request_duration_p95{endpoint=~"/api/.*"} > 500) or
  (http_request_duration_p95{endpoint="/health"} > 100)
for: 5m
```

**Option B:** Use baseline multiplier (alert on 2x normal)
```yaml
expr: |
  http_request_duration_p95 > 
  (avg_over_time(http_request_duration_p95[7d]) * 2)
for: 5m
```

**Option C:** Increase threshold based on observation
```yaml
expr: http_request_duration_p95 > 1000  # 1 second instead of 500ms
for: 5m
```

**Recommendation:** Use Option B (baseline multiplier) for dynamic adjustment.

---

### 3. Error Rate Spike

**Initial Configuration:**
```yaml
alert: ErrorSpike
expr: |
  rate(http_requests_total{status=~"5.."}[5m]) > 
  (avg_over_time(rate(http_requests_total{status=~"5.."}[5m])[7d]) * 2)
for: 5m
```

**Problem:** Fires during deployments (brief error spike is normal)

**Tuning Options:**

**Option A:** Increase multiplier (3x instead of 2x)
```yaml
expr: |
  rate(http_requests_total{status=~"5.."}[5m]) > 
  (avg_over_time(rate(http_requests_total{status=~"5.."}[5m])[7d]) * 3)
for: 5m
```

**Option B:** Exclude deployment windows (if predictable)
```yaml
expr: |
  (rate(http_requests_total{status=~"5.."}[5m]) > baseline * 2)
  and
  (hour() < 9 or hour() > 17)  # Only alert outside deployment hours
for: 5m
```

**Option C:** Require higher absolute threshold
```yaml
expr: |
  (rate(http_requests_total{status=~"5.."}[5m]) > baseline * 2)
  and
  (rate(http_requests_total{status=~"5.."}[5m]) > 10)  # At least 10 errors/sec
for: 5m
```

**Recommendation:** Use Option C (require absolute + relative threshold).

---

### 4. Database Connection Pool

**Initial Configuration:**
```yaml
alert: DatabaseConnectionPoolHigh
expr: db_pool_active_connections / db_pool_max_connections > 0.8
for: 5m
```

**Problem:** Pool usage is naturally high during peak hours (not a problem)

**Tuning Options:**

**Option A:** Increase threshold
```yaml
expr: db_pool_active_connections / db_pool_max_connections > 0.9
for: 5m
```

**Option B:** Alert only if accompanied by errors
```yaml
expr: |
  (db_pool_active_connections / db_pool_max_connections > 0.8)
  and
  (rate(db_connection_errors[5m]) > 0)
for: 5m
```

**Option C:** Alert only if sustained at high level
```yaml
expr: db_pool_active_connections / db_pool_max_connections > 0.8
for: 15m  # Sustained for 15 minutes
```

**Recommendation:** Use Option B (combine with error rate).

---

### 5. Disk Space Low

**Initial Configuration:**
```yaml
alert: DiskSpaceLow
expr: disk_usage_percent > 80
for: 10m
```

**Problem:** Disk usage is predictable and grows slowly (doesn't need immediate page)

**Tuning Options:**

**Option A:** Downgrade to warning (not critical)
```yaml
alert: DiskSpaceLow
severity: warning  # Don't page, just email
expr: disk_usage_percent > 80
for: 10m
```

**Option B:** Multiple tiers (warning at 80%, critical at 90%)
```yaml
# Warning tier
alert: DiskSpaceWarning
severity: warning
expr: disk_usage_percent > 80 and disk_usage_percent <= 90
for: 10m

# Critical tier
alert: DiskSpaceCritical
severity: critical
expr: disk_usage_percent > 90
for: 10m
```

**Option C:** Predict time to full (more advanced)
```yaml
expr: |
  predict_linear(disk_usage_percent[6h], 24*3600) > 95
# Alert if disk will be 95% full in next 24 hours
for: 10m
```

**Recommendation:** Use Option B (tiered alerts).

---

## Alert-Specific Tuning

### Service Availability Alerts

**Rule:** If service is mission-critical, threshold should be LOW (detect quickly)  
**Adjustment:** Rarely tune these (false positives are OK for downtime)

**Example:**
```yaml
alert: ServiceDown
expr: up{job="nexo-crm-service"} == 0
for: 1m  # Keep short (1-2 minutes max)
```

**Tuning:** Only adjust `for` duration, never adjust `expr` (up == 0 is binary)

---

### Resource Exhaustion Alerts

**Rule:** Alert when resources are trending toward exhaustion, not already exhausted  
**Adjustment:** Use percentile or prediction-based thresholds

**Example:**
```yaml
# Good: Alert at 90% (time to take action)
alert: MemoryHigh
expr: memory_usage_percent > 90
for: 5m

# Bad: Alert at 98% (already too late)
alert: MemoryHigh
expr: memory_usage_percent > 98
for: 5m
```

**Tuning:** Find the threshold that gives **30-60 minutes of runway** before failure.

---

### Performance Degradation Alerts

**Rule:** Use percentiles (P95, P99) instead of averages  
**Adjustment:** Tune based on user-perceived impact

**Example:**
```yaml
# Good: P95 latency (95% of requests are fast)
alert: HighLatency
expr: http_request_duration_p95 > 1000

# Avoid: Average latency (can hide outliers)
alert: HighLatency
expr: avg(http_request_duration) > 500
```

**Tuning:** If P95 is too noisy, try P99. If P99 is too lenient, try P90.

---

### Error Rate Alerts

**Rule:** Use rate() over time to smooth spikes  
**Adjustment:** Combine absolute and relative thresholds

**Example:**
```yaml
# Good: Rate + baseline comparison
expr: |
  (rate(errors[5m]) > avg_over_time(rate(errors[5m])[7d]) * 2)
  and
  (rate(errors[5m]) > 1)  # At least 1 error/sec

# Avoid: Instant count (too sensitive)
expr: errors > 100
```

**Tuning:** Adjust multiplier (2x, 3x, 5x) based on normal variability.

---

## Review Schedule

### Weekly Review (First Month)

**When:** Every Friday, 3:00 PM  
**Duration:** 30 minutes  
**Attendees:** On-call engineer, DevOps lead

**Agenda:**
1. Review alert frequency report (top 10)
2. Discuss false positives from past week
3. Propose threshold adjustments
4. Update alerts.yml and commit changes
5. Document changes in this file

**Output:** List of tuned alerts and rationale

---

### Monthly Review (Ongoing)

**When:** First Friday of each month  
**Duration:** 1 hour  
**Attendees:** Engineering team, DevOps lead

**Agenda:**
1. Review alert health metrics (frequency, FP rate, resolution time)
2. Analyze incident patterns (were alerts helpful?)
3. Identify new alerts needed
4. Remove unnecessary alerts
5. Update runbooks based on learnings

**Output:** Updated alerting strategy and action items

---

### Quarterly Review (Strategic)

**When:** End of each quarter  
**Duration:** 2 hours  
**Attendees:** Engineering team, Product, Management

**Agenda:**
1. Review SLA compliance (did alerts help meet SLA?)
2. Cost-benefit analysis (alert infrastructure costs vs value)
3. Team feedback (alert fatigue survey)
4. Benchmark against industry best practices
5. Roadmap for next quarter

**Output:** Observability roadmap and budget

---

## Tools & Queries

### Prometheus Queries for Alert Analysis

#### 1. Alert Frequency (Last 7 Days)
```promql
count_over_time(ALERTS{alertstate="firing"}[7d])
```

#### 2. Alerts by Severity
```promql
sum by (severity) (ALERTS{alertstate="firing"})
```

#### 3. Top 10 Noisiest Alerts
```promql
topk(10, count_over_time(ALERTS{alertstate="firing"}[7d]))
```

#### 4. Alert Duration (Average)
```promql
avg_over_time((time() - ALERTS_FOR_STATE{alertstate="firing"})[7d:])
```

#### 5. Metric at Threshold (Check if threshold is appropriate)
```promql
# Example: Check CPU usage when HighCPUUsage alert fires
node_cpu_usage{job="nexo-crm-service"} and on() ALERTS{alertname="HighCPUUsage"}
```

#### 6. Baseline Calculation (7-Day Average)
```promql
avg_over_time(metric[7d])
```

#### 7. Percentile Calculation (P99)
```promql
histogram_quantile(0.99, rate(metric_bucket[7d]))
```

---

### Grafana Dashboard for Alert Tuning

**Create a dashboard with these panels:**

1. **Alert Firing Rate** (time series)
   - Query: `count_over_time(ALERTS{alertstate="firing"}[1h])`
   - Grouping: By alert name
   - Visualization: Stacked area chart

2. **Alert Frequency Heatmap**
   - Query: `count_over_time(ALERTS{alertstate="firing"}[1h])`
   - Grouping: By hour and day of week
   - Visualization: Heatmap

3. **Top 10 Noisiest Alerts** (bar chart)
   - Query: `topk(10, count_over_time(ALERTS{alertstate="firing"}[7d]))`
   - Visualization: Bar chart (horizontal)

4. **Alert Duration Distribution** (histogram)
   - Query: `histogram_quantile(0.95, ALERTS_FOR_STATE{alertstate="firing"})`
   - Visualization: Histogram

5. **False Positive Tracker** (table)
   - Manual entry: Use annotations in Grafana
   - Columns: Alert Name, Time, Was False Positive (Y/N), Notes

---

### Logging Alert Tuning Changes

**File:** `/tmp/alert-tuning-log.md`

**Format:**
```markdown
# Alert Tuning Log

## 2026-01-29 - HighCPUUsage Threshold Increased
- **Alert:** HighCPUUsage
- **Change:** Threshold 90% → 95%
- **Reason:** Firing 12x per day, 75% false positives
- **Expected Impact:** Reduce alert frequency to 2-3x per day
- **Review Date:** 2026-02-05

## 2026-01-28 - HighLatencyP95 Evaluation Window Extended
- **Alert:** HighLatencyP95
- **Change:** `for: 5m` → `for: 10m`
- **Reason:** Latency spikes are brief (<5 min) and self-resolve
- **Expected Impact:** Reduce flapping alerts
- **Review Date:** 2026-02-04
```

**Action:** Review this log during weekly/monthly reviews to assess effectiveness.

---

## Summary Checklist

### Before Tuning an Alert
- [ ] Observed for at least 1 week
- [ ] Calculated false positive rate
- [ ] Reviewed past incidents (was alert helpful?)
- [ ] Checked user impact (did users notice?)
- [ ] Consulted with on-call engineer

### Tuning Actions
- [ ] Adjust threshold value
- [ ] Lengthen/shorten evaluation window
- [ ] Add context (time of day, related metrics)
- [ ] Change severity (critical → warning)
- [ ] Add inhibition rules

### After Tuning
- [ ] Update alerts.yml
- [ ] Commit change with clear message
- [ ] Restart AlertManager (if needed)
- [ ] Document change in tuning log
- [ ] Monitor for 1 week
- [ ] Review effectiveness

---

## Resources

- **ALERT_RUNBOOKS.md** - Detailed response procedures for each alert
- **ON_CALL_ROTATION.md** - On-call schedule and incident response process
- **Prometheus Docs** - [Alert Rule Best Practices](https://prometheus.io/docs/practices/alerting/)
- **Google SRE Book** - [Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

**Last Review:** 2026-01-29  
**Next Review:** 2026-02-05 (Weekly)  
**Owner:** DevOps Team Lead
