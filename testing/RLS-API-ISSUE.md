# Known Issue: RLS Not Working Via API (Feb 5, 2026)

## Summary
While RLS (Row-Level Security) works correctly when tested directly in the database, it does not appear to be working correctly when accessed through the API endpoints. Both Account 1 and Account 2 users see identical limited data instead of their account-specific data.

## Expected Behavior
- **Account 1 (TechFlow)**: Should see 5 clients, 4 projects, 9 tasks
- **Account 2 (Creative Minds)**: Should see 3 clients, 3 projects, 5 tasks
- **No Auth/Different Account**: Should see 0 records (complete isolation)

## Actual Behavior
- **Account 1**: Sees 2 clients, 2 projects, 2 tasks
- **Account 2**: Sees 2 clients, 2 projects, 2 tasks (IDENTICAL to Account 1)

## Evidence

### Database-Level RLS (Working ✅)
When testing with `nexo_app_user` (non-superuser) directly in PostgreSQL:

```sql
-- Account 1 context
SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111';
SELECT COUNT(*) FROM clients;  -- Result: 5 ✅

-- Account 2 context  
SET LOCAL app.current_account_id = '22222222-2222-2222-2222-222222222222';
SELECT COUNT(*) FROM clients;  -- Result: 3 ✅

-- No context
SELECT COUNT(*) FROM clients;  -- Result: 0 ✅
```

### API-Level RLS (Not Working ❌)
```bash
# Login as Account 1 admin
TOKEN1=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken')

# Get clients - should return 5, actually returns 2
curl -s -H "Authorization: Bearer $TOKEN1" http://localhost:3003/api/clients | jq 'length'
# Result: 2 ❌
```

## Investigation

### What We Know Works
1. ✅ JWT authentication working
2. ✅ JWT token contains correct `accountId` field
3. ✅ JWT strategy extracts `accountId` from token
4. ✅ `@AccountId()` decorator retrieves `accountId` from request.user
5. ✅ CRM service receives correct `accountId` parameter
6. ✅ Database service `queryWithAccount()` is called with correct `accountId`
7. ✅ Using `nexo_app` (non-superuser) connection string
8. ✅ RLS policies exist and are active on all tables

### Code Flow (Appears Correct)
```typescript
// 1. JWT Strategy extracts accountId
async validate(payload: any) {
  return {
    accountId: payload.accountId || payload.account_id,
    // ...
  };
}

// 2. Controller uses @AccountId() decorator
@Get('clients')
@RequirePermissions('client:read')
getClients(@AccountId() accountId: string, ...) {
  return this.crmService.getClients(accountId, searchDto);
}

// 3. Service calls database with account context
async getClients(accountId: string, searchDto) {
  const result = await this.db.queryWithAccount(
    accountId,
    `SELECT * FROM clients WHERE ...`,
    params
  );
}

// 4. Database service sets RLS context
async queryWithAccount(accountId, query, params) {
  const client = await this.pool.connect();
  await client.query(`SET LOCAL app.current_account_id = '${accountId}'`);
  const result = await client.query(query, params);
  await client.query('RESET app.current_account_id');
  client.release();
  return result;
}
```

### Possible Root Causes

1. **Connection Pooling Issue**: 
   - Session variables (`SET LOCAL`) might not persist across pooled connections
   - Pool might be reusing connections without resetting state
   - Solution: Set context at transaction level, not connection level

2. **Transaction Boundary**:
   - `SET LOCAL` only applies within a transaction
   - Need to wrap in `BEGIN...COMMIT` block
   - Current code might not be in a transaction

3. **Prisma Interference**:
   - Some queries might be going through Prisma ORM instead of raw SQL
   - Prisma might have its own connection pool
   - Need to verify all queries use the wrapped method

4. **Connection String Issue**:
   - Services might be using different connection strings
   - Auth service uses `DATABASE_URL_SUPERUSER` correctly
   - CRM service should use `DATABASE_URL` (nexo_app) ✅

5. **Middleware Missing**:
   - RLS context might need to be set via middleware/interceptor
   - Current approach is per-query, might need per-request

## Debugging Steps

### Immediate Investigation
1. Add debug logging to database service to log:
   - Connection user (current_user)
   - Session variable value before/after SET LOCAL
   - Query results
   - Transaction state

2. Test with explicit transaction wrapping:
```typescript
await client.query('BEGIN');
await client.query(`SET LOCAL app.current_account_id = '${accountId}'`);
// queries...
await client.query('COMMIT');
```

3. Verify actual database user:
```typescript
const userResult = await client.query('SELECT current_user, session_user');
// Should be 'nexo_app', not 'nexo_user'
```

4. Check session variable propagation:
```typescript
await client.query(`SET LOCAL app.current_account_id = '${accountId}'`);
const checkResult = await client.query(`SELECT current_setting('app.current_account_id', true)`);
console.log('Session var value:', checkResult.rows[0]);
```

### Long-term Fixes

1. **Prisma Middleware Approach**:
```typescript
prisma.$use(async (params, next) => {
  if (params.action !== 'executeRaw') {
    // Set RLS context for all Prisma queries
    await prisma.$executeRaw`SET LOCAL app.current_account_id = ${accountId}`;
  }
  return next(params);
});
```

2. **Per-Request Connection**:
   - Create new connection per HTTP request
   - Set RLS context at request middleware level
   - Ensures consistency across all queries in request

3. **Database Function Approach**:
   - Create PostgreSQL function that wraps queries
   - Function sets context and executes query atomically
   - Eliminates race conditions

## Test Files
- `tmp/test-rls-api.sh` - API-level RLS test script
- `testing/test-rls-verification.sql` - Database-level RLS verification
- `tmp/rls-investigation-results.md` - Detailed investigation notes

## Resolution Status
🔴 **UNRESOLVED** - Requires deep investigation into connection pooling and transaction boundaries.

## Timeline
- **Feb 5, 2026 14:00**: RLS verified working at database level  
- **Feb 5, 2026 15:30**: Services built and started successfully
- **Feb 5, 2026 18:00**: Fixed authentication (password hashes)
- **Feb 5, 2026 18:30**: Discovered RLS not working via API
- **Feb 5, 2026 18:45**: Documented issue, proceeding with investigation

## Next Session
Priority: Resolve RLS API issue before proceeding with full test suite.
