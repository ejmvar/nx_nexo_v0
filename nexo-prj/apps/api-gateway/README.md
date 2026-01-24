<<<<<<< HEAD
# API Gateway Service

The API Gateway serves as the central entry point for all microservice requests in the NEXO ERP backend. It provides proxy routing to individual services and handles cross-cutting concerns.

## Overview

- **Port**: 3001
- **Framework**: NestJS with Express
- **Purpose**: Route requests to appropriate microservices

## Architecture

The API Gateway implements a proxy pattern that routes requests based on URL paths:

- `/api/v1/auth/*` → Auth Service (port 3000)
- `/api/v1/crm/*` → CRM Service (port 3002)
- `/api/v1/stock/*` → Stock Service (port 3003)
- `/api/v1/sales/*` → Sales Service (port 3004)
- `/api/v1/purchases/*` → Purchases Service (port 3005)
- `/api/v1/production/*` → Production Service (port 3006)
- `/api/v1/notifications/*` → Notifications Service (port 3007)

## Features

- **Request Proxying**: Forwards HTTP requests to appropriate services
- **Error Handling**: Centralized error responses
- **Health Checks**: Gateway health endpoint
- **Extensible**: Easy to add new service routes

## API Endpoints

### Health Check
- `GET /health` - Gateway health status

### Proxied Routes
All `/api/v1/*` routes are proxied to respective services.

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Installation
```bash
pnpm install
```

### Building
```bash
npx nx build api-gateway
```

### Running
```bash
# Development
npx nx serve api-gateway

# Production
node dist/apps/api-gateway/main.js
```

### Testing
```bash
# Unit tests
npx nx test api-gateway

# E2E tests
npx nx e2e api-gateway-e2e
```

## Configuration

The service URLs are configured in `src/proxy/proxy.service.ts`:

```typescript
private readonly serviceUrls = {
  auth: 'http://localhost:3000',
  crm: 'http://localhost:3002',
  // ... other services
};
```

## Dependencies

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`
- `@nestjs/axios`
- `axios`
- `rxjs`

## Error Handling

The gateway provides consistent error responses for:
- Service unavailable
- Invalid routes
- Proxy errors

## Future Enhancements

- Load balancing
- Rate limiting
- Request/response logging
- Authentication middleware
- Service discovery</content>
<parameter name="filePath">/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj/apps/api-gateway/README.md
=======
# NestJS API Gateway

Backend API service built with NestJS and GraphQL.

## Development

```bash
# Start development server
pnpm nx serve api-gateway

# Run tests
pnpm nx test api-gateway

# Build
pnpm nx build api-gateway
```

## Docker

```bash
# Build image
docker build -f apps/api-gateway/Dockerfile -t nexo-api-gateway:latest .

# Run container
docker run -p 3001:3001 nexo-api-gateway:latest
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `KEYCLOAK_URL` - Keycloak server URL
- `PORT` - Server port (default: 3001)
>>>>>>> ft/docker
