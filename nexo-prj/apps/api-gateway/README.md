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
