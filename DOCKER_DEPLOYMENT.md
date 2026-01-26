# NEXO CRM Docker Deployment Guide

Complete guide for deploying the NEXO CRM system using Docker.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Building Images](#building-images)
5. [Running Services](#running-services)
6. [Health Checks](#health-checks)
7. [Database Migrations](#database-migrations)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

- Docker 20.10+ installed
- Docker Compose v2.x installed
- At least 4GB RAM available
- Ports 3001-3003, 5432 available

## Quick Start

### Development Stack

```bash
# 1. Clone and navigate to project
cd nexo-prj

# 2. Create environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f
```

### Production Stack

```bash
# 1. Build production images
docker-compose -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d

# 3. Monitor
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
# ============================================================================
# Global Settings
# ============================================================================
NODE_ENV=production
COMPOSE_PROJECT_NAME=nexo-crm

# ============================================================================
# Database Configuration
# ============================================================================
POSTGRES_DB=nexo_crm
POSTGRES_USER=nexo_user
POSTGRES_PASSWORD=change-this-secure-password-123
POSTGRES_PORT=5432

# ============================================================================
# JWT Authentication
# ============================================================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h

# ============================================================================
# Service Ports
# ============================================================================
AUTH_SERVICE_PORT=3001
GATEWAY_SERVICE_PORT=3002
CRM_SERVICE_PORT=3003

# ============================================================================
# CORS Configuration
# ============================================================================
CORS_ORIGIN=https://your-frontend-domain.com

# ============================================================================
# Rate Limiting
# ============================================================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================================================
# Redis (Optional - Future Use)
# ============================================================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis-secure-password-123
```

---

## Building Images

### Build All Services

```bash
# Development mode with cache
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache

# Build specific service
docker-compose build auth-service
docker-compose build crm-service
docker-compose build gateway-service
```

### Production Builds

```bash
# Build optimized production images
docker-compose -f docker-compose.prod.yml build --no-cache

# Tag for registry
docker tag nexo-auth-service:latest your-registry.io/nexo-auth:v1.0.0
docker tag nexo-crm-service:latest your-registry.io/nexo-crm:v1.0.0
docker tag nexo-gateway-service:latest your-registry.io/nexo-gateway:v1.0.0

# Push to registry
docker push your-registry.io/nexo-auth:v1.0.0
docker push your-registry.io/nexo-crm:v1.0.0
docker push your-registry.io/nexo-gateway:v1.0.0
```

---

## Running Services

### Start Stack

```bash
# Start all services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d postgres auth-service
```

### Stop Stack

```bash
# Stop all services (containers persist)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart crm-service

# Restart with rebuild
docker-compose up -d --build crm-service
```

---

## Health Checks

### Check Service Health

```bash
# Check all containers status
docker-compose ps

# Check specific service logs
docker-compose logs -f auth-service
docker-compose logs -f crm-service
docker-compose logs -f gateway-service

# Follow logs from all services
docker-compose logs -f

# Check health endpoints
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3003/api/health  # CRM Service
curl http://localhost:3002/health  # Gateway Service
```

### Database Health

```bash
# Check PostgreSQL
docker exec nexo-postgres pg_isready -U nexo_user -d nexo_crm

# Connect to database
docker exec -it nexo-postgres psql -U nexo_user -d nexo_crm

# Check tables
docker exec nexo-postgres psql -U nexo_user -d nexo_crm -c "\dt"

# Check active connections
docker exec nexo-postgres psql -U nexo_user -d nexo_crm -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Database Migrations

### Apply Migrations

```bash
# Run all SQL migrations
for file in nexo-prj/database/migrations/sql/*.sql; do
  echo "Applying migration: $file"
  docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < "$file"
done

# Apply specific migration
docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < \
  nexo-prj/database/migrations/sql/20260126_1100_phase6_rbac.sql

docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < \
  nexo-prj/database/migrations/sql/20260126_1200_phase6_audit_logging.sql
```

### Verify Migrations

```bash
# Check Phase 6.1 RBAC tables
docker exec nexo-postgres psql -U nexo_user -d nexo_crm -c "
  SELECT tablename FROM pg_tables 
  WHERE tablename IN ('roles', 'permissions', 'role_permissions', 'user_roles');
"

# Check Phase 6.2 Audit tables
docker exec nexo-postgres psql -U nexo_user -d nexo_crm -c "
  SELECT tablename FROM pg_tables WHERE tablename = 'audit_logs';
"

# Count records
docker exec nexo-postgres psql -U nexo_user -d nexo_crm -c "
  SELECT 
    (SELECT COUNT(*) FROM roles) as roles,
    (SELECT COUNT(*) FROM permissions) as permissions,
    (SELECT COUNT(*) FROM audit_logs) as audit_logs;
"
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001  # Auth Service
sudo lsof -i :3002  # Gateway
sudo lsof -i :3003  # CRM Service
sudo lsof -i :5432  # PostgreSQL

# Kill process
sudo kill -9 <PID>

# Or change port in .env file
AUTH_SERVICE_PORT=13001
```

#### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check container details
docker inspect <container-name>

# Restart with fresh build
docker-compose down
docker-compose up -d --build
```

#### Database Connection Issues

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it nexo-postgres psql -U nexo_user -d nexo_crm -c "SELECT 1;"

# Check environment variables
docker exec nexo-crm-service printenv | grep DB
```

#### Out of Memory

```bash
# Check Docker resources
docker system df

# Clean up old images/containers
docker system prune -a

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → Increase to 4GB+
```

### View Resource Usage

```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df

# Container resource limits
docker inspect <container-name> | jq '.[0].HostConfig.Memory'
```

---

## Production Deployment

### Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure firewall rules
- [ ] Set proper CORS_ORIGIN
- [ ] Enable rate limiting
- [ ] Review RLS policies
- [ ] Set up backup strategy
- [ ] Configure log rotation
- [ ] Enable monitoring/alerting

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: nexo_crm
      POSTGRES_USER: nexo_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nexo-network

  auth-service:
    image: your-registry.io/nexo-auth:v1.0.0
    restart: always
    environment:
      NODE_ENV: production
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - jwt_secret
      - db_password
    networks:
      - nexo-network
    depends_on:
      - postgres

  crm-service:
    image: your-registry.io/nexo-crm:v1.0.0
    restart: always
    environment:
      NODE_ENV: production
    secrets:
      - jwt_secret
      - db_password
    networks:
      - nexo-network
    depends_on:
      - postgres
      - auth-service

  gateway-service:
    image: your-registry.io/nexo-gateway:v1.0.0
    restart: always
    environment:
      NODE_ENV: production
    ports:
      - "443:3002"
    networks:
      - nexo-network
    depends_on:
      - auth-service
      - crm-service

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true

networks:
  nexo-network:
    driver: bridge

volumes:
  postgres_data:
```

### Backup Strategy

```bash
# Database backup
docker exec nexo-postgres pg_dump -U nexo_user nexo_crm > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < backup_20260126_120000.sql

# Automated daily backups (cron)
0 2 * * * /path/to/backup-script.sh
```

### Monitoring

```bash
# Health check script
#!/bin/bash
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:3002/health || exit 1
curl -f http://localhost:3003/api/health || exit 1

# Log aggregation
docker-compose logs -f > /var/log/nexo/app.log

# Metrics collection (Prometheus/Grafana)
# Configure exporters for each service
```

---

## Useful Commands

```bash
# Enter container shell
docker exec -it nexo-crm-service sh
docker exec -it nexo-postgres bash

# Copy files from container
docker cp nexo-crm-service:/app/logs ./local-logs

# View container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nexo-crm-service

# Network inspection
docker network inspect nexo-network

# Volume inspection
docker volume ls
docker volume inspect nexo-postgres-data
```

---

## Documentation

- Architecture: `../ARCHITECTURE.md`
- API Reference: `../API_REFERENCE.md`
- Phase 6.1 RBAC: `../docs/phase6.1-rbac.md`
- Phase 6.2 Audit: `../docs/phase6.2-audit.md`
- Development Setup: `../README.md`

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review health endpoints
- Consult troubleshooting section above
- Check database connectivity
- Verify environment variables
