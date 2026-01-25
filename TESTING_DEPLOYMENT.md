# NEXO CRM - Testing & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)

### 1. Environment Setup

Copy the environment file:
```bash
cp .env.example .env
```

Edit `.env` and update any necessary values.

### 2. Start Infrastructure

Start all infrastructure services (PostgreSQL, Redis, RabbitMQ):
```bash
docker-compose up -d postgres redis rabbitmq
```

Verify services are healthy:
```bash
docker-compose ps
```

All services should show "healthy" status.

### 3. Database Initialization

The database is automatically initialized with:
- Multi-tenant schema (accounts, users, roles, etc.)
- Row-Level Security (RLS) policies
- Required extensions (uuid-ossp, pgcrypto)

Check database logs:
```bash
docker-compose logs postgres
```

### 4. Development Mode

#### Option A: Run Services Locally (Recommended for Development)

Install dependencies:
```bash
cd nexo-prj
pnpm install
```

Run each service in separate terminals:
```bash
# Terminal 1 - Auth Service
pnpm nx serve auth-service

# Terminal 2 - CRM Service  
pnpm nx serve crm-service

# Terminal 3 - API Gateway
pnpm nx serve api-gateway

# Terminal 4 - Frontend
pnpm nx serve nexo-prj
```

#### Option B: Run Everything in Docker

Build and start all services:
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f
```

### 5. Access Services

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3002
- **Auth Service**: http://localhost:3001
- **CRM Service**: http://localhost:3003
- **RabbitMQ Management**: http://localhost:15672
  - Username: `nexo_user`
  - Password: `nexo_password`

## 🧪 Testing

### Run All Tests

```bash
cd nexo-prj
pnpm nx run-many --target=test --all
```

### Run Specific Service Tests

```bash
# Auth Service
pnpm nx test auth-service

# CRM Service
pnpm nx test crm-service

# API Gateway
pnpm nx test api-gateway

# Frontend
pnpm nx test nexo-prj

# Shared UI
pnpm nx test shared-ui
```

### Test with Coverage

```bash
pnpm nx test auth-service --coverage
```

## 🔍 Database Connection Testing

### Test PostgreSQL Connection

```bash
# From host machine
docker exec -it nexo-postgres psql -U nexo_user -d nexo

# Inside psql, test tables:
\dt
SELECT * FROM accounts;
SELECT * FROM users;
```

### Test Row-Level Security

```sql
-- Set current account context
SET app.current_account_id = 'your-account-uuid';

-- This will only show data for the current account
SELECT * FROM clients;
SELECT * FROM suppliers;
```

### Test from Backend Service

The DatabaseService in each backend service will automatically connect on startup. Check logs:

```bash
# Local development
# Look for: "✅ Database connected successfully"

# Docker
docker-compose logs auth-service | grep "Database"
docker-compose logs crm-service | grep "Database"
```

## 📊 Monitoring & Health Checks

### Service Health Endpoints

All services expose health check endpoints:

```bash
# Auth Service
curl http://localhost:3001/health

# API Gateway
curl http://localhost:3002/health

# CRM Service
curl http://localhost:3003/health
```

### Container Health

```bash
# Check all container health status
docker-compose ps

# Check specific service logs
docker-compose logs -f auth-service
docker-compose logs -f crm-service
```

### Database Health

```bash
# Test PostgreSQL connection
docker exec nexo-postgres pg_isready -U nexo_user -d nexo

# Check active connections
docker exec -it nexo-postgres psql -U nexo_user -d nexo -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: Services can't connect to PostgreSQL

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify environment variables:
   ```bash
   docker-compose config | grep -A 10 "auth-service:"
   ```

4. Test connection from host:
   ```bash
   docker exec -it nexo-postgres psql -U nexo_user -d nexo -c "SELECT 1"
   ```

### Port Conflicts

**Problem**: Port already in use

**Solution**: Update ports in `.env`:
```env
AUTH_SERVICE_PORT=3011
API_GATEWAY_PORT=3012
CRM_SERVICE_PORT=3013
```

### Build Failures

**Problem**: Docker build fails

**Solution**:
1. Clear Docker cache:
   ```bash
   docker-compose build --no-cache
   ```

2. Check Dockerfile context:
   ```bash
   docker-compose config
   ```

3. Ensure all dependencies installed:
   ```bash
   cd nexo-prj
   pnpm install
   ```

### TypeScript Errors

**Problem**: TypeScript compilation errors

**Solution**:
```bash
cd nexo-prj
pnpm nx reset
pnpm install
pnpm nx run-many --target=build --all
```

## 🏗️ Production Deployment

### 1. Environment Configuration

Create production `.env`:
```bash
cp .env.example .env.production
```

Update critical values:
- Change all passwords
- Update JWT_SECRET (minimum 32 characters)
- Set NODE_ENV=production
- Configure external service URLs

### 2. Build Production Images

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### 3. Run in Production Mode

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Database Migrations

For production, consider adding a migration tool:

**Option 1: Prisma**
```bash
cd nexo-prj
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init
npx prisma migrate dev
```

**Option 2: TypeORM**
```bash
pnpm add typeorm
pnpm add -D @nestjs/typeorm
```

**Option 3: Knex**
```bash
pnpm add knex
npx knex init
```

### 5. SSL/TLS Configuration

For production, add SSL certificates:

1. Update docker-compose with volumes:
   ```yaml
   volumes:
     - ./certs:/certs:ro
   ```

2. Configure backend services to use HTTPS

3. Update frontend NEXT_PUBLIC_API_URL to https://

### 6. Monitoring & Logging

Consider adding:
- **Prometheus** for metrics
- **Grafana** for visualization
- **Loki** for log aggregation
- **Sentry** for error tracking

## 📝 Development Workflow

### 1. Create New Feature Branch

```bash
git checkout -b feature/new-feature
```

### 2. Make Changes

Edit files in:
- `nexo-prj/apps/*` for applications
- `nexo-prj/libs/*` for shared libraries

### 3. Run Tests

```bash
pnpm nx affected --target=test
```

### 4. Build Affected Projects

```bash
pnpm nx affected --target=build
```

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

## 🔐 Security Checklist

- [ ] All passwords changed from defaults
- [ ] JWT_SECRET is strong (minimum 32 characters)
- [ ] SSL/TLS certificates configured
- [ ] Database uses scram-sha-256 authentication
- [ ] RLS policies verified for all tables
- [ ] API rate limiting enabled
- [ ] CORS configured correctly
- [ ] Environment variables not committed to git
- [ ] Docker images scanned for vulnerabilities
- [ ] Dependencies audited (`pnpm audit`)

## 📚 Additional Resources

- [NX Documentation](https://nx.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Docker Compose](https://docs.docker.com/compose/)

## 🆘 Getting Help

1. Check logs: `docker-compose logs [service-name]`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `docker-compose exec [service] sh`
4. Review DIRECTIVES.md for coding standards
5. Check ARCHITECTURE.md for system design
