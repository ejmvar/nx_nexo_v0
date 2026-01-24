# NEXO ERP Backend

A comprehensive microservices-based ERP (Enterprise Resource Planning) system built with NestJS and NX monorepo. The system provides complete business management functionality including CRM, inventory, sales, purchasing, and production management.

## 🏗️ Architecture

This project implements a microservices architecture with:

- **API Gateway**: Central routing point for all service requests
- **Auth Service**: JWT-based authentication and authorization
- **CRM Service**: Customer and lead management
- **Stock Service**: Inventory and warehouse management (planned)
- **Sales Service**: Order and sales pipeline management (planned)
- **Purchases Service**: Procurement and supplier management (planned)
- **Production Service**: Manufacturing and work order tracking (planned)
- **Notifications Service**: Communication and alert system (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL (for database integration)

### Installation
```bash
pnpm install
```

### Build Services
```bash
# Build all services
pnpm build

# Or build individual services
npx nx build api-gateway
npx nx build auth-service
npx nx build crm-service
```

### Run Services
```bash
# Start API Gateway (port 3001)
npx nx serve api-gateway

# Start Auth Service (port 3000)
npx nx serve auth-service

# Start CRM Service (port 3002)
npx nx serve crm-service
```

### Health Checks
```bash
# Run comprehensive health checks
./testing/ci-health-check.sh

# Or use Python health checker
python3 testing/health-checks.py
```

## 📋 Services Overview

### ✅ Implemented Services

#### API Gateway (Port 3001)
- Routes requests to appropriate microservices
- Health check endpoint: `GET /health`
- Proxy routes: `/api/v1/*`

#### Auth Service (Port 3000)
- JWT authentication
- Login: `POST /api/v1/auth/login`
- Profile: `POST /api/v1/auth/profile`
- Health: `GET /health`

#### CRM Service (Port 3002)
- Customer management: `GET|POST|PUT|DELETE /api/v1/crm/customers`
- Lead management: `GET|POST|PUT|DELETE /api/v1/crm/leads`
- Contact management: Customer contact associations

### 🔄 Planned Services

- **Stock Service** (Port 3003): Product inventory and warehouse management
- **Sales Service** (Port 3004): Order processing and sales pipeline
- **Purchases Service** (Port 3005): Procurement and supplier management
- **Production Service** (Port 3006): Manufacturing and work orders
- **Notifications Service** (Port 3007): Email, SMS, and in-app notifications

## 🧪 Testing

### Manual Testing
```bash
# Run curl test examples
./testing/curl-examples.sh

# Use REST Client in VS Code
# Open testing/restclient-examples.http
```

### Automated Testing
```bash
# Unit tests
npx nx test api-gateway
npx nx test auth-service
npx nx test crm-service

# Health checks
python3 testing/health-checks.py --ci
```

### CI/CD Testing
```bash
# Run CI health checks
./testing/ci-health-check.sh
```

## 🗄️ Database

### Schema Design
- PostgreSQL with multi-tenancy support
- Row Level Security (RLS) policies
- 15+ tables across 7 business modules
- Complete ER diagrams in `database/` directory

### Current Status
- Schema designed and documented
- Mock data implementation in services
- Database integration pending

## 📚 Documentation

- **Architecture**: `ARCHITECTURE.md` - High-level system design
- **Tasks**: `TASKS.md` - Development roadmap and progress
- **Testing**: `testing/README.md` - Testing infrastructure guide
- **Services**: Individual READMEs in each service directory

## 🛠️ Development

### Project Structure
```
nexo-prj/
├── apps/
│   ├── api-gateway/          # API Gateway service
│   ├── auth-service/         # Authentication service
│   ├── crm-service/          # CRM service
│   └── [other-services]/     # Planned services
├── database/                 # Database schema and migrations
├── testing/                  # Testing infrastructure
└── [config files]           # NX and project configuration
```

### Adding New Services
```bash
# Generate new service
npx nx g @nx/nest:app [service-name]

# Update API Gateway proxy routes
# Add service URL mapping in proxy.service.ts

# Create service documentation and tests
```

### Code Quality
```bash
# Lint code
npx nx lint

# Format code
npx nx format

# Run all tests
npx nx run-many --target=test
```

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. Login with credentials → Receive JWT token
2. Include token in `Authorization: Bearer <token>` header
3. Token validated on protected endpoints

## 📊 API Response Format

All API responses follow a consistent format:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

## 🚀 Deployment

### Development
- Run services individually with `npx nx serve [service-name]`
- Use testing scripts to verify functionality

### Production
- Docker containerization planned
- Docker Compose for local orchestration
- Kubernetes for cloud deployment

## 🤝 Contributing

1. Check `TASKS.md` for current priorities
2. Follow established patterns for new services
3. Add comprehensive tests for new features
4. Update documentation
5. Ensure CI/CD checks pass

## 📈 Progress

- **Infrastructure**: 100% ✅
- **Core Services**: 25% (1/4 implemented)
- **Database Integration**: 10%
- **Testing**: 80%
- **Documentation**: 90%

See `TASKS.md` for detailed progress tracking.

## 📄 License

This project is part of the NEXO ERP system. See project documentation for licensing details.</content>
<parameter name="filePath">/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj/README.md
