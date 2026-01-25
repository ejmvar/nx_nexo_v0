# Docker Infrastructure Status

**Date**: January 21, 2026  
**Branch**: ft/MaterialUI-issues  
**Status**: ✅ Operational (Database Services Running)

## Current Infrastructure

### Running Services

#### 1. PostgreSQL 16 (nexo-postgres)
- **Status**: ✅ Healthy
- **Port**: 5432
- **Database**: nexo_crm
- **User**: nexo_admin
- **Tables**: 8 (users, employees, clients, suppliers, professionals, projects, orders, tasks)
- **Sample Data**: 5 test users (admin, employee, client, supplier, professional)
- **Features**: 
  - UUID support (uuid-ossp)
  - Password encryption (pgcrypto)
  - Auto-updated timestamps
  - Enums for user roles and statuses

#### 2. Redis 7 (nexo-redis)
- **Status**: ✅ Healthy
- **Port**: 6379
- **Persistence**: AOF (Append-Only File) enabled
- **Purpose**: Caching and session storage

### Not Yet Running

#### Backend Services
- **auth-service** (Port 3000) - Not started
- **api-gateway** (Port 3001) - Not started
- **crm-service** (Port 3002) - Not started

#### Frontend
- **frontend** (Port 4200) - Not started

## Architecture Decisions

### Authentication: TinyAuth (Planned)
**Decision**: Moving from Keycloak to TinyAuth for simplicity and Raspberry Pi compatibility.

**Rationale**:
- **Lightweight**: Minimal resource footprint suitable for Raspberry Pi
- **Simple**: Easier to deploy and maintain than Keycloak
- **Self-contained**: No external dependencies
- **JWT-based**: Standard token-based authentication
- **Raspberry Pi Ready**: Designed for low-resource environments

**Implementation Notes**:
- TinyAuth will be integrated into the auth-service
- JWT tokens for authentication
- Session storage in Redis
- Compatible with existing database schema
- No breaking changes to existing API contracts

### Microservices Architecture
```
┌─────────────┐
│   Frontend  │ (Next.js, Tailwind CSS)
│  Port 4200  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │ (NestJS)
│  Port 3001  │
└──────┬──────┘
       │
   ┌───┴────┬──────────────┐
   ▼        ▼              ▼
┌──────┐ ┌─────┐      ┌─────┐
│ Auth │ │ CRM │      │ ... │
│ 3000 │ │3002 │      │     │
└──┬───┘ └──┬──┘      └─────┘
   │        │
   └────┬───┘
        ▼
   ┌─────────┐
   │PostgreSQL│
   │   5432  │
   └─────────┘
        │
        ▼
   ┌─────────┐
   │  Redis  │
   │   6379  │
   └─────────┘
```

## Sample Credentials

For development and testing:

```
Admin Portal:
  Email: admin@nexo.com
  Password: admin123

Employee Portal:
  Email: employee@nexo.com
  Password: employee123

Client Portal:
  Email: client@nexo.com
  Password: client123

Supplier Portal:
  Email: supplier@nexo.com
  Password: supplier123

Professional Portal:
  Email: professional@nexo.com
  Password: professional123
```

## Database Schema

### Core Tables
1. **users** - Unified authentication and user management
2. **employees** - Internal staff with department/position
3. **clients** - External customers with billing info
4. **suppliers** - Vendors and suppliers
5. **professionals** - Freelancers/contractors
6. **projects** - Project management
7. **orders** - Order processing
8. **tasks** - Task tracking

### Key Features
- UUID primary keys
- Bcrypt password hashing (via pgcrypto)
- ENUM types for statuses and roles
- Automatic updated_at timestamps
- Foreign key constraints
- Performance indexes

## Commands

### Start All Services
```bash
docker compose -f docker-compose.full.yml up -d
```

### Start Database Only
```bash
docker compose -f docker-compose.full.yml up -d postgres redis
```

### Check Status
```bash
docker compose -f docker-compose.full.yml ps
```

### View Logs
```bash
docker compose -f docker-compose.full.yml logs -f [service-name]
```

### Stop All Services
```bash
docker compose -f docker-compose.full.yml down
```

### Stop and Remove Volumes
```bash
docker compose -f docker-compose.full.yml down -v
```

### Database Access
```bash
docker exec -it nexo-postgres psql -U nexo_admin -d nexo_crm
```

### Redis CLI
```bash
docker exec -it nexo-redis redis-cli
```

## Next Steps

1. **Implement TinyAuth in auth-service**
   - Research TinyAuth integration
   - Update auth-service with TinyAuth
   - Configure JWT tokens
   - Set up Redis session storage

2. **Build and Test Backend Services**
   - Build Docker images for all services
   - Start auth-service and test authentication
   - Start api-gateway and test routing
   - Start crm-service and test CRUD operations

3. **Frontend Integration**
   - Connect Next.js app to API Gateway
   - Implement login flow with TinyAuth
   - Update portal pages to use real data
   - Replace mock data with API calls

4. **Testing**
   - End-to-end testing of authentication flow
   - API endpoint testing
   - Database query performance
   - Frontend-backend integration

5. **Raspberry Pi Optimization**
   - Memory usage profiling
   - CPU usage optimization
   - Startup time reduction
   - Multi-architecture Docker images (ARM64)

## Performance Targets (Raspberry Pi 4)

- **Startup Time**: < 30 seconds for full stack
- **Memory Usage**: < 1GB total for all services
- **CPU Usage**: < 50% average
- **Database Response**: < 100ms for typical queries
- **API Response**: < 200ms for authenticated requests

## Notes

- All services use Alpine Linux for minimal image size
- Database initialization script runs automatically on first start
- Redis persistence ensures session data survives restarts
- Health checks configured for critical services
- Environment variables stored in docker-compose.full.yml (update for production)
