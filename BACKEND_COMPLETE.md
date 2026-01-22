# NEXO Backend - Complete Setup Guide
## Backend Services Successfully Implemented

### 🎯 Overview
NEXO CRM backend is fully operational with 3 microservices, API Gateway, PostgreSQL database, and Redis cache.

---

## 🏗️ Architecture

```
Frontend (Port 3000)
       ↓
API Gateway (Port 3002) ← Single entry point for all requests
       ↓
    ┌──┴──┬────────────┐
    ↓     ↓            ↓
Auth    CRM        Future Services
(3001)  (3003)
    ↓     ↓
    └──┬──┘
       ↓
PostgreSQL (5432) + Redis (6379)
```

---

## 📦 Services Status

### ✅ Auth Service (Port 3001)
- **Pattern**: TinyAuth (JWT-based authentication)
- **Features**:
  - User registration & login
  - JWT access tokens (15min) + refresh tokens (7d)
  - Token refresh & logout
  - Redis-based token blacklist
  - Password hashing with bcrypt
  - Profile management

### ✅ API Gateway (Port 3002)
- **Purpose**: Central routing and request proxying
- **Routes**:
  - `/api/auth/*` → Auth Service (3001)
  - `/api/crm/*` → CRM Service (3003)
- **Features**:
  - CORS support
  - Request validation
  - Header forwarding
  - Error handling
  - 30s timeout

### ✅ CRM Service (Port 3003)
- **Purpose**: Business data management
- **Entities**:
  - **Clients**: Customer management with company details
  - **Employees**: Staff management with departments
  - **Projects**: Project tracking with budgets/deadlines
  - **Tasks**: Task management with assignments
  - Suppliers, Professionals (basic structure)
- **Features**:
  - Full CRUD operations
  - Pagination & filtering
  - Auto-code generation
  - Database transactions
  - Foreign key relationships

### ✅ PostgreSQL (Port 5432)
- **Image**: postgres:16-alpine
- **Database**: nexo_crm
- **User**: nexo_admin
- **Features**:
  - UUID primary keys
  - ENUM types for status/roles
  - Cascading deletes
  - Timestamps on all tables
  - Proper indexes

### ✅ Redis (Port 6379)
- **Image**: redis:7-alpine
- **Usage**: JWT token blacklist, session storage
- **Config**: AOF persistence, 128MB max memory

---

## 🚀 Quick Start

### 1. Start All Services
```bash
./start-backend.sh
```

This will:
1. Start PostgreSQL + Redis (Docker)
2. Start Auth Service (3001)
3. Start API Gateway (3002)
4. Start CRM Service (3003)

**Wait ~30 seconds for all services to initialize**

### 2. Verify Services
```bash
# Check all services
curl http://localhost:3001/api/auth/health  # Auth
curl http://localhost:3002/api/health       # Gateway
curl http://localhost:3003/api/health       # CRM

# Or use gateway routes
curl http://localhost:3002/api/auth/health
curl http://localhost:3002/api/crm/clients
```

### 3. Run Tests
```bash
./test-auth.sh     # Test auth service (7 tests)
./test-gateway.sh  # Test API Gateway routing (8 tests)
./test-crm.sh      # Test CRM endpoints (10+ tests)
```

---

## 📝 API Documentation

### Authentication Endpoints (via Gateway: :3002/api/auth)

#### Register User
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "Password123",  # Min 8 chars
  "username": "johndoe",
  "full_name": "John Doe"
}
```

#### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123"
}
Response: { access_token, refresh_token, user }
```

#### Get Profile (authenticated)
```bash
GET /api/auth/profile
Headers: { Authorization: "Bearer <access_token>" }
```

#### Refresh Token
```bash
POST /api/auth/refresh
{
  "refresh_token": "<refresh_token>"
}
```

#### Logout
```bash
POST /api/auth/logout
Headers: { Authorization: "Bearer <access_token>" }
```

---

### CRM Endpoints (via Gateway: :3002/api/crm)

#### Clients
```bash
GET    /api/crm/clients              # List all
GET    /api/crm/clients/:id          # Get one
POST   /api/crm/clients              # Create
PATCH  /api/crm/clients/:id          # Update
DELETE /api/crm/clients/:id          # Delete

# Create Client Example
POST /api/crm/clients
{
  "email": "client@company.com",
  "full_name": "Jane Client",
  "company_name": "ACME Corp",
  "phone": "+1-555-0001",
  "password": "optional"  # For portal access
  # username & client_code auto-generated
}
```

#### Employees
```bash
GET    /api/crm/employees            # List all
GET    /api/crm/employees/:id        # Get one
POST   /api/crm/employees            # Create
PATCH  /api/crm/employees/:id        # Update
DELETE /api/crm/employees/:id        # Delete

# Create Employee Example
POST /api/crm/employees
{
  "email": "emp@nexo.com",
  "full_name": "John Employee",
  "position": "Developer",
  "department": "IT"
  # username, employee_code, hire_date auto-generated
}
```

