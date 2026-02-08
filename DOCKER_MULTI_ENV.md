# Multi-Environment Docker Setup

**Phase 9: Docker Infrastructure for Parallel Testing**

## Table of Contents

1. [Overview](#overview)
2. [Port Allocation Strategy](#port-allocation-strategy)
3. [Quick Start](#quick-start)
4. [Environment Details](#environment-details)
5. [Usage Examples](#usage-examples)
6. [Service URLs](#service-urls)
7. [Health Checks](#health-checks)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

This project supports **5 isolated development environments** that can run simultaneously:

| Environment | Ports | Purpose | Files |
|-------------|-------|---------|-------|
| **Local NX** | 3xxx | Local development (hot-reload) | `pnpm nx serve` |
| **Docker DEV** | 4xxx | Dockerized development | `docker-compose.dev.yml` |
| **Docker TEST** | 5xxx | Automated testing, CI/CD | `docker-compose.test.yml` |
| **Docker QA** | 6xxx | Pre-production, UAT | `docker-compose.qa.yml` |
| **Docker PROD** | 7xxx | Production simulation | `docker-compose.prod.yml` |

### Key Benefits

✅ **Parallel Execution**: Run all environments simultaneously  
✅ **Complete Isolation**: Separate networks, volumes, containers  
✅ **Environment Parity**: Test against production-like configs  
✅ **CI/CD Ready**: Fast TEST environment for pipelines  
✅ **No Conflicts**: Different ports prevent interference  

---

## Port Allocation Strategy

### Complete Port Mapping

| Service | Local NX | Docker DEV | Docker TEST | Docker QA | Docker PROD |
|---------|----------|------------|-------------|-----------|-------------|
| **Frontend** | 3000 | 4000 | 5000 | 6000 | 7000 |
| **Auth Service** | 3001 | 4001 | 5001 | 6001 | 7001 |
| **API Gateway** | 3002 | 4002 | 5002 | 6002 | 7002 |
| **CRM Service** | 3003 | 4003 | 5003 | 6003 | 7003 |
| **PostgreSQL** | 5432 | 4432 | 5432 | 6432 | 7432 |
| **Redis** | 6379 | 4379 | 5379 | 6379 | 7379 |

### Why This Strategy?

- **Local NX (3xxx)**: Preserved for daily development with hot-reload
- **Docker DEV (4xxx)**: Isolated containerized development
- **Docker TEST (5xxx)**: CI/CD and automated testing
- **Docker QA (6xxx)**: Pre-production testing and UAT
- **Docker PROD (7xxx)**: Production simulation for final validation

---

## Quick Start

### 1. Start a Single Environment

```bash
# Start Docker DEV environment (ports 4xxx)
mise run docker-dev:up

# Wait for services to be ready (30-60 seconds)
mise run docker-dev:health

# View logs
mise run docker-dev:logs

# Access the app
open http://localhost:4000
```

### 2. Start Multiple Environments

```bash
# Start DEV and TEST in parallel
mise run docker-dev:up
mise run docker-test:up

# Start ALL environments at once
mise run docker-all:up

# Check health of all
mise run docker-all:health
```

### 3. Stop Environments

```bash
# Stop single environment
mise run docker-dev:down

# Stop all environments
mise run docker-all:down

# Clean (remove volumes)
mise run docker-dev:clean
```

---

## Environment Details

### 🔵 DEV Environment (Port 4xxx)

**Purpose**: Dockerized development with full debugging

**Configuration**:
```yaml
NODE_ENV: development
LOG_LEVEL: debug
Restart: unless-stopped
Resource Limits: None (use all available)
Health Checks: 30s intervals
```

**When to use**:
- Debugging containerized services
- Testing Docker configurations
- Developing with full logging

**Start**:
```bash
mise run docker-dev:up
mise run docker-dev:logs
```

**Access**:
- Frontend: http://localhost:4000
- Auth API: http://localhost:4001/api/auth
- CRM API: http://localhost:4003/api
- Gateway: http://localhost:4002/api

---

### 🟢 TEST Environment (Port 5xxx)

**Purpose**: Fast startup for CI/CD and automated testing

**Configuration**:
```yaml
NODE_ENV: test
LOG_LEVEL: warn
Restart: none (ephemeral)
Health Checks: Fast (5-10s intervals, 10 retries)
Redis: No persistence (--save "")
```

**When to use**:
- Running end-to-end tests
- CI/CD pipelines
- Quick validation checks

**Start**:
```bash
mise run docker-test:up

# Wait for readiness
sleep 30

# Run tests against TEST environment
cd nexo-prj
NEXT_PUBLIC_API_URL=http://localhost:5002 pnpm nx e2e nexo-prj
```

**Access**:
- Frontend: http://localhost:5000
- Auth API: http://localhost:5001/api/auth
- CRM API: http://localhost:5003/api
- Gateway: http://localhost:5002/api

---

### 🟡 QA Environment (Port 6xxx)

**Purpose**: Pre-production testing and UAT

**Configuration**:
```yaml
NODE_ENV: staging
LOG_LEVEL: info
Restart: unless-stopped
Resource Limits: CPU 0.5-2 cores, Memory 512M-2G
Backups: ./backups/qa
Monitoring: ENABLE_METRICS=true, SENTRY_DSN
Log Rotation: max 10m, 3 files
```

**Features**:
- Production-like configuration
- Resource limits enforced
- Backup volumes enabled
- Monitoring and metrics
- Performance testing ready

**When to use**:
- User acceptance testing (UAT)
- Integration testing
- Performance testing
- Client demos

**Start**:
```bash
mise run docker-qa:up
mise run docker-qa:logs

# Check health
mise run docker-qa:health
```

**Access**:
- Frontend: http://localhost:6000
- Auth API: http://localhost:6001/api/auth
- CRM API: http://localhost:6003/api
- Gateway: http://localhost:6002/api

---

### 🔴 PROD Environment (Port 7xxx)

**Purpose**: Local production simulation

**Configuration**:
```yaml
NODE_ENV: production
LOG_LEVEL: warn
Restart: always
Resource Limits: CPU 1-4 cores, Memory 1G-4G
PostgreSQL Tuning: max_connections=200, shared_buffers=256MB
Security: Password-protected Redis, SSL PostgreSQL, Secrets
Monitoring: Full (metrics, tracing, Sentry)
Rate Limiting: Enabled
Log Rotation: max 10m, 5 files, compressed
```

**Features**:
- Production-grade configuration
- PostgreSQL performance tuning
- Security hardening (passwords, SSL)
- Full monitoring and tracing
- Rate limiting on API Gateway
- Log compression

**When to use**:
- Final validation before deployment
- Production issue reproduction
- Performance benchmarking
- Load testing preparation

**⚠️ WARNING**: This is for LOCAL production simulation only. For real production, use Kubernetes/ECS/similar orchestration.

**Start**:
```bash
# Create .env file with secrets
cp docker/.env.prod.example docker/.env.prod
nano docker/.env.prod  # Set POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET

# Start PROD environment
mise run docker-prod:up
mise run docker-prod:logs

# Check health
mise run docker-prod:health
```

**Access**:
- Frontend: http://localhost:7000
- Auth API: http://localhost:7001/api/auth
- CRM API: http://localhost:7003/api
- Gateway: http://localhost:7002/api

---

## Usage Examples

### Example 1: Daily Development Workflow

```bash
# Morning: Start local NX dev (hot-reload)
mise run startup

# Work on feature...

# Test changes in DEV environment (containerized)
mise run docker-dev:up
mise run docker-dev:health

# Compare local vs containerized
# Local:  http://localhost:3000
# Docker: http://localhost:4000

# Shutdown at end of day
mise run shutdown
mise run docker-dev:down
```

### Example 2: Running Tests Against Multiple Environments

```bash
# Start TEST and QA environments
mise run docker-test:up
mise run docker-qa:up

# Wait for readiness
sleep 30

# Run tests against TEST (fast, ephemeral)
cd nexo-prj
NEXT_PUBLIC_API_URL=http://localhost:5002 pnpm nx e2e nexo-prj

# Run tests against QA (production-like)
NEXT_PUBLIC_API_URL=http://localhost:6002 pnpm nx e2e nexo-prj

# Cleanup
mise run docker-test:down
mise run docker-qa:down
```

### Example 3: Parallel Environment Testing

```bash
# Start all Docker environments
mise run docker-all:up

# Wait for all to be ready
sleep 60

# Check health of all environments
mise run docker-all:health

# Test against all environments in parallel
parallel -j4 ::: \
  "curl http://localhost:4000" \
  "curl http://localhost:5000" \
  "curl http://localhost:6000" \
  "curl http://localhost:7000"

# View status of all
mise run docker-all:ps

# Stop all
mise run docker-all:down
```

### Example 4: CI/CD Pipeline Simulation

```bash
# Clean state
mise run docker-test:clean

# Start TEST environment
mise run docker-test:up

# Wait for readiness
sleep 30

# Run full test suite
cd nexo-prj
NEXT_PUBLIC_API_URL=http://localhost:5002 pnpm nx run-many --target=test --all

# Run E2E tests
NEXT_PUBLIC_API_URL=http://localhost:5002 pnpm nx e2e nexo-prj

# Teardown
mise run docker-test:down
```

### Example 5: Load Testing QA Environment

```bash
# Start QA environment
mise run docker-qa:up

# Wait for readiness
sleep 60

# Run load tests
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:6002/api/health

# Using k6
k6 run --vus 10 --duration 30s load-test-qa.js

# Monitor logs during load test
mise run docker-qa:logs

# Check resource usage
docker stats nexo-auth-service-qa nexo-crm-service-qa

# Shutdown
mise run docker-qa:down
```

---

## Service URLs

### Complete URL Reference

| Service | Local NX | Docker DEV | Docker TEST | Docker QA | Docker PROD |
|---------|----------|------------|-------------|-----------|-------------|
| **Frontend Home** | http://localhost:3000 | http://localhost:4000 | http://localhost:5000 | http://localhost:6000 | http://localhost:7000 |
| **Auth Login** | http://localhost:3001/api/auth/login | http://localhost:4001/api/auth/login | http://localhost:5001/api/auth/login | http://localhost:6001/api/auth/login | http://localhost:7001/api/auth/login |
| **Auth Health** | http://localhost:3001/health | http://localhost:4001/health | http://localhost:5001/health | http://localhost:6001/health | http://localhost:7001/health |
| **CRM Clients** | http://localhost:3003/api/clients | http://localhost:4003/api/clients | http://localhost:5003/api/clients | http://localhost:6003/api/clients | http://localhost:7003/api/clients |
| **CRM Health** | http://localhost:3003/health | http://localhost:4003/health | http://localhost:5003/health | http://localhost:6003/health | http://localhost:7003/health |
| **Gateway Health** | http://localhost:3002/health | http://localhost:4002/health | http://localhost:5002/health | http://localhost:6002/health | http://localhost:7002/health |

### Database Connections

```bash
# DEV database
psql postgresql://nexo_user:nexo_password@localhost:4432/nexo_dev

# TEST database
psql postgresql://nexo_user:nexo_password@localhost:5432/nexo_test

# QA database
psql postgresql://nexo_user:nexo_password@localhost:6432/nexo_qa

# PROD database (use secret from .env.prod)
psql postgresql://nexo_user:${POSTGRES_PASSWORD}@localhost:7432/nexo_prod
```

### Redis Connections

```bash
# DEV Redis
redis-cli -p 4379

# TEST Redis
redis-cli -p 5379

# QA Redis
redis-cli -p 6379

# PROD Redis (requires password from .env.prod)
redis-cli -p 7379 -a ${REDIS_PASSWORD}
```

---

## Health Checks

### Quick Health Verification

```bash
# Check single environment
mise run docker-dev:health

# Check all environments
mise run docker-all:health
```

### Manual Health Checks

```bash
# DEV (4xxx)
curl -f http://localhost:4001/health  # Auth
curl -f http://localhost:4003/health  # CRM
curl -f http://localhost:4002/health  # Gateway
curl -f http://localhost:4000          # Frontend

# TEST (5xxx)
curl -f http://localhost:5001/health
curl -f http://localhost:5003/health
curl -f http://localhost:5002/health
curl -f http://localhost:5000

# QA (6xxx)
curl -f http://localhost:6001/health
curl -f http://localhost:6003/health
curl -f http://localhost:6002/health
curl -f http://localhost:6000

# PROD (7xxx)
curl -f http://localhost:7001/health
curl -f http://localhost:7003/health
curl -f http://localhost:7002/health
curl -f http://localhost:7000
```

### Container Health Status

```bash
# Check container health
docker ps --filter "name=nexo-*-dev" --format "table {{.Names}}\t{{.Status}}"
docker ps --filter "name=nexo-*-test" --format "table {{.Names}}\t{{.Status}}"
docker ps --filter "name=nexo-*-qa" --format "table {{.Names}}\t{{.Status}}"
docker ps --filter "name=nexo-*-prod" --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect nexo-auth-service-dev | jq '.[0].State.Health'
```

---

## Configuration

### Environment Variables

Each environment can be configured via `.env` files:

```bash
docker/
├── .env.dev.example     # DEV configuration template
├── .env.qa.example      # QA configuration template
└── .env.prod.example    # PROD configuration template (REQUIRED)
```

**Create your environment files**:

```bash
# Copy examples
cp docker/.env.dev.example docker/.env.dev
cp docker/.env.qa.example docker/.env.qa
cp docker/.env.prod.example docker/.env.prod

# Edit with your secrets
nano docker/.env.prod
```

**Required variables for PROD**:

```bash
POSTGRES_PASSWORD=your-strong-password
REDIS_PASSWORD=your-strong-password
JWT_SECRET=your-jwt-secret-key
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Resource Limits

**DEV**: No limits (use all available resources)

**TEST**: No limits (fast startup priority)

**QA**:
```yaml
PostgreSQL: CPU 0.5-2 cores, Memory 512M-2G
Redis:      CPU 0.25-1 cores, Memory 128M-512M
Services:   CPU 0.25-1 cores, Memory 256M-1G
```

**PROD**:
```yaml
PostgreSQL: CPU 1-4 cores, Memory 1G-4G
Redis:      CPU 0.5-2 cores, Memory 256M-1G
Services:   CPU 0.5-2 cores, Memory 512M-2G
```

### PostgreSQL Tuning (PROD)

PROD environment includes performance tuning:

```postgresql
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
work_mem = 1310kB
checkpoint_completion_target = 0.9
```

---

## Troubleshooting

### Issue: Port Already in Use

**Symptom**:
```
Error: bind: address already in use
```

**Solution**:
```bash
# Check what's using the port
lsof -i :4000  # or :5000, :6000, :7000

# Kill the process
kill <PID>

# Or stop that specific environment
mise run docker-dev:down
```

### Issue: Services Won't Start

**Symptom**:
```
Container exited with code 1
```

**Solution**:
```bash
# View logs
mise run docker-dev:logs

# Check container status
docker ps -a --filter "name=nexo-*-dev"

# Rebuild images
mise run docker-dev:build

# Clean start
mise run docker-dev:clean
mise run docker-dev:up
```

### Issue: Database Connection Failed

**Symptom**:
```
ECONNREFUSED 127.0.0.1:4432
```

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps --filter "name=nexo-postgres-dev"

# Check PostgreSQL logs
docker logs nexo-postgres-dev

# Verify PostgreSQL is healthy
docker exec nexo-postgres-dev pg_isready -U nexo_user

# Restart database
docker restart nexo-postgres-dev
```

### Issue: Health Checks Failing

**Symptom**:
```
Health check failed: Connection refused
```

**Solution**:
```bash
# Wait longer (services take 30-60s to start)
sleep 60
mise run docker-dev:health

# Check individual service logs
docker logs nexo-auth-service-dev
docker logs nexo-crm-service-dev

# Verify network connectivity
docker exec nexo-auth-service-dev ping nexo-postgres-dev
```

### Issue: Out of Disk Space

**Symptom**:
```
no space left on device
```

**Solution**:
```bash
# Check Docker disk usage
docker system df

# Clean unused containers/images
docker system prune -a

# Remove old volumes
mise run docker-all:clean

# Remove dangling volumes
docker volume prune
```

### Issue: Slow Performance

**Symptom**: Services are slow or unresponsive

**Solution**:
```bash
# Check resource usage
docker stats

# Reduce running environments (stop unused)
mise run docker-dev:down
mise run docker-test:down

# Increase Docker resources in Docker Desktop
# Settings → Resources → Memory (increase to 8GB+)

# For QA/PROD, adjust resource limits in compose files
```

---

## Best Practices

### 1. Environment Separation

✅ **DO**:
- Use DEV for development and debugging
- Use TEST for CI/CD and automated testing
- Use QA for UAT and integration testing
- Use PROD for final validation before deployment
- Keep local NX for hot-reload development

❌ **DON'T**:
- Don't mix environments
- Don't test in PROD first
- Don't skip QA testing

### 2. Resource Management

✅ **DO**:
- Stop unused environments: `mise run docker-dev:down`
- Clean volumes when switching branches: `mise run docker-dev:clean`
- Run only what you need

❌ **DON'T**:
- Don't run all 4 Docker environments + local NX simultaneously (unless needed)
- Don't keep dead containers running

### 3. Security

✅ **DO**:
- Use strong passwords in PROD `.env.prod`
- Rotate secrets regularly
- Never commit `.env` files
- Use `.env.example` as templates

❌ **DON'T**:
- Don't use default passwords in QA/PROD
- Don't commit secrets to Git
- Don't share `.env` files

### 4. Testing Strategy

✅ **DO**:
- Test in TEST environment first (fast, ephemeral)
- Validate in QA environment (production-like)
- Final check in PROD environment
- Use parallel testing when needed

❌ **DON'T**:
- Don't skip TEST environment
- Don't test only in DEV (not production-like)
- Don't run load tests in DEV/TEST

### 5. Monitoring

✅ **DO**:
- Check health after starting: `mise run docker-dev:health`
- Monitor logs: `mise run docker-dev:logs`
- Watch resource usage: `docker stats`
- Use QA/PROD monitoring (Sentry, metrics)

❌ **DON'T**:
- Don't ignore health check failures
- Don't run blind (always check logs first)

---

## Summary

### Quick Command Reference

```bash
# Start environments
mise run docker-dev:up      # DEV (4xxx)
mise run docker-test:up     # TEST (5xxx)
mise run docker-qa:up       # QA (6xxx)
mise run docker-prod:up     # PROD (7xxx)
mise run docker-all:up      # ALL

# Check health
mise run docker-dev:health
mise run docker-all:health

# View logs
mise run docker-dev:logs
mise run docker-all:ps

# Stop environments
mise run docker-dev:down
mise run docker-all:down

# Clean (remove volumes)
mise run docker-dev:clean
mise run docker-all:clean
```

### When to Use Each Environment

| Environment | Use Case | Command |
|-------------|----------|---------|
| **Local NX** | Daily development (hot-reload) | `mise run startup` |
| **Docker DEV** | Containerized development | `mise run docker-dev:up` |
| **Docker TEST** | CI/CD, automated tests | `mise run docker-test:up` |
| **Docker QA** | UAT, integration tests | `mise run docker-qa:up` |
| **Docker PROD** | Final validation | `mise run docker-prod:up` |

### Port Quick Reference

- **3xxx**: Local NX (hot-reload)
- **4xxx**: Docker DEV (containerized dev)
- **5xxx**: Docker TEST (CI/CD)
- **6xxx**: Docker QA (UAT)
- **7xxx**: Docker PROD (simulation)

---

**Ready to start? Try:**

```bash
mise run docker-dev:up
mise run docker-dev:health
open http://localhost:4000
```
