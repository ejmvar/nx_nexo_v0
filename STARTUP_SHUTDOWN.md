# NEXO CRM - Robust Startup & Shutdown System

## 🎯 Overview

This system provides **robust, reliable startup and shutdown** for all environments:
- ✅ **TEST**: Fast startup, clean state between tests
- ✅ **DEV**: Hot reload, preserve state for development
- ✅ **QA**: Production-like setup with monitoring
- ✅ **PROD**: Graceful shutdown, zero-downtime deployments

## 🚀 Quick Start

### Start System
```bash
# Development environment (default)
mise run startup

# Specific environment
mise run startup-dev    # Development
mise run startup-test   # Testing
mise run startup-qa     # QA/Staging
```

### Stop System
```bash
# Graceful shutdown (keep database)
mise run shutdown

# Force shutdown (ignore errors)
mise run shutdown-force

# Complete shutdown (stop database too)
mise run shutdown-clean
```

### Check Health
```bash
# Quick health check
mise run health

# View status
mise run status

# Full system status
mise run health-full
```

### Restart
```bash
# Restart services (keep database)
mise run restart

# Clean restart (reset everything)
mise run restart-clean
```

## 📋 Features

### ✅ Startup (`scripts/startup.sh`)

**What it does**:
1. **Prerequisites Check**
   - Verifies Node.js, pnpm, Docker installed
   - Checks database connectivity
   - Validates environment configuration

2. **Port Cleanup**
   - Kills processes on ports 3000, 3001, 3003
   - Ensures clean state before startup
   - Handles orphaned processes

3. **Service Startup (in order)**
   - Database (PostgreSQL, Redis)
   - Backend services (auth, CRM)
   - API Gateway
   - Frontend

4. **Health Checks**
   - Waits for each service to be ready
   - Retries with exponential backoff
   - Verifies endpoints return 200 OK

5. **Logging**
   - All output logged to `tmp/logs/startup-*.log`
   - PID files saved for each service
   - Success marker created

**Features**:
- ⏱️ **Timeout handling**: Max 60s per service
- 🔄 **Retry logic**: 30 retries with 2s interval
- 📊 **Response time tracking**: Logs startup duration
- 🚨 **Error recovery**: Graceful failure with cleanup
- 📝 **Detailed logging**: Every step recorded

### ✅ Shutdown (`scripts/shutdown.sh`)

**What it does**:
1. **Graceful Shutdown**
   - Sends SIGTERM to all services
   - Waits 10s for graceful exit
   - Force kills if timeout exceeded

2. **Service Order** (reverse of startup)
   - Frontend (user-facing, stop first)
   - API Gateway
   - Backend services (CRM, auth)
   - Database (optional, preserve data)

3. **Resource Cleanup**
   - Removes PID files
   - Cleans up success markers
   - Kills orphaned processes
   - Frees all ports

4. **Verification**
   - Checks all ports are free
   - Verifies no processes remain
   - Logs any cleanup issues

**Features**:
- ⏱️ **Graceful timeout**: 10s before force kill
- 🔍 **Verification**: Ensures complete shutdown
- 🧹 **Cleanup**: Removes all traces
- 📊 **Port scanning**: Detects orphaned processes
- 📝 **Logging**: All actions recorded

### ✅ Health Check (`scripts/health-check.sh`)

**What it does**:
1. **Service Health**
   - Tests HTTP endpoints
   - Measures response time
   - Reports status with color codes

2. **Database Connectivity**
   - PostgreSQL port check
   - Redis port check

3. **Summary Report**
   - Total services healthy/unhealthy
   - Response times
   - Exit code (0 = healthy, 1 = unhealthy)

**Features**:
- ⚡ **Fast**: Tests all services in parallel
- 📊 **Response times**: Millisecond precision
- 🎨 **Color output**: Green = OK, Red = Failed
- 🔄 **Exit codes**: Perfect for CI/CD

## 🛠️ Usage Examples

### Development Workflow

```bash
# Morning: Start development
mise run startup-dev

# Work on code (services auto-reload)
# ...

# Lunch: Stop services
mise run shutdown

# Afternoon: Resume work
mise run startup-dev

# Evening: Complete shutdown
mise run shutdown-clean
```

### Testing Workflow

```bash
# Start test environment
mise run startup-test

# Run E2E tests
mise run test-file-upload-ui-headed

# Test complete, shutdown
mise run shutdown

# Run again with clean state
mise run restart-clean
mise run test-file-upload-ui
```

### Production Deployment

```bash
# Pre-deployment health check
mise run health
# → Ensure all services healthy

# Graceful restart (zero downtime)
mise run restart
# → Services restarted one by one

# Post-deployment verification
mise run health
mise run status
```

### Troubleshooting

```bash
# Services won't start?
mise run shutdown-force  # Force kill everything
mise run startup         # Try again

# Port conflicts?
mise run shutdown-clean  # Kill all + cleanup
lsof -ti:3000,3001,3003  # Check ports manually
mise run startup         # Restart

# Check logs
mise run logs-startup    # View startup logs
mise run logs-shutdown   # View shutdown logs
tail -f tmp/logs/*.log   # Watch all logs
```

## 📂 File Locations

### Scripts
- `scripts/startup.sh` - Main startup script
- `scripts/shutdown.sh` - Main shutdown script
- `scripts/health-check.sh` - Health check script

### Logs
- `tmp/logs/startup-*.log` - Startup logs (timestamped)
- `tmp/logs/shutdown-*.log` - Shutdown logs (timestamped)
- `tmp/logs/auth-service.log` - Auth service output
- `tmp/logs/crm-service.log` - CRM service output
- `tmp/logs/frontend.log` - Frontend output

