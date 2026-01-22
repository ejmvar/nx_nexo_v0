# NEXO CRM - Docker Setup

## Quick Start

### 1. Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 4. Access Services
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3002
- **Auth Service**: http://localhost:3001
- **CRM Service**: http://localhost:3003
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ Management**: http://localhost:15672

## Service Architecture

```
┌─────────────┐
│  Frontend   │ :3000
│  (Next.js)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│API Gateway  │ :3002
└──────┬──────┘
       │
       ├──────────┐
       │          │
       ▼          ▼
┌───────────┐  ┌───────────┐
│Auth Service│  │CRM Service│
│   :3001    │  │   :3003   │
└─────┬─────┘  └─────┬─────┘
      │              │
      └──────┬───────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐  ┌─────────┐
│PostgreSQL│  │  Redis  │
│   :5432  │  │  :6379  │
└──────────┘  └─────────┘
      │
      ▼
┌──────────┐
│RabbitMQ  │
│   :5672  │
└──────────┘
```

## Database Schema

### Multi-Tenant Architecture
- **Row-Level Security (RLS)** for tenant isolation
- **account_id** on all tenant-scoped tables
- **UUID** primary keys for distributed systems

### Core Tables
- `accounts` - Tenant organizations
- `roles` - Role definitions per account
- `users` - User accounts with account association
- `user_roles` - User-role associations
- `clients` - Client records
- `suppliers` - Supplier records
- `employees` - Employee records
- `professionals` - Professional/contractor records

## Commands

### Start/Stop
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it nexo-postgres psql -U nexo_user -d nexo

# View database logs
docker-compose logs postgres

# Backup database
docker exec nexo-postgres pg_dump -U nexo_user nexo > backup.sql

# Restore database
docker exec -i nexo-postgres psql -U nexo_user nexo < backup.sql
```

### Redis Operations
```bash
# Connect to Redis
docker exec -it nexo-redis redis-cli -a nexo_redis_password

# View Redis logs
docker-compose logs redis

# Flush Redis cache
docker exec nexo-redis redis-cli -a nexo_redis_password FLUSHALL
```

### Service Management
```bash
# Restart a service
docker-compose restart auth-service

# View service logs
docker-compose logs -f crm-service

# Execute command in service
docker exec -it nexo-auth-service npm run test

# Rebuild service after code changes
docker-compose up -d --build auth-service
```

## Development Workflow

### Hot Reload (Local Development)
For development with hot reload, use local NX commands instead:
```bash
# Terminal 1: Auth Service
pnpm nx serve auth-service

# Terminal 2: CRM Service
pnpm nx serve crm-service

# Terminal 3: API Gateway
pnpm nx serve api-gateway

# Terminal 4: Frontend
pnpm nx serve nexo-prj
```

### Testing
```bash
# Run all tests
pnpm nx run-many --target=test --all

# Run specific service tests
pnpm nx test auth-service

# Run with coverage
pnpm nx test crm-service --coverage
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000

# Change ports in .env.local
FRONTEND_PORT=3100
```

### Database Connection Issues
```bash
# Check PostgreSQL is ready
docker exec nexo-postgres pg_isready -U nexo_user

# View PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Service Not Starting
```bash
# Check service logs
docker-compose logs <service-name>

# Check service health
docker-compose ps

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

### Environment Variables
⚠️ **CRITICAL**: Update these for production:
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
RABBITMQ_PASSWORD=$(openssl rand -base64 32)
```

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Enable rate limiting
- [ ] Set up SSL certificates

### Resource Limits
Update docker-compose.yml with resource limits:
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 1G
```

## Monitoring

### Health Checks
```bash
# Check all services
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Gateway
curl http://localhost:3003/health  # CRM
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 postgres
```

## Backup Strategy

### Database
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec nexo-postgres pg_dump -U nexo_user nexo | gzip > backup_$DATE.sql.gz
```

### Volumes
```bash
# Backup all volumes
docker run --rm -v nexo_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz /data
```

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Ensure ports are available
4. Check Docker daemon status

---

**Built with NX Monorepo**