#### Projects
```bash
GET    /api/crm/projects             # List all
GET    /api/crm/projects/:id         # Get one
POST   /api/crm/projects             # Create
PATCH  /api/crm/projects/:id         # Update
DELETE /api/crm/projects/:id         # Delete

# Create Project Example
POST /api/crm/projects
{
  "name": "Website Redesign",
  "description": "Company website revamp",
  "status": "planning",              # planning|in-progress|completed|cancelled
  "client_id": "<uuid>",
  "budget": 100000,
  "start_date": "2026-01-22",
  "deadline": "2026-12-31"
}
```

#### Tasks
```bash
GET    /api/crm/tasks                # List all
GET    /api/crm/tasks/:id            # Get one
POST   /api/crm/tasks                # Create
PATCH  /api/crm/tasks/:id            # Update
DELETE /api/crm/tasks/:id            # Delete

# Create Task Example
POST /api/crm/tasks
{
  "title": "Design homepage",
  "description": "Create mockups",
  "status": "pending",               # pending|in-progress|completed
  "priority": "high",                # low|medium|high
  "assigned_to": "<employee_uuid>",
  "project_id": "<project_uuid>",
  "due_date": "2026-02-01"
}
```

---

## 🗄️ Database Schema

### Users Table (Unified)
```sql
- id (UUID, PK)
- email (unique)
- username (unique)
- password_hash
- full_name
- role (enum: employee, client, supplier, professional, admin)
- status (enum: active, inactive, suspended, pending)
- phone, avatar_url
- created_at, updated_at, last_login
```

### Clients/Employees/Suppliers/Professionals
Each extends `users` table with specific fields via foreign keys.

### Projects & Tasks
Standard project management schema with relationships.

---

## 🔧 Configuration Files

### Environment Variables
Each service has `.env.local`:
- `auth-service/.env.local` - DB, Redis, JWT secrets
- `api-gateway/.env.local` - Service URLs
- `crm-service/.env.local` - DB credentials

### Docker Compose
`docker-compose.full.yml` - PostgreSQL + Redis + all services

---

## 📊 Service Logs

```bash
# Real-time monitoring
tail -f /tmp/auth-service.log
tail -f /tmp/api-gateway.log
tail -f /tmp/crm-service.log

# Docker logs
docker logs -f nexo-postgres
docker logs -f nexo-redis
```

---

## 🛑 Stop Services

```bash
# Stop Node services
pkill -f "nx serve"

# Stop Docker containers
docker compose -f docker-compose.full.yml down

# Or stop specific services
docker stop nexo-postgres nexo-redis
```

---

## 🎨 Frontend Integration

The frontend should use the **API Gateway** as the single entry point:

```javascript
// Next.js configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

// Example usage
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

fetch(`${API_URL}/crm/clients`, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
})
```

---

## ✅ Implementation Checklist

- [x] Step 1: Raspberry Pi optimization (multi-stage Docker, ARM64)
- [x] Step 2: Frontend API testing setup
- [x] Step 3: TinyAuth backend implementation
- [x] Step 4: Fix auth service port binding
- [x] Step 5: Test authentication endpoints
- [x] Step 6: API Gateway routing
- [x] Step 7: CRM service CRUD endpoints
- [ ] Step 8: Docker containerization (optional)
- [ ] Step 9: Frontend integration
- [ ] Step 10: Production deployment

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -ti:3001,3002,3003 | xargs -r kill -9
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep nexo-postgres

# Restart if needed
docker restart nexo-postgres

# Check credentials match .env.local files
```

### Service Won't Start
```bash
# Check logs
tail -100 /tmp/<service-name>.log

# Rebuild if needed
cd nexo-prj
pnpm nx build <service-name>
```

---

## 📈 Next Steps

1. **Add Authentication Guards to CRM**: Protect CRM endpoints with JWT validation
2. **Implement Remaining Entities**: Complete Suppliers & Professionals CRUD
3. **Add Data Validation**: Enhanced DTO validation rules
4. **API Documentation**: Swagger/OpenAPI integration
5. **Unit Tests**: Jest tests for services
6. **E2E Tests**: Integration tests across services
7. **Monitoring**: Add logging, metrics, health checks
8. **Docker Production Build**: Multi-stage builds for all services
9. **CI/CD**: GitHub Actions for automated testing/deployment
10. **Frontend Integration**: Connect Next.js frontend

---

## 📚 Technical Stack

- **Runtime**: Node.js 20.x
- **Framework**: NestJS 11.x (ESM modules)
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **HTTP Client**: @nestjs/axios (RxJS)
- **Password Hashing**: bcryptjs
- **Monorepo**: Nx 20.x
- **Package Manager**: pnpm

---

## 🎉 Success Indicators

All green ✅:
- `./start-backend.sh` starts all services without errors
- `./test-auth.sh` passes all 7 tests
- `./test-gateway.sh` passes all 8 tests
- `./test-crm.sh` passes 10+ tests
- All services respond to health checks
- Database has proper schema and data
- API Gateway routes requests correctly

---

**Status**: Production Ready (Development Environment)
**Last Updated**: January 22, 2026
**Documentation Version**: 1.0
