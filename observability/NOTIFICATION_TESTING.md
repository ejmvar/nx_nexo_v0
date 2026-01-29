# NEXO CRM - Notification Testing Guide

**Version:** 1.0  
**Last Updated:** 2026-01-29  
**Owner:** DevOps Team

---

## Prerequisites

Before testing notifications, ensure:

- ✅ Observability stack is running (`docker-compose.observability.yml`)
- ✅ AlertManager is up and healthy (http://localhost:9093)
- ✅ Slack workspace access (for creating webhooks)
- ✅ Email provider access (Gmail/SendGrid/Mailgun/AWS SES)

---

## Step 1: Configure Slack Webhooks

### 1.1 Create Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. **App Name:** `NEXO AlertManager`
4. **Workspace:** Select your workspace
5. Click **"Create App"**

### 1.2 Enable Incoming Webhooks

1. In left sidebar, click **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** to **ON**
3. Scroll down, click **"Add New Webhook to Workspace"**

### 1.3 Create Webhooks for Each Channel

**For Critical Alerts:**
1. Click **"Add New Webhook to Workspace"**
2. Select channel: `#alerts-critical` (create channel if doesn't exist)
3. Click **"Allow"**
4. **Copy the webhook URL** (starts with `https://hooks.slack.com/services/...`)
5. Paste into `.env` file as `SLACK_WEBHOOK_URL_CRITICAL`

**For Warning Alerts:**
1. Repeat above steps for `#alerts-warnings` channel
2. Paste webhook URL as `SLACK_WEBHOOK_URL_WARNINGS`

**For Infrastructure Alerts:**
1. Repeat above steps for `#alerts-infrastructure` channel
2. Paste webhook URL as `SLACK_WEBHOOK_URL_INFRASTRUCTURE`

### 1.4 Verify Slack Channels

Ensure these Slack channels exist:
- `#alerts-critical` - For SEV1/SEV2 incidents (red alerts 🚨)
- `#alerts-warnings` - For warnings and degradations (yellow ⚠️)
- `#alerts-infrastructure` - For DB/cache/queue alerts (blue 🔧)

---

## Step 2: Configure Email (SMTP)

### Option A: Gmail (Recommended for Testing)

**2.1 Enable App Passwords**

1. Go to https://myaccount.google.com/apppasswords
2. **Note:** You need 2-Factor Authentication enabled
3. Click **"Select app"** → Choose **"Mail"**
4. Click **"Select device"** → Choose **"Other"** → Enter **"NEXO AlertManager"**
5. Click **"Generate"**
6. **Copy the 16-character password** (remove spaces)

**2.2 Update .env File**

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # 16-char App Password (remove spaces)
ALERT_EMAIL_FROM=alerts@nexo-crm.com  # Can be any email, doesn't need to match SMTP_USER

# Email Recipients
ALERT_EMAIL_TO_CRITICAL=oncall@nexo-crm.com,your-personal-email@gmail.com
ALERT_EMAIL_TO_WARNINGS=team@nexo-crm.com,your-personal-email@gmail.com
ALERT_EMAIL_TO_INFRASTRUCTURE=devops@nexo-crm.com,your-personal-email@gmail.com
```

**Note:** For testing, add your personal Gmail to all recipient lists so you receive emails immediately.

---

### Option B: SendGrid (Recommended for Production)

**2.1 Create SendGrid Account**

1. Sign up at https://sendgrid.com/ (free tier: 100 emails/day)
2. Verify your email address
3. Complete sender authentication

**2.2 Create API Key**

1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. **Name:** `NEXO AlertManager`
4. **Permissions:** Select **"Restricted Access"** → Enable **"Mail Send"**
5. Click **"Create & View"**
6. **Copy the API key** (starts with `SG.`)

**2.3 Update .env File**

```bash
# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey  # Literally the string "apikey"
SMTP_PASSWORD=SG.your_sendgrid_api_key_here
ALERT_EMAIL_FROM=alerts@nexo-crm.com  # Must be verified sender

# Email Recipients
ALERT_EMAIL_TO_CRITICAL=oncall@nexo-crm.com
ALERT_EMAIL_TO_WARNINGS=team@nexo-crm.com
ALERT_EMAIL_TO_INFRASTRUCTURE=devops@nexo-crm.com
```

---

### Option C: Mailgun

**2.1 Create Mailgun Account**

1. Sign up at https://www.mailgun.com/ (free: 5,000 emails/month)
2. Verify your domain or use sandbox domain

**2.2 Get SMTP Credentials**

1. Go to **Sending** → **Domain Settings** → Your domain
2. Click **"SMTP"** tab
3. Copy **SMTP credentials**

**2.3 Update .env File**

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@sandbox-your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
ALERT_EMAIL_FROM=alerts@your-domain.mailgun.org
```

---

### Option D: AWS SES

**2.1 Set Up AWS SES**

1. Go to AWS Console → SES
2. Verify your domain or email address
3. Request production access (starts in sandbox mode)

**2.2 Create SMTP Credentials**

1. Go to **SMTP Settings**
2. Click **"Create My SMTP Credentials"**
3. Download credentials CSV

**2.3 Update .env File**

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Replace region
SMTP_PORT=587
SMTP_USER=your-aws-ses-smtp-username
SMTP_PASSWORD=your-aws-ses-smtp-password
ALERT_EMAIL_FROM=alerts@your-verified-domain.com
```

---

## Step 3: Update Environment File

**3.1 Edit .env File**

```bash
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend
nano observability/.env  # or use your preferred editor
```

**3.2 Fill in ALL Required Variables**

```bash
# ============================================
# Slack Webhooks (from Step 1)
# ============================================
SLACK_WEBHOOK_URL_CRITICAL=https://hooks.slack.com/services/T00000000/B00000000/xxxxxxxxxxxxxxxxxxxx
SLACK_WEBHOOK_URL_WARNINGS=https://hooks.slack.com/services/T00000000/B00000000/yyyyyyyyyyyyyyyyyyyy
SLACK_WEBHOOK_URL_INFRASTRUCTURE=https://hooks.slack.com/services/T00000000/B00000000/zzzzzzzzzzzzzzzzzzzz

# ============================================
# Email SMTP (choose one provider from Step 2)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ALERT_EMAIL_FROM=alerts@nexo-crm.com

# ============================================
# Email Recipients
# ============================================
ALERT_EMAIL_TO_CRITICAL=oncall@nexo-crm.com,your-test-email@gmail.com
ALERT_EMAIL_TO_WARNINGS=team@nexo-crm.com,your-test-email@gmail.com
ALERT_EMAIL_TO_INFRASTRUCTURE=devops@nexo-crm.com,your-test-email@gmail.com

# ============================================
# Grafana Credentials (optional)
# ============================================
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

**3.3 Save and Verify**

```bash
# Check that .env is NOT in git
git status  # Should NOT show observability/.env

# Verify .env is in .gitignore
grep -r "observability/.env" .gitignore
```

---

## Step 4: Restart AlertManager

**4.1 Restart Service to Load New Environment Variables**

```bash
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend

# Method 1: Restart only AlertManager (faster)
unset DOCKER_HOST && docker compose -f docker/docker-compose.observability.yml restart alertmanager

# Method 2: Restart entire observability stack (if needed)
# unset DOCKER_HOST && docker compose -f docker/docker-compose.observability.yml down
# unset DOCKER_HOST && docker compose -f docker/docker-compose.observability.yml up -d
```

**4.2 Check Logs for Errors**

```bash
unset DOCKER_HOST && docker logs nexo-alertmanager --tail 50
```

**Expected output:**
```
level=info ts=2026-01-29T08:00:00.000Z caller=main.go:219 msg="Starting Alertmanager"
level=info ts=2026-01-29T08:00:00.100Z caller=cluster.go:161 msg="Completed loading of configuration file" file=/etc/alertmanager/alertmanager.yml
level=info ts=2026-01-29T08:00:00.200Z caller=main.go:519 msg="Listening" address=:9093
```

**4.3 Verify AlertManager is Healthy**

```bash
curl -s http://localhost:9093/-/healthy
# Expected: Healthy
```

**4.4 Check Configuration in UI**

Open http://localhost:9093 in browser:
- Should show AlertManager web UI
- No configuration errors should be displayed

---

## Step 5: Send Test Alert

### 5.1 Send Simple Test Alert (Warning Severity)

```bash
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[
    {
      "labels": {
        "alertname": "TestAlert",
        "service": "test-service",
        "severity": "warning"
      },
      "annotations": {
        "summary": "This is a test alert",
        "description": "Testing notification channels for NEXO CRM monitoring. If you receive this, notifications are working correctly!",
        "runbook": "http://localhost:9090/alerts",
        "dashboard": "http://localhost:3300/d/nexo-overview"
      }
    }
  ]'
```

**Expected Response:**
```json
{"status":"success"}
```

### 5.2 Verify Alert in AlertManager

1. Open http://localhost:9093
2. Should see new alert: **TestAlert**
3. Status: **Active** (firing)

### 5.3 Verify Slack Notification

**Check #alerts-warnings channel:**

Expected message:
```
⚠️ WARNING ALERT: TestAlert

Alert: TestAlert
Service: test-service
Severity: warning
Status: FIRING

Description:
Testing notification channels for NEXO CRM monitoring. If you receive this, notifications are working correctly!

Runbook: http://localhost:9090/alerts
Dashboard: http://localhost:3300/d/nexo-overview
```

**Message should have:**
- Yellow/orange color bar on left
- Warning emoji (⚠️)
- Alert details formatted nicely
- Clickable links

### 5.4 Verify Email Notification

**Check your email inbox:**

Expected email:
- **From:** alerts@nexo-crm.com (or your ALERT_EMAIL_FROM)
- **To:** team@nexo-crm.com, your-test-email@gmail.com
- **Subject:** ⚠️ WARNING: TestAlert - test-service

**Email body should have:**
- Yellow alert box with warning styling
- Alert details (name, service, severity, status)
- Description
- Links to runbook and dashboard
- Professional HTML formatting

---

## Step 6: Test Critical Alert

### 6.1 Send Critical Severity Test Alert

```bash
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[
    {
      "labels": {
        "alertname": "CriticalTestAlert",
        "service": "crm-service",
        "severity": "critical"
      },
      "annotations": {
        "summary": "CRITICAL: Service outage detected",
        "description": "This is a critical test alert. In production, this would indicate a service outage requiring immediate attention.",
        "runbook": "http://localhost:9090/alerts",
        "dashboard": "http://localhost:3300/d/nexo-overview"
      }
    }
  ]'
```

### 6.2 Verify Critical Alert Notifications

**Slack (#alerts-critical channel):**
- Should see **red danger** alert with 🚨 rotating light emoji
- Should say "CRITICAL ALERT: CriticalTestAlert"
- Color bar should be **RED**

**Email:**
- Should arrive at `oncall@nexo-crm.com` + your test email
- Subject: **🚨 CRITICAL: CriticalTestAlert - crm-service**
- Alert box should have **red background** and red border

---

## Step 7: Test Alert Resolution

### 7.1 Wait for Alerts to Auto-Resolve

- Test alerts will **auto-resolve after 5 minutes** (default `resolve_timeout`)
- AlertManager will send **resolved notifications** to Slack and Email

### 7.2 Verify Resolved Notifications

**Slack (both channels):**
- Should see follow-up message: "✅ RESOLVED: TestAlert"
- Color bar should be **GREEN** (good)
- Status should say "RESOLVED"

**Email:**
- Should receive resolved notification email
- Subject: "✅ RESOLVED: TestAlert - test-service"
- Alert box should have green styling

---

## Step 8: Test Production Alerts

### 8.1 Test ServiceDown Alert

**Trigger the alert by stopping a service:**

```bash
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend

# Stop CRM service
unset DOCKER_HOST && docker compose -f docker/docker-compose.yml stop nexo-crm-service
```

**Expected within 1-2 minutes:**
- Prometheus detects service is down (`up{job="nexo-crm-service"} == 0`)
- **ServiceDown** alert fires
- Notification arrives in **#alerts-critical** (Slack)
- Email arrives at **oncall@nexo-crm.com**

**Verify runbook link:**
- Click "View Runbook" link in notification
- Should open to **ServiceDown** section in ALERT_RUNBOOKS.md
- Follow the runbook to resolve the issue

**Resolve the alert:**

```bash
# Restart CRM service
unset DOCKER_HOST && docker compose -f docker/docker-compose.yml start nexo-crm-service
```

**Expected within 1-2 minutes:**
- Service comes back up
- Alert clears in Prometheus
- **Resolved notification** arrives in Slack and Email

---

### 8.2 Test HighServerErrorRate Alert

**Use the automated test script:**

```bash
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend

# Run high error rate test
./observability/scripts/test-alerts.sh high-error-rate
```

**Script will:**
1. Generate 100 5xx errors
2. Wait for alert to fire (within 5 minutes)
3. Send successful requests to clear errors
4. Wait for alert to resolve

**Verify notifications:**
- Alert arrives in **#alerts-critical** (Slack)
- Email arrives at **oncall@nexo-crm.com**
- Runbook link points to **HighServerErrorRate** section
- Resolved notification arrives after errors clear

---

### 8.3 Test Infrastructure Alert

**Trigger DatabaseConnectionPoolHigh:**

```bash
# This requires manual simulation (if connection pool metrics are exposed)
# For now, you can trigger via AlertManager API:

curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[
    {
      "labels": {
        "alertname": "DatabaseConnectionPoolHigh",
        "service": "nexo-crm-service",
        "severity": "warning"
      },
      "annotations": {
        "summary": "Database connection pool usage is high",
        "description": "Connection pool usage is at 85%, indicating high database load.",
        "runbook": "http://localhost:9090/alerts",
        "dashboard": "http://localhost:3300/d/nexo-database-metrics"
      }
    }
  ]'
```

**Verify:**
- Notification arrives in **#alerts-infrastructure** (Slack)
- Icon should be 🔧 (wrench)
- Email arrives at **devops@nexo-crm.com**

---

## Step 9: Verify Notification Features

### Checklist: Slack Notifications

- [ ] **Critical alerts** appear in `#alerts-critical` with red color
- [ ] **Warning alerts** appear in `#alerts-warnings` with yellow color
- [ ] **Infrastructure alerts** appear in `#alerts-infrastructure` with blue icon
- [ ] Emojis appear correctly (🚨 for critical, ⚠️ for warning, 🔧 for infrastructure)
- [ ] Username shows as "NEXO AlertManager"
- [ ] All fields are populated (Alert, Service, Severity, Status, Description)
- [ ] Runbook link is clickable and works
- [ ] Dashboard link is clickable and works
- [ ] Resolved notifications arrive with green color

### Checklist: Email Notifications

- [ ] Emails arrive at correct recipient addresses
- [ ] **From** address is correct (ALERT_EMAIL_FROM)
- [ ] **Subject** line includes emoji and alert name
- [ ] HTML formatting appears correct (alert boxes, colors)
- [ ] **Critical** alerts have red alert box
- [ ] **Warning** alerts have yellow alert box
- [ ] All alert info is displayed (alert, service, severity, status, description)
- [ ] Links work (runbook, dashboard, AlertManager UI)
- [ ] Resolved notifications arrive with correct styling

---

## Step 10: Test Alert Silence (Optional)

### 10.1 Create Alert Silence

**Use Case:** Planned maintenance window, want to suppress alerts temporarily

1. Open http://localhost:9093
2. Click **"Silences"** tab
3. Click **"New Silence"**
4. Fill in:
   - **Matchers:** `alertname="TestAlert"` or `service="crm-service"`
   - **Duration:** 1 hour (default)
   - **Creator:** Your name
   - **Comment:** "Planned maintenance - service restart"
5. Click **"Create"**

### 10.2 Send Test Alert (Should Be Silenced)

```bash
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[
    {
      "labels": {
        "alertname": "TestAlert",
        "service": "test-service",
        "severity": "warning"
      },
      "annotations": {
        "summary": "This alert should be silenced",
        "description": "Testing silence feature"
      }
    }
  ]'
```

### 10.3 Verify Alert is Silenced

1. Alert should appear in AlertManager UI
2. Alert should show **"Silenced"** badge
3. **No notification** should be sent to Slack or Email

### 10.4 Remove Silence

1. Go back to **"Silences"** tab
2. Click **"Expire"** next to the silence
3. Send test alert again → Should now trigger notifications

---

## Troubleshooting

### Issue: No Slack Notifications

**Possible Causes:**

1. **Webhook URL incorrect**
   - Verify URL starts with `https://hooks.slack.com/services/`
   - Check for typos or missing characters
   - Test webhook directly:
     ```bash
     curl -X POST $SLACK_WEBHOOK_URL_CRITICAL \
       -H 'Content-Type: application/json' \
       -d '{"text": "Test message"}'
     ```

2. **Environment variables not loaded**
   - Check AlertManager logs: `docker logs nexo-alertmanager`
   - Verify env_file is configured in docker-compose.observability.yml
   - Restart AlertManager after .env changes

3. **Slack app permissions**
   - Verify Slack app has `chat:write` scope
   - Check if app is removed from channel (re-add if needed)

4. **AlertManager routing issue**
   - Check alert labels match route matchers
   - View routes in AlertManager UI: http://localhost:9093/#/status

---

### Issue: No Email Notifications

**Possible Causes:**

1. **SMTP credentials incorrect**
   - For Gmail: Ensure 2FA is enabled and App Password is generated
   - For SendGrid: Verify API key has "Mail Send" permission
   - Test SMTP manually:
     ```bash
     # Using swaks tool
     swaks --to your-test-email@gmail.com \
       --from alerts@nexo-crm.com \
       --server smtp.gmail.com:587 \
       --auth LOGIN \
       --auth-user your-email@gmail.com \
       --auth-password "your-app-password" \
       --tls
     ```

2. **Email blocked by provider**
   - Check spam/junk folder
   - Gmail: Check "Less secure apps" setting (should allow with App Password)
   - SendGrid: Verify sender email is authenticated

3. **SMTP port blocked**
   - Port 587: TLS/STARTTLS (recommended)
   - Port 465: SSL (alternative)
   - Some networks block port 25 (don't use)

4. **Environment variable not expanded**
   - Check AlertManager logs for error messages
   - Verify `.env` file has no quotes around values (unless value contains spaces)

---

### Issue: AlertManager Not Starting

**Check logs:**

```bash
unset DOCKER_HOST && docker logs nexo-alertmanager --tail 100
```

**Common Errors:**

1. **"Failed to load configuration"**
   - YAML syntax error in alertmanager.yml
   - Run: `yamllint observability/alertmanager/alertmanager.yml`

2. **"Cannot connect to SMTP server"**
   - SMTP credentials incorrect or server unreachable
   - SMTP port blocked by firewall
   - Try without TLS first (for testing): `require_tls: false`

3. **"Unknown field in config"**
   - AlertManager version incompatible with config
   - Check supported fields: https://prometheus.io/docs/alerting/latest/configuration/

---

### Issue: Alert Fires But No Notification

**Debugging Steps:**

1. **Check alert is firing in Prometheus**
   - Open http://localhost:9090/alerts
   - Find alert, verify state is **FIRING**

2. **Check alert is received by AlertManager**
   - Open http://localhost:9093
   - Should see alert listed under **Alerts** tab

3. **Check alert is not silenced**
   - Look for **"Silenced"** badge on alert
   - Check **"Silences"** tab for active silences

4. **Check routing rules**
   - Go to http://localhost:9093/#/status
   - Verify alert labels match route matchers
   - Check which receiver alert is routed to

5. **Check AlertManager logs**
   - Look for sent notification messages
   ```bash
   unset DOCKER_HOST && docker logs nexo-alertmanager | grep -i "notify"
   ```

---

## Success Criteria

After completing all steps, you should have:

- ✅ Slack webhooks configured for 3 channels
- ✅ Email SMTP configured (Gmail/SendGrid/Mailgun/AWS SES)
- ✅ AlertManager restarted with new configuration
- ✅ Test alerts sent successfully
- ✅ Slack notifications received with correct formatting
- ✅ Email notifications received with HTML styling
- ✅ Critical alerts appear in #alerts-critical (red) with email to oncall@
- ✅ Warning alerts appear in #alerts-warnings (yellow) with email to team@
- ✅ Infrastructure alerts appear in #alerts-infrastructure (blue) with email to devops@
- ✅ Resolved notifications received when alerts clear
- ✅ Production alerts tested (ServiceDown, HighErrorRate)
- ✅ Runbook links work from notifications
- ✅ Dashboard links work from notifications

---

## Next Steps

After notifications are working:

1. **Run Full Alert Test Suite**
   ```bash
   ./observability/scripts/test-alerts.sh service-down
   ./observability/scripts/test-alerts.sh high-error-rate
   ```

2. **Set Up On-Call Rotation**
   - Read [ON_CALL_ROTATION.md](./ON_CALL_ROTATION.md)
   - Assign team members to rotation
   - Schedule weekly handoff meetings

3. **Begin Alert Tuning**
   - Read [ALERT_TUNING.md](./ALERT_TUNING.md)
   - Observe alert frequency for 1-2 weeks
   - Calculate false positive rates
   - Tune thresholds to reduce noise

4. **Production Deployment**
   - Replace .env test credentials with production credentials
   - Update email recipients to team distribution lists
   - Configure PagerDuty integration (optional)
   - Set up status page (optional)

---

**Need Help?** Review [ALERT_RUNBOOKS.md](./ALERT_RUNBOOKS.md) for detailed alert response procedures.