### PID Files
- `tmp/logs/auth-service.pid` - Auth service PID
- `tmp/logs/crm-service.pid` - CRM service PID
- `tmp/logs/frontend.pid` - Frontend PID

### State Files
- `tmp/logs/.startup-success` - Marker for successful startup

## 🔧 Configuration

### Environment Variables

```bash
# Set environment
export NEXO_ENV=dev  # or test, qa, prod

# Database connection
export DATABASE_URL="postgresql://user:pass@localhost:5432/nexo"

# Service ports (auto-detected)
export AUTH_PORT=3001
export CRM_PORT=3003
export FRONTEND_PORT=3000
```

### Timeouts

Edit in script files:
```bash
# startup.sh
MAX_RETRIES=30           # Health check retries
RETRY_INTERVAL=2         # Seconds between retries

# shutdown.sh
GRACEFUL_TIMEOUT=10      # Graceful shutdown timeout
FORCE_TIMEOUT=5          # Force kill timeout
```

## 📊 Health Check Output

```bash
$ mise run health

============================================================================
NEXO CRM - Health Check
2026-02-07 23:45:30
============================================================================

Services:
✓ Auth Service (156ms)
✓ CRM Service (142ms)
✓ API Gateway (98ms)
✓ Frontend (234ms)

Databases:
✓ PostgreSQL (port 5432)
✓ Redis (port 6379)

============================================================================
✓ All services healthy
```

## 🎯 Exit Codes

### Startup Script
- `0` - Success, all services started
- `1` - Prerequisites check failed
- `2` - Port cleanup failed
- `3` - Database startup failed
- `4` - Backend services failed
- `5` - Frontend startup failed
- `6` - System verification failed

### Shutdown Script
- `0` - Success, all services stopped
- `1` - Shutdown verification failed
- `2` - Force shutdown required

### Health Check
- `0` - All services healthy
- `1` - One or more services unhealthy

## 🐛 Common Issues

### Issue: Services won't start

**Symptom**: `startup.sh` fails with timeout errors

**Solution**:
```bash
# 1. Force cleanup
mise run shutdown-force

# 2. Check ports manually
lsof -ti:3000,3001,3003,5432
# Kill any processes: kill -9 <PID>

# 3. Restart
mise run startup
```

### Issue: Shutdown hangs

**Symptom**: `shutdown.sh` takes too long

**Solution**:
```bash
# Use force shutdown
mise run shutdown-force

# Or clean everything
mise run shutdown-clean
```

### Issue: Port conflicts

**Symptom**: "Port already in use" errors

**Solution**:
```bash
# Check what's using the port
lsof -ti:3001

# Kill the process
kill -9 <PID>

# Or let startup script handle it
mise run startup  # Auto-cleanup enabled
```

### Issue: Database connection fails

**Symptom**: "Database not accessible" errors

**Solution**:
```bash
# Start database manually
docker compose -f docker/docker-compose.yml up -d postgres

# Wait for it to be ready
sleep 10

# Then start services
mise run startup
```

## 🎓 Best Practices

### 1. Always Use Startup/Shutdown Scripts

❌ **DON'T**:
```bash
# Manual start (error-prone)
cd nexo-prj
pnpm nx serve auth-service &
pnpm nx serve crm-service &
pnpm nx serve nexo-prj &

# Hope nothing went wrong...
```

✅ **DO**:
```bash
# Robust startup
mise run startup

# Automatic health checks + logging
```

### 2. Check Health Before Testing

```bash
# Always verify system is ready
mise run health

# Then run tests
mise run test-file-upload-ui
```

### 3. Clean Shutdown Between Tests

```bash
# Run test
mise run test-e2e

# Clean shutdown
mise run shutdown

# Clean startup for next test
mise run startup-test
```

### 4. Use Environment-Specific Commands

```bash
# Development
NEXO_ENV=dev mise run startup

# Testing (faster, cleaner)
NEXO_ENV=test mise run startup

# Production (external database)
NEXO_ENV=prod mise run startup
```

### 5. Monitor Logs

```bash
# Watch startup in real-time
tail -f tmp/logs/startup-*.log

# Check for errors
grep ERROR tmp/logs/startup-*.log
```

## 🔄 Integration with CI/CD

### GitHub Actions Example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup
        run: |
          mise install
          mise run test-install
      
      - name: Start Services
        run: |
          NEXO_ENV=test mise run startup
      
      - name: Health Check
        run: |
          mise run health
      
      - name: Run Tests
        run: |
          mise run test-e2e
      
      - name: Shutdown
        if: always()
        run: |
          mise run shutdown-force
      
      - name: Upload Logs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: logs
          path: tmp/logs/
```

## 📚 Related Documentation

- [Development Setup](SETUP_ENVIRONMENT_for_TEST_or_WORK.md)
- [Testing Guide](nexo-prj/e2e-tests/README.md)
- [Architecture](ARCHITECTURE.md)
- [Feature Status](FEATURE_STATUS_LIST.md)

## 🎉 Summary

**With this system, you get**:
- ✅ **Reliable startup**: Prerequisites check, port cleanup, health verification
- ✅ **Graceful shutdown**: SIGTERM first, force kill if needed
- ✅ **Health monitoring**: Quick status checks with response times
- ✅ **Detailed logging**: Every step recorded for debugging
- ✅ **Environment support**: TEST, DEV, QA, PROD configurations
- ✅ **Error recovery**: Automatic cleanup and retry logic
- ✅ **Zero manual intervention**: One command to start/stop everything

**No more**:
- ❌ Port conflicts
- ❌ Orphaned processes
- ❌ Manual service management
- ❌ "It works on my machine"
- ❌ Guessing if services are ready

**Start using it now**:
```bash
mise run startup    # That's it!
```
