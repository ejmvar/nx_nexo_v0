# NEXO Backend Services - Quick Start Guide

## ✅ Currently Working

### Services Running:
- **PostgreSQL 16** - Port 5432 (healthy)
- **Redis 7** - Port 6379 (healthy)  
- **Auth Service** - Port 3001 (fully functional)

### Auth Service Endpoints:
```
POST   /api/auth/register        - Create new user account
POST   /api/auth/login           - Login and get JWT tokens
POST   /api/auth/logout          - Logout and blacklist token
POST   /api/auth/refresh         - Refresh access token
POST   /api/auth/change-password - Change user password
GET    /api/auth/profile         - Get user profile (requires JWT)
GET    /api/auth/health          - Health check
```

## 🚀 Quick Start

### Option 1: Start All Services
```bash
./start-backend.sh
```

### Option 2: Manual Start
```bash
# 1. Start database and Redis
unset DOCKER_HOST
docker compose -f docker-compose.full.yml up -d postgres redis

# 2. Wait for services to be healthy
sleep 10

# 3. Start auth service
cd nexo-prj
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=nexo_crm \
DB_USER=nexo_admin \
DB_PASSWORD=nexo_dev_password_2026 \
PORT=3001 \
REDIS_URL=redis://localhost:6379 \
JWT_SECRET=nexo_jwt_secret_key_2026 \
nx serve auth-service --host 0.0.0.0
```

## 🧪 Testing

### Run Full Test Suite:
```bash
./test-auth.sh
```

### Manual Testing:

1. **Health Check:**
```bash
curl http://localhost:3001/api/auth/health
```

2. **Register User:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "username": "myusername",
    "full_name": "Full Name"
  }'
```

3. **Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

4. **Get Profile (use access_token from login):**
```bash
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 Database

### Connect to PostgreSQL:
```bash
docker exec -it nexo-postgres psql -U nexo_admin -d nexo_crm
```

### Useful SQL Commands:
```sql
-- List all users
SELECT id, email, username, full_name, role, status, created_at FROM users;

-- Count users
SELECT COUNT(*) FROM users;

-- Find user by email
SELECT * FROM users WHERE email = 'admin@nexo.com';
```

### Reset Database:
```bash
unset DOCKER_HOST
docker compose -f docker-compose.full.yml down postgres
docker volume rm nx_nexo_v020260115_backend_postgres_data
docker compose -f docker-compose.full.yml up -d postgres
```

## 📝 Logs

### View Auth Service Logs:
```bash
tail -f /tmp/auth-service.log
```

### View Database Logs:
```bash
docker logs -f nexo-postgres
```

### View Redis Logs:
```bash
docker logs -f nexo-redis
```

## 🛑 Stopping Services

### Stop Auth Service:
```bash
pkill -f "nx serve auth-service"
```

### Stop Database & Redis:
```bash
unset DOCKER_HOST
docker compose -f docker-compose.full.yml down
```

### Stop Everything:
```bash
pkill -f "nx serve"
docker compose -f docker-compose.full.yml down
```

## 🔧 Development

### Build Auth Service:
```bash
cd nexo-prj
nx build auth-service
```

### Watch Mode (auto-reload on changes):
```bash
# Auth service automatically reloads when you run nx serve
```

### Run Tests:
```bash
cd nexo-prj
nx test auth-service
```

## 📦 Architecture

### TinyAuth Pattern:
- **Lightweight** - No heavy OAuth/OIDC infrastructure
- **JWT-based** - Access tokens (15min) + Refresh tokens (7d)
- **Database-backed** - PostgreSQL for user data
- **Redis caching** - Fast user profile lookups (5min TTL)
- **Token blacklisting** - Revoke tokens on logout
- **bcryptjs** - Secure password hashing

### User Roles:
- `employee` - Default role for registered users
- `client` - Client portal access
- `supplier` - Supplier portal access
- `professional` - Professional portal access
- `admin` - Administrator access

## 🐛 Troubleshooting

### Port 3001 already in use:
```bash
lsof -ti:3001 | xargs kill -9
```

### Docker connection issues:
```bash
unset DOCKER_HOST
docker ps
```

### Database connection failed:
Check if PostgreSQL is healthy:
```bash
docker ps --filter name=nexo-postgres
```

### Service won't start:
Check logs:
```bash
tail -50 /tmp/auth-service.log
```

## 📋 Next Steps

1. **API Gateway** - Route requests to auth and CRM services
2. **CRM Service** - CRUD endpoints for clients, employees, projects, etc.
3. **Frontend Integration** - Connect Next.js app to auth endpoints
4. **Docker Build** - Build and test containerized services
5. **Raspberry Pi Deployment** - Deploy to Pi 4 hardware

## 📚 Documentation

- [STEP3_COMPLETED.md](STEP3_COMPLETED.md) - Full implementation details
- [RASPBERRY_PI.md](RASPBERRY_PI.md) - Pi deployment guide
- [docker-compose.full.yml](docker-compose.full.yml) - Complete service configuration
