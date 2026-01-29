# NEXO CRM - On-Call Rotation Guide

**Version:** 1.0  
**Last Updated:** 2026-01-29  
**Owner:** DevOps Team

---

## Table of Contents

1. [Overview](#overview)
2. [On-Call Schedule](#on-call-schedule)
3. [Team Assignments](#team-assignments)
4. [Escalation Matrix](#escalation-matrix)
5. [Responsibilities](#responsibilities)
6. [Handoff Procedures](#handoff-procedures)
7. [Tools & Resources](#tools--resources)
8. [Training Requirements](#training-requirements)
9. [Fire Drills](#fire-drills)
10. [Incident Response Process](#incident-response-process)

---

## Overview

The NEXO CRM on-call rotation ensures 24/7/365 incident response coverage for production systems. The on-call engineer is the first responder for all critical alerts and is responsible for initial triage, investigation, and resolution.

### Key Responsibilities

- **Monitor:** Respond to alerts within SLA timeframes
- **Triage:** Assess severity and impact of incidents
- **Resolve:** Fix issues or escalate to subject matter experts
- **Document:** Log all incidents in the incident management system
- **Communicate:** Update stakeholders on status and resolution

---

## On-Call Schedule

### Schedule Type

**Choose one based on team size and requirements:**

#### Option A: 24/7 Coverage (Recommended for Production)
- **Rotation Frequency:** Weekly (Monday 9:00 AM to Monday 9:00 AM)
- **Coverage:** All hours, all days including weekends and holidays
- **Team Size Required:** Minimum 4 engineers (sustainable rotation)

#### Option B: Business Hours Coverage
- **Rotation Frequency:** Weekly (Monday to Friday, 9:00 AM to 6:00 PM)
- **Coverage:** Business hours only (excluding weekends/holidays)
- **Team Size Required:** Minimum 2 engineers
- **After-Hours:** Escalate to Level 2 (Team Lead)

#### Current Configuration
```yaml
Coverage Type: [TO BE DECIDED]
Rotation Start: [Monday 9:00 AM Local Time]
Rotation Duration: [1 week]
Handoff Time: [Monday 9:00 AM]
```

---

## Team Assignments

### On-Call Engineers

| Engineer Name | Primary Skills | Timezone | Contact |
|--------------|----------------|----------|---------|
| TBD | Backend, PostgreSQL, Redis | UTC+X | phone: +XXX, email: XXX |
| TBD | Backend, Microservices, RabbitMQ | UTC+X | phone: +XXX, email: XXX |
| TBD | Full-stack, Frontend, Auth | UTC+X | phone: +XXX, email: XXX |
| TBD | DevOps, Infrastructure, Docker | UTC+X | phone: +XXX, email: XXX |

### Rotation Schedule Template

**Month: [January 2026]**

| Week | Primary On-Call | Backup On-Call | Notes |
|------|----------------|----------------|-------|
| Jan 6-12 | Engineer 1 | Engineer 2 | New Year week |
| Jan 13-19 | Engineer 2 | Engineer 3 | |
| Jan 20-26 | Engineer 3 | Engineer 4 | |
| Jan 27-Feb 2 | Engineer 4 | Engineer 1 | |

### Vacation Coverage

- **Advance Notice:** Request coverage swap at least **2 weeks** in advance
- **Approval Required:** Team Lead must approve all swaps
- **Documentation:** Update schedule in on-call management tool
- **Backup:** Always ensure backup engineer is available

---

## Escalation Matrix

### Severity Levels & Response SLAs

| Severity | Response Time | Resolution Time | Notification Channels |
|----------|---------------|-----------------|----------------------|
| **SEV1 - Critical** | 5 minutes | 1 hour | Phone, Slack, Email |
| **SEV2 - High** | 15 minutes | 4 hours | Slack, Email |
| **SEV3 - Medium** | 1 hour | 24 hours | Slack, Email |
| **SEV4 - Low** | Next business day | 1 week | Email |

### Escalation Levels

#### Level 1: Primary On-Call Engineer
- **Who:** Current on-call engineer
- **When:** All alerts (critical, warning, infrastructure)
- **Contact:** Slack DM, Phone call
- **SLA:** 5 minutes for SEV1, 15 minutes for SEV2

#### Level 2: Team Lead / Engineering Manager
- **Who:** Engineering team lead
- **Contact:** [Name: TBD, Phone: +XXX, Email: XXX]
- **When to Escalate:**
  - No response from Level 1 after 15 minutes
  - Incident not resolved within 30 minutes (SEV1)
  - Complex issue requiring architecture decisions
  - Multi-service outage

#### Level 3: CTO / VP Engineering
- **Who:** Chief Technology Officer
- **Contact:** [Name: TBD, Phone: +XXX, Email: XXX]
- **When to Escalate:**
  - Complete production outage lasting >1 hour
  - Data breach or security incident
  - Regulatory compliance issue
  - Major customer impact (>50% of users affected)

#### Level 4: CEO / Executive Team
- **Who:** Chief Executive Officer
- **Contact:** [Name: TBD, Phone: +XXX]
- **When to Escalate:**
  - Critical business impact (revenue loss >$X)
  - Public relations crisis
  - Legal or regulatory enforcement action
  - Customer data breach or loss

---

## Responsibilities

### Primary On-Call Engineer

#### Before Your Week
- [ ] Review and understand all runbooks in [ALERT_RUNBOOKS.md](./ALERT_RUNBOOKS.md)
- [ ] Test access to all monitoring tools (Prometheus, Grafana, AlertManager)
- [ ] Verify Slack notifications are working (send test alert)
- [ ] Ensure VPN access and production credentials are valid
- [ ] Review recent incidents and open issues
- [ ] Check calendar for any scheduled maintenance windows

#### During Your Week
- [ ] Keep phone and laptop charged and accessible at all times
- [ ] Respond to alerts within SLA timeframes
- [ ] Document all incidents in incident tracking system
- [ ] Update Slack channel with status updates every 30 minutes during active incidents
- [ ] Create Jira tickets for any bugs discovered
- [ ] Schedule post-incident reviews for SEV1/SEV2 incidents
- [ ] Monitor dashboards proactively (at least 2x per day)

#### After Your Week
- [ ] Complete handoff document with status of open issues
- [ ] Transfer any ongoing incidents to next on-call engineer
- [ ] Document any new issues or patterns observed
- [ ] Provide feedback on runbooks (what worked, what didn't)
- [ ] Submit time-off requests for compensation (if applicable)

### Backup On-Call Engineer

- **Availability:** Must be reachable within 15 minutes
- **Responsibilities:** Take over if primary is unavailable or needs help
- **Preparation:** Same as primary (review runbooks, test access)

---

## Handoff Procedures

### Weekly Handoff Meeting

**Time:** Every Monday at 9:00 AM  
**Duration:** 30 minutes  
**Attendees:** Outgoing on-call, Incoming on-call, Team Lead (optional)

### Handoff Checklist

#### Outgoing Engineer Shares:
- [ ] Summary of incidents handled during the week
  - Number of alerts: Critical (X), Warning (Y), Infrastructure (Z)
  - Number of incidents: SEV1 (X), SEV2 (Y), SEV3 (Z)
- [ ] Open issues and their current status
- [ ] Any degraded services or known issues
- [ ] Upcoming maintenance windows or deployments
- [ ] New alerts or monitoring changes
- [ ] Lessons learned or runbook improvements needed

#### Incoming Engineer Confirms:
- [ ] Access to all required tools (Prometheus, Grafana, Slack)
- [ ] Phone and laptop are ready
- [ ] Calendar is clear of conflicts (or backup arranged)
- [ ] Understanding of open issues
- [ ] Questions answered by outgoing engineer

### Handoff Document Template

```markdown
# On-Call Handoff - Week of [Date]

## Outgoing: [Engineer Name]
## Incoming: [Engineer Name]

### Incidents Summary
- Total Alerts: [X critical, Y warning, Z infrastructure]
- Total Incidents: [X SEV1, Y SEV2, Z SEV3]

### Open Issues
1. **Issue:** [Description]
   - **Status:** [In Progress / Monitoring / Escalated]
   - **Owner:** [Name]
   - **Next Steps:** [What needs to happen]

### Known Degradations
- [Service Name]: [Description of issue]

### Upcoming Events
- [Date/Time]: [Maintenance window / Deployment / Release]

### Runbook Updates Needed
- [Alert Name]: [What needs to be added/changed]

### Notes & Recommendations
- [Any special instructions or warnings]
```

---

## Tools & Resources

### Monitoring & Alerting
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3300 (admin/admin)
- **AlertManager:** http://localhost:9093
- **Runbooks:** [ALERT_RUNBOOKS.md](./ALERT_RUNBOOKS.md)

### Communication Channels
- **Primary:** Slack #alerts-critical (immediate response)
- **Secondary:** Slack #alerts-warnings (grouped notifications)
- **Infrastructure:** Slack #alerts-infrastructure (DB/cache/queue)
- **Team Channel:** Slack #engineering-team (coordination)
- **Incident Channel:** Slack #incidents (SEV1/SEV2 incidents)

### Incident Management
- **Incident Tracking:** [Jira / PagerDuty / Opsgenie]
- **Post-Mortem Template:** [Link to template]
- **Status Page:** [Link to status.nexo-crm.com]

### Access & Credentials
- **VPN:** [VPN connection instructions]
- **Bastion Host:** [SSH connection details]
- **Secrets Manager:** [1Password / Vault / AWS Secrets Manager]
- **Production Database:** [Connection details - read-only access]

### Contact Lists
- **Engineering Team:** [Google Sheet / Confluence page]
- **Support Team:** support@nexo-crm.com
- **Customer Success:** cs@nexo-crm.com

---

## Training Requirements

### Required Training for On-Call Engineers

#### 1. System Architecture (2 hours)
- [ ] Complete NEXO CRM architecture overview
- [ ] Understand service dependencies
- [ ] Review data flow diagrams
- [ ] Learn about failure modes and graceful degradation

#### 2. Monitoring & Alerting (2 hours)
- [ ] Prometheus query basics (PromQL)
- [ ] Grafana dashboard navigation
- [ ] AlertManager alert management
- [ ] Runbook walkthrough (all 26 alerts)

#### 3. Incident Response (1 hour)
- [ ] Incident classification (SEV levels)
- [ ] Escalation procedures
- [ ] Communication protocols
- [ ] Post-incident review process

#### 4. Common Scenarios (2 hours)
- [ ] Service down (restart procedures)
- [ ] High error rate (debugging techniques)
- [ ] Database issues (connection pools, slow queries)
- [ ] Cache failures (Redis recovery)
- [ ] Queue backlogs (RabbitMQ management)

#### 5. Hands-On Practice (2 hours)
- [ ] Send test alert via curl
- [ ] Silence an alert in AlertManager
- [ ] Query Prometheus for service health
- [ ] Navigate Grafana dashboards
- [ ] SSH to production server (if applicable)

### Certification
- **Requirement:** Pass on-call readiness quiz (20 questions, 80% passing score)
- **Renewal:** Annual refresher training
- **Documentation:** Certificate stored in personnel file

---

## Fire Drills

### Purpose
Regular fire drills ensure the team stays sharp and identifies gaps in runbooks, tools, or processes.

### Schedule
- **Frequency:** Monthly (first Friday of each month)
- **Duration:** 30-60 minutes
- **Time:** 2:00 PM (avoid critical business hours)
- **Facilitator:** Team Lead or DevOps Lead

### Fire Drill Scenarios

#### Scenario 1: Service Down (Easy)
- **Trigger:** Stop CRM service container
- **Expected Alert:** ServiceDown fires within 2 minutes
- **Expected Response:** On-call engineer restarts service within 5 minutes
- **Success Criteria:** Service recovers, alert resolves

#### Scenario 2: High Error Rate (Medium)
- **Trigger:** Inject 500 errors into logs
- **Expected Alert:** HighServerErrorRate fires within 5 minutes
- **Expected Response:** On-call engineers investigates logs, identifies root cause
- **Success Criteria:** Root cause identified, mitigation applied

#### Scenario 3: Database Connection Pool Exhausted (Hard)
- **Trigger:** Simulate connection leak or spike in traffic
- **Expected Alert:** DatabaseConnectionPoolHigh fires
- **Expected Response:** Engineer follows runbook, increases pool size or restarts service
- **Success Criteria:** Connections return to normal, no data loss

#### Scenario 4: Multi-Service Outage (Very Hard)
- **Trigger:** Stop PostgreSQL, Redis, and RabbitMQ simultaneously
- **Expected Alerts:** Multiple alerts fire (database, cache, queue)
- **Expected Response:** Engineer prioritizes database first, follows dependency order
- **Success Criteria:** All services recovered in correct order

### Fire Drill Checklist
- [ ] Schedule drill in calendar (notify team 1 week in advance)
- [ ] Prepare scenario and expected outcomes
- [ ] Notify on-call engineer (or keep as surprise for realism)
- [ ] Trigger scenario at scheduled time
- [ ] Observe response time and actions taken
- [ ] Stop drill and restore services
- [ ] Conduct 15-minute debrief
- [ ] Document lessons learned
- [ ] Update runbooks if gaps identified

---

## Incident Response Process

### Step 1: Alert Received (0-5 minutes)
1. **Acknowledge alert** in Slack or AlertManager
2. **Assess severity**:
   - Critical: Red alert, production down, immediate action
   - Warning: Yellow alert, degraded service, investigate
   - Infrastructure: Blue alert, resource threshold, monitor
3. **Declare incident** if SEV1 or SEV2 (post in #incidents channel)

### Step 2: Initial Triage (5-15 minutes)
1. **Identify affected service(s)**: Check alert labels and dashboard
2. **Determine impact**:
   - How many users affected?
   - What functionality is broken?
   - Is data at risk?
3. **Find relevant runbook**: ALERT_RUNBOOKS.md → search for alert name
4. **Gather context**:
   - Recent deployments or changes?
   - Similar incidents in the past?
   - Any maintenance windows?

### Step 3: Investigation & Diagnosis (15-30 minutes)
1. **Follow runbook** step by step
2. **Check metrics**:
   - Prometheus: Query relevant metrics
   - Grafana: View service dashboard
   - Logs: Check for errors or warnings
3. **Test hypotheses**:
   - Service health check
   - Database connectivity
   - External dependency status
4. **Update status** in #incidents channel every 15 minutes

### Step 4: Resolution (30-60 minutes)
1. **Apply fix**:
   - Restart service
   - Scale resources
   - Rollback deployment
   - Apply hotfix
2. **Verify resolution**:
   - Alert clears in AlertManager
   - Metrics return to normal
   - User reports confirm recovery
3. **Monitor for regression**: Watch for 15 minutes to ensure fix holds

### Step 5: Post-Incident (After Resolution)
1. **Resolve incident** in tracking system
2. **Update status page** (if customer-facing)
3. **Schedule post-mortem** (SEV1/SEV2 only):
   - Time: Within 48 hours
   - Attendees: On-call engineer, team lead, affected team members
   - Output: Post-mortem document with RCA and action items
4. **Update runbooks** if gaps were found
5. **Send incident summary** to stakeholders

---

## Post-Mortem Template

```markdown
# Incident Post-Mortem: [Alert Name]

**Date:** [YYYY-MM-DD]  
**Severity:** [SEV1 / SEV2]  
**Duration:** [XX minutes/hours]  
**On-Call Engineer:** [Name]  
**Facilitator:** [Name]

## Summary
[Brief description of what happened]

## Timeline
- **HH:MM** - Alert fired: [Alert name]
- **HH:MM** - Engineer acknowledged
- **HH:MM** - Root cause identified: [Description]
- **HH:MM** - Fix applied: [Description]
- **HH:MM** - Service recovered
- **HH:MM** - Alert resolved

## Impact
- **Users Affected:** [Number or percentage]
- **Services Affected:** [List of services]
- **Data Loss:** [Yes/No, details]
- **Revenue Impact:** [$X or N/A]

## Root Cause Analysis
[Detailed explanation of what caused the incident]

## Resolution
[What was done to fix the issue]

## What Went Well
- [Thing 1]
- [Thing 2]

## What Could Be Improved
- [Thing 1]
- [Thing 2]

## Action Items
1. **[Action]** - Owner: [Name], Due: [Date]
2. **[Action]** - Owner: [Name], Due: [Date]

## Runbook Updates
- [Alert Name]: [What needs to be added/updated]
```

---

## Feedback & Improvements

This on-call rotation guide is a living document. Please provide feedback to improve it:

- **Runbooks:** Submit PRs to update ALERT_RUNBOOKS.md
- **Process:** Suggest improvements in #engineering-team
- **Tools:** Request new monitoring or alerting features
- **Training:** Recommend additional training modules

**Last Review:** 2026-01-29  
**Next Review:** 2026-04-29 (Quarterly)  
**Owner:** DevOps Team Lead
