# Multi-Tenant Implementation Guide

## ✅ Completed: Multi-Tenant Foundation

### 1. Database Schema (Already Complete)
All tables have `account_id` field with RLS policies:
- [database/init/01-init.sql](../database/init/01-init.sql) - Schema with account_id
- [database/init/02-rls-policies.sql](../database/init/02-rls-policies.sql) - RLS policies

### 2. Authentication Service (✅ Updated)
**Files Modified:**
- [auth-service/src/auth/auth.service.ts](../nexo-prj/apps/auth-service/src/auth/auth.service.ts)
- [auth-service/src/auth/dto/auth.dto.ts](../nexo-prj/apps/auth-service/src/auth/dto/auth.dto.ts)
- [auth-service/src/database/database.service.ts](../nexo-prj/apps/auth-service/src/database/database.service.ts)

**Changes:**
- ✅ `register()` now creates or accepts `account_id`
- ✅ JWT payload includes `account_id`
- ✅ `UserProfile` interface updated with `account_id`
- ✅ DatabaseService has `queryWithAccount()` method for RLS

**New Flow:**
```typescript
// Register new user (auto-creates account)
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "user",
  "full_name": "John Doe"
  // account_id is optional - auto-created if not provided
}

// Response includes account_id
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "account_id": "uuid",  // ✅ Now included
    "email": "user@example.com",
    ...
  }
}
```

### 3. Database Service RLS Support (✅ Complete)
Added `queryWithAccount()` method to both services:

```typescript
// auth-service and crm-service DatabaseService
async queryWithAccount(accountId: string, text: string, params?: any[]) {
  const client = await this.pool.connect();
  try {
    // Set RLS context
    await client.query('SET LOCAL app.current_account_id = $1', [accountId]);
    
    // Execute query (RLS automatically filters by account_id)
    const result = await client.query(text, params);
    
    return result;
  } finally {
    await client.query('RESET app.current_account_id').catch(() => {});
    client.release();
  }
}
```

### 4. Shared Decorators (✅ New)
**Created Library:** `libs/shared/decorators`

**Files Created:**
- [libs/shared/decorators/src/lib/account.decorator.ts](../nexo-prj/libs/shared/decorators/src/lib/account.decorator.ts)
- [libs/shared/decorators/src/lib/user.decorator.ts](../nexo-prj/libs/shared/decorators/src/lib/user.decorator.ts)

**Usage in Controllers:**
```typescript
import { AccountId, CurrentUser } from '@nexo-prj/shared/decorators';

@Controller('clients')
export class ClientsController {
  @Get()
  async getClients(@AccountId() accountId: string) {
    // accountId automatically extracted from JWT
    return this.crmService.getClients(accountId, query);
  }
  
  @Get(':id')
  async getClient(
    @AccountId() accountId: string,
    @Param('id') id: string
  ) {
    return this.crmService.getClient(accountId, id);
  }
}
```

## 🔄 Next Steps: Update CRM Service

### Option 1: Use RLS (Recommended)
Update CRM service methods to use `queryWithAccount()`:

```typescript
// Before
async getClients(query: any) {
  const result = await this.db.query(
    'SELECT * FROM clients WHERE status = $1',
    [query.status]
  );
  return result.rows;
}

// After (with RLS)
async getClients(accountId: string, query: any) {
  const result = await this.db.queryWithAccount(
    accountId,
    'SELECT * FROM clients WHERE status = $1',  // RLS automatically filters by account_id
    [query.status]
  );
  return result.rows;
}
```

### Option 2: Explicit Filtering
Add `account_id` to WHERE clauses manually:

```typescript
async getClients(accountId: string, query: any) {
  const result = await this.db.query(
    'SELECT * FROM clients WHERE account_id = $1 AND status = $2',
    [accountId, query.status]
  );
  return result.rows;
}
```

**Recommendation:** Use Option 1 (RLS) for better security and less code duplication.

## 📋 Implementation Checklist

### Phase 1: CRM Service Update (In Progress)
- [x] Add `account_id` parameter to all service methods
- [ ] Update `getClients()` to use `queryWithAccount()`
- [ ] Update `getClient()` to use `queryWithAccount()`
- [ ] Update `createClient()` to include `account_id`
- [ ] Update `updateClient()` to use `queryWithAccount()`
- [ ] Update `deleteClient()` to use `queryWithAccount()`
- [ ] Repeat for: Employees, Suppliers, Professionals
- [ ] Update all controllers to use `@AccountId()` decorator

