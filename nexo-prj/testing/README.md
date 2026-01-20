# NEXO ERP Backend - Manual Testing Examples

This directory contains manual testing examples for the NEXO ERP backend microservices.

## Files:
- `curl-examples.sh` - Bash script with curl commands for testing all endpoints
- `restclient-examples.http` - REST Client (.http) files for VS Code REST Client extension
- `health-checks.py` - Python scripts for automated health checks
- `ci-health-check.sh` - CI/CD health check script for pipelines

## Current Services Status:
- ✅ API Gateway: http://localhost:3001 (implemented and tested)
- ✅ Auth Service: http://localhost:3000 (implemented with JWT authentication)
- ✅ CRM Service: http://localhost:3002 (implemented with mock data)
- ⏳ Stock Service: http://localhost:3003 (planned)
- ⏳ Sales Service: http://localhost:3004 (planned)
- ⏳ Purchases Service: http://localhost:3005 (planned)
- ⏳ Production Service: http://localhost:3006 (planned)
- ⏳ Notifications Service: http://localhost:3007 (planned)

## Implemented Features:
- JWT Authentication with login/profile endpoints
- API Gateway proxy routing for all services
- CRM module with customers and leads management
- Comprehensive testing infrastructure
- Unit tests for all services (Auth, CRM, API Gateway)

## Prerequisites:
1. Install dependencies: `pnpm install`
2. Build services: `npx nx build api-gateway && npx nx build auth-service && npx nx build crm-service`
3. Start services (see individual service READMEs for details)

## Usage:
```bash
# Run curl examples
./testing/curl-examples.sh

# Use REST Client in VS Code (open .http files)
# Or run Python health checks
python3 testing/health-checks.py

# CI/CD health checks
./testing/ci-health-check.sh

# Unit tests (when Jest configuration is resolved)
npx nx test auth-service
npx nx test crm-service
npx nx test api-gateway
```

## CRM Service Endpoints:
- `GET /api/v1/crm/customers` - List customers
- `GET /api/v1/crm/customers/:id` - Get customer by ID
- `POST /api/v1/crm/customers` - Create customer
- `PUT /api/v1/crm/customers/:id` - Update customer
- `DELETE /api/v1/crm/customers/:id` - Delete customer
- `GET /api/v1/crm/leads` - List leads
- `GET /api/v1/crm/leads/:id` - Get lead by ID
- `POST /api/v1/crm/leads` - Create lead
- `PUT /api/v1/crm/leads/:id` - Update lead
- `DELETE /api/v1/crm/leads/:id` - Delete lead

## Testing Status:
- ✅ Manual testing scripts (curl, REST Client)
- ✅ Health check automation (Python & Bash)
- ✅ CI/CD integration scripts
- 🔄 Unit tests (Jest configuration needs resolution)
- ⏳ Integration tests (pending database setup)
- ⏳ End-to-end tests (pending full service implementation)