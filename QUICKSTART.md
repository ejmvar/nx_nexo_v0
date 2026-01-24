# NEXO Full Stack - Quick Start Guide

## 🚀 Complete System Setup (Frontend + Backend + Database)

### What You Get
- **Frontend**: Next.js 16 with Tailwind CSS (Port 4200)
- **API Gateway**: NestJS routing layer (Port 3001)
- **Auth Service**: JWT authentication (Port 3000)
- **CRM Service**: Business logic (Port 3002)
- **PostgreSQL**: Database with sample data (Port 5432)
- **Redis**: Caching layer (Port 6379)

---

## Option 1: Docker Compose (Recommended)

### Start Everything
```bash
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend

# Start all services
docker compose -f docker-compose.full.yml up -d

# View logs
docker compose -f docker-compose.full.yml logs -f

# Stop all services
docker compose -f docker-compose.full.yml down
```

### Access Points
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:3001
- **Auth Service**: http://localhost:3000
- **CRM Service**: http://localhost:3002
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Option 2: Local Development (No Docker)

### 1. Start PostgreSQL
```bash
# Using Docker for database only
docker run -d \
  --name nexo-postgres \
  -e POSTGRES_DB=nexo_crm \
  -e POSTGRES_USER=nexo_admin \
  -e POSTGRES_PASSWORD=nexo_dev_password_2026 \
  -p 5432:5432 \
  -v $(pwd)/docker/init-db.sql:/docker-entrypoint-initdb.d/init.sql \
  postgres:16-alpine
```

### 2. Start Backend Services
```bash
cd nexo-prj

# Terminal 1: Auth Service
pnpm nx serve auth-service

# Terminal 2: API Gateway
pnpm nx serve api-gateway

# Terminal 3: CRM Service
pnpm nx serve crm-service
```

### 3. Start Frontend
```bash
# Terminal 4: Frontend
pnpm nx serve nexo-prj
```

---

## 🔑 Sample Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@nexo.com | admin123 |
| **Employee** | employee@nexo.com | employee123 |
| **Client** | client@nexo.com | client123 |
| **Supplier** | supplier@nexo.com | supplier123 |
| **Professional** | professional@nexo.com | professional123 |

---

## 📊 Database Schema

The database includes:
- **users**: Unified user table (all roles)
- **employees**: Employee-specific data
- **clients**: Client/customer data
- **suppliers**: Supplier/vendor data
- **professionals**: Freelancer/contractor data
- **projects**: Project management
- **orders**: Purchase/sales orders
- **tasks**: Task tracking

---

## 🔧 Development Commands

### Build All Services
```bash
# Build frontend only
pnpm nx build nexo-prj

# Build all backend services
pnpm nx run-many --target=build --projects=api-gateway,auth-service,crm-service

# Build everything
pnpm nx run-many --target=build --all
```

### Testing
```bash
# Test frontend
pnpm nx test nexo-prj

# Test backend services
pnpm nx run-many --target=test --projects=api-gateway,auth-service,crm-service
```

### Linting
```bash
# Lint everything
pnpm nx run-many --target=lint --all
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View database logs
docker logs nexo-postgres

# Connect to database
docker exec -it nexo-postgres psql -U nexo_admin -d nexo_crm
```

### Port Conflicts
If ports are already in use, update `docker-compose.full.yml`:
```yaml
services:
  frontend:
    ports:
      - "4201:3000"  # Change 4200 to 4201
```

### Clean Start
```bash
# Stop and remove everything
docker compose -f docker-compose.full.yml down -v

# Rebuild from scratch
docker compose -f docker-compose.full.yml up --build -d
```

---

## 📁 Project Structure

```
nexo-prj/
├── apps/
│   ├── nexo-prj/          # Frontend (Next.js)
│   ├── api-gateway/       # API Gateway (NestJS)
│   ├── auth-service/      # Authentication (NestJS)
│   └── crm-service/       # CRM Business Logic (NestJS)
├── libs/
│   └── shared-ui/         # Shared React components
└── docker/
    └── init-db.sql        # Database initialization

docker-compose.full.yml    # Complete stack orchestration
```

---

## 🎯 Next Steps

1. ✅ **Frontend Complete**: Tailwind CSS migration done (36s build)
2. ✅ **Backend Services**: All building successfully
3. ✅ **Database Schema**: PostgreSQL with sample data
4. 🔄 **API Integration**: Connect frontend to backend
5. 🔄 **Authentication**: Implement JWT login
6. 🔄 **Data Fetching**: Replace mock data with real API calls

---

## 📚 Documentation

- [Frontend Migration Summary](nexo-prj/MIGRATION_SUMMARY.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Task Runners Guide](TASKS.md)
- [Original README](README.md)

---

## 💡 Tips

- Use **mise** for environment management: `mise run dev`
- Backend changes auto-reload with webpack watch mode
- Frontend has Turbopack fast refresh (2.8s startup)
- Database changes require rebuilding the init script