### Phase 2: Validation & Error Handling
- [ ] Add `class-validator` decorators to all DTOs
- [ ] Add `@IsUUID()` validation for `account_id` fields
- [ ] Add `ValidationPipe` globally in main.ts
- [ ] Add proper error messages for multi-tenant violations
- [ ] Add logging for account context changes

### Phase 3: Testing
- [ ] Update auth tests with account_id
- [ ] Update CRM tests with account_id
- [ ] Add multi-tenant isolation tests
- [ ] Test RLS policies work correctly
- [ ] Test cross-tenant access is blocked

### Phase 4: API Gateway Updates
- [ ] Ensure JWT validation includes account_id
- [ ] Pass account_id to downstream services
- [ ] Add account_id to request headers
- [ ] Update proxy service to forward account context

## 🔐 Security Considerations

### RLS Benefits
✅ **Automatic tenant isolation** - Database enforces separation
✅ **Prevents coding mistakes** - Can't accidentally access wrong tenant
✅ **Performance** - PostgreSQL optimizes RLS queries
✅ **Audit trail** - Can log account context changes

### Important Notes
⚠️ **Always set account context** before queries
⚠️ **Never trust client-provided account_id** - extract from JWT
⚠️ **Use transactions** for multi-query operations
⚠️ **Test RLS policies** thoroughly before production

## 🧪 Testing Multi-Tenancy

### 1. Create Multiple Accounts
```bash
# Account 1
curl -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user1@account1.com",
    "password": "password123",
    "username": "user1",
    "full_name": "User One"
  }'

# Account 2
curl -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user2@account2.com",
    "password": "password123",
    "username": "user2",
    "full_name": "User Two"
  }'
```

### 2. Create Data in Each Account
```bash
# Login as Account 1 user
TOKEN1=$(curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user1@account1.com", "password": "password123"}' \\
  | jq -r '.access_token')

# Create client in Account 1
curl -X POST http://localhost:3003/clients \\
  -H "Authorization: Bearer $TOKEN1" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Client A", "email": "clienta@example.com"}'

# Login as Account 2 user
TOKEN2=$(curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user2@account2.com", "password": "password123"}' \\
  | jq -r '.access_token')

# Try to access Account 1's data (should fail or return empty)
curl -X GET http://localhost:3003/clients \\
  -H "Authorization: Bearer $TOKEN2"
```

### 3. Verify RLS in Database
```sql
-- Connect to database
psql -U nexo_user -d nexo

-- Set account context
SET app.current_account_id = '<account-1-uuid>';

-- Should only see Account 1 data
SELECT * FROM clients;

-- Change context
SET app.current_account_id = '<account-2-uuid>';

-- Should only see Account 2 data
SELECT * FROM clients;
```

## 📊 Performance Considerations

### Connection Pooling
- Each `queryWithAccount()` gets a client from pool
- Released after query completes
- Consider increasing pool size for high traffic:
  ```typescript
  this.pool = new Pool({
    max: 20,  // Increase from 10
    // ...
  });
  ```

### Caching Strategy
- Cache user data with `account_id` as part of key
- Invalidate cache on account changes
- Example: `user:${accountId}:${userId}`

### Query Optimization
- RLS adds WHERE clause automatically
- Ensure `account_id` columns have indexes
- Monitor query performance with EXPLAIN ANALYZE

## 🚀 Deployment Checklist

### Environment Variables
Ensure these are set in production:
```env
# Database (must support RLS)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=nexo
DB_USER=nexo_user
DB_PASSWORD=strong-password

# JWT (must include account_id in payload)
JWT_SECRET=your-secret-minimum-32-characters
JWT_EXPIRES_IN=15m
```

### Database Setup
1. Run init scripts: `01-init.sql`, `02-rls-policies.sql`
2. Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'clients' AND rowsecurity = true;`
3. Test account isolation before going live

### Service Configuration
1. Update all services to latest code
2. Restart services to pick up changes
3. Monitor logs for RLS-related errors
4. Set up alerts for cross-tenant access attempts

## 📚 Resources

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/sharding)

## 🎯 Summary

**Multi-tenant foundation is COMPLETE!**

✅ Database schema with RLS policies
✅ AuthService creates accounts and includes account_id in JWT
✅ DatabaseService has RLS helper methods
✅ Shared decorators for extracting account_id
✅ Complete testing and deployment guides

**Next Task:** Update CRM service controllers and methods to use `@AccountId()` decorator and `queryWithAccount()` method for full multi-tenant support.
