# CRITICAL DIRECTIVES - ALWAYS FOLLOW

## Configuration Management
❌ **NEVER HARDCODE**:
- Port numbers
- Service URLs
- Database credentials
- API keys
- Any environment-specific values

✅ **ALWAYS USE**:
- Environment variables from `.env` files
- Centralized configuration (e.g., `ConfigModule` in NestJS)
- `process.env.VARIABLE_NAME` or config service
- Type-safe configuration with validation

## Testing Requirements
❌ **NEVER leave non-passing tests**
✅ **ALWAYS ensure all tests pass before committing**
✅ **NEVER ignore test failures - fix them immediately**

## Mocking Guidelines

### ❌ NEVER Mock Third-Party Modules Directly
**DON'T** create mocks for libraries like `pg`, `redis`, `axios`, etc.
- ❌ Creates false positives - tests pass but production fails
- ❌ Mocks diverge from real module behavior over time
- ❌ Misses breaking changes in dependency updates
- ❌ Makes tests brittle and hard to maintain

### ✅ ALWAYS Mock Your Own Services
**DO** mock at the service layer (your application code)
- ✅ `DatabaseService` instead of `pg` module
- ✅ `RedisService` instead of `redis` module
- ✅ `HttpService` instead of `axios` module
- ✅ Keeps tests focused on your business logic
- ✅ Allows real integration tests with actual dependencies

### Mock Strategy by Test Type:

**Unit Tests:**
```typescript
// ✅ RIGHT - Mock your service
const mockDb = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
};

providers: [
  YourService,
  { provide: DatabaseService, useValue: mockDb }
]
```

```typescript
// ❌ WRONG - Mock third-party module
jest.mock('pg', () => ({ Pool: jest.fn() }));
```

**Integration Tests:**
- Use real dependencies (test database, test Redis, etc.)
- Use testcontainers or docker-compose for databases
- Test actual integrations, not mocked versions

**E2E Tests:**
- Run against real infrastructure (staging environment)
- No mocks except external APIs (use VCR/nock for recordings)

### Exception: External APIs
Only mock external APIs you don't control:
- ✅ Third-party payment processors (Stripe, PayPal)
- ✅ External SaaS APIs (Twilio, SendGrid)
- ✅ Use tools like `nock` to record/replay HTTP interactions

## Examples of WRONG vs RIGHT:

### ❌ WRONG - Hardcoded
```typescript
// In tests
expect(httpService.request).toHaveBeenCalledWith(
  expect.objectContaining({ url: 'http://localhost:3001/health' })
);

// In code
const AUTH_SERVICE = 'http://localhost:3001';
```

### ✅ RIGHT - Environment-based
```typescript
// In tests
expect(httpService.request).toHaveBeenCalledWith(
  expect.objectContaining({ 
    url: `${process.env.AUTH_SERVICE_URL}/health` 
  })
);

// In code
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;
```

## Configuration Files Structure
```
project/
  .env.example          # Template with all variables
  .env.local            # Local development (gitignored)
  .env.test             # Test environment
  .env.production       # Production (gitignored, use secrets)
```

## Testing Guidelines
- Load `.env.test` before running tests
- Use `dotenv` in test setup
- Mock environment variables when needed
- Never assume default values

## When Adding New Configuration
1. Add to `.env.example` with description
2. Add to all environment files
3. Update TypeScript types/interfaces
4. Validate configuration on startup
5. Document in README.md

## Port Assignment Strategy
```
3000 - Frontend (Next.js)
3001 - Auth Service
3002 - API Gateway
3003 - CRM Service
3004 - Stock Service
3005 - Sales Service
3006+ - Future services

5432 - PostgreSQL
6379 - Redis
9090 - Prometheus
3030 - Grafana
```

## NestJS Configuration Best Practice
```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.test', '.env.local', '.env'],
      validate: (config) => {
        // Validate required variables
        const required = ['AUTH_SERVICE_PORT', 'DB_HOST'];
        for (const key of required) {
          if (!config[key]) throw new Error(`Missing: ${key}`);
        }
        return config;
      },
    }),
  ],
})
```

## Remember:
**Configuration is code. Treat it with the same rigor as your application logic.**
**Hardcoded values are technical debt and security risks.**
**Always source from centralized .env files.**
