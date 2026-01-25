# Security Integration Testing

This document describes the comprehensive security testing suite for the NEXO CRM multi-tenant application.

## Overview

The security integration tests validate:

1. **Multi-tenant data isolation** - Accounts can only access their own data
2. **Row-Level Security (RLS)** - Database policies enforce access control
3. **JWT authentication** - Tokens properly identify account context
4. **Cross-account access prevention** - Users cannot read/modify other accounts' data
5. **CRUD operation security** - Create, Read, Update, Delete operations respect tenant boundaries
6. **Role-Based Access Control (RBAC)** - Users have appropriate permissions

## Test Script

### Local Execution

```bash
# Ensure services are running
cd nexo-prj
pnpm nx serve auth-service &
pnpm nx serve crm-service &

# Run the test suite
cd ..
chmod +x test-security-integration.sh
./test-security-integration.sh
```

### CI/CD Execution

The tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request
- Daily scheduled runs (2 AM UTC)

See `.github/workflows/security-tests.yml` for CI configuration.

## Test Coverage

### 1. Account & User Management
- ✅ Account creation with unique slugs
- ✅ User registration with account association
- ✅ JWT token generation with account claims
- ✅ Multiple users per account support

### 2. Database Integrity
- ✅ Account records created correctly
- ✅ Users mapped to correct accounts
- ✅ No orphaned data without account ownership
- ✅ Foreign key constraints enforced

### 3. Multi-Tenant Data Isolation
- ✅ Account A cannot see Account B's clients
- ✅ GET operations return only tenant's data
- ✅ Search/filter operations respect tenant boundaries
- ✅ Pagination doesn't leak cross-account data

### 4. Cross-Account Access Prevention
- ✅ GET by ID fails for other accounts' resources
- ✅ UPDATE operations blocked on other accounts' data
- ✅ DELETE operations blocked on other accounts' data
- ✅ No data enumeration across accounts

### 5. Row-Level Security (RLS)
- ✅ Database policies enforce account_id filtering
- ✅ SET LOCAL app.current_account_id works correctly
- ✅ RLS applies to SELECT, INSERT, UPDATE, DELETE
- ✅ Superuser can bypass RLS (for admin operations)

### 6. Authentication & Authorization
- ✅ Unauthenticated requests return 401
- ✅ Invalid tokens return 401
- ✅ Expired tokens are rejected
- ✅ JWT secret properly configured across services

### 7. CRUD Operations Security
- ✅ CREATE: New resources assigned to correct account
- ✅ READ: Only account's resources returned
- ✅ UPDATE: Same-account updates succeed, cross-account blocked
- ✅ DELETE: Same-account deletes succeed, cross-account blocked

## Test Scenarios

### Scenario 1: Three Independent Accounts
```
Account Alpha (3 clients)
  └─ Admin user: admin@alpha.test
  └─ Clients: Alpha Client 1, 2, 3

Account Beta (2 clients)
  └─ Admin user: admin@beta.test
  └─ Clients: Beta Client 1, 2

Account Gamma (0 clients)
  └─ Admin user: admin@gamma.test
```

### Scenario 2: Cross-Account Access Attempts
```
❌ Beta tries to GET Alpha's client → 404/403
❌ Beta tries to UPDATE Alpha's client → 404/403
❌ Gamma tries to DELETE Alpha's client → 404/403
✅ Alpha updates own client → Success
✅ Alpha deletes own client → Success
```

### Scenario 3: Data Verification
```
✅ Alpha GET /clients → Returns 3 clients (only Alpha's)
✅ Beta GET /clients → Returns 2 clients (only Beta's)
✅ Gamma GET /clients → Returns 0 clients (none created)
✅ Database has exactly 5 clients total (3+2+0)
```

## Exit Codes

- `0` - All tests passed ✅
- `1` - One or more tests failed ❌

## Test Output

The script provides colored, detailed output:

```
╔════════════════════════════════════════════════╗
║   Multi-Tenant Security Integration Tests     ║
╚════════════════════════════════════════════════╝

[TEST 1] Create Test Accounts and Users
  → Registering Account Alpha with Admin user
✓ Account Alpha - Admin user registered and token received
✓ Account Alpha - Account ID created
...

╔════════════════════════════════════════════════╗
║           TEST EXECUTION SUMMARY               ║
╚════════════════════════════════════════════════╝
✓ Passed: 42
✗ Failed: 0
  Total:  42

╔════════════════════════════════════════════════╗
║  ✓ ALL SECURITY TESTS PASSED SUCCESSFULLY!    ║
╚════════════════════════════════════════════════╝
```

## Cleanup

The test script automatically cleans up all test data:
- Test accounts deleted (cascades to users, clients, etc.)
- No residual test data left in database
- Safe to run repeatedly

## Requirements

### Local Environment
- Docker (for PostgreSQL access)
- curl
- jq (JSON processor)
- bash 4.0+

### CI/CD Environment
- GitHub Actions runner
- PostgreSQL service container
- Node.js 20+
- pnpm

## Troubleshooting

### Tests Failing

1. **Check services are running**
   ```bash
   curl http://localhost:3001/api  # Auth service
   curl http://localhost:3003/api  # CRM service
   ```

2. **Check database connection**
   ```bash
   docker exec nexo-postgres psql -U postgres -d nexo_crm -c "SELECT 1;"
   ```

3. **Review service logs**
   ```bash
   tail -f /tmp/auth-service.log
   tail -f /tmp/crm-service.log
   ```

### Common Issues

**Issue**: 404 on registration endpoint
- **Fix**: Ensure auth service routes are under `/api/auth/` prefix

**Issue**: RLS policy violations
- **Fix**: Check `app.current_account_id` function exists in database
- **Fix**: Verify `SET LOCAL` uses literal string, not parameter binding

**Issue**: JWT validation fails
- **Fix**: Ensure JWT_SECRET matches between auth and CRM services

## Continuous Monitoring

These tests should be:
- ✅ Run on every code change (PR checks)
- ✅ Run before deployment (staging verification)
- ✅ Run daily in production (regression detection)
- ✅ Mandatory for release approval

## Security Compliance

This test suite helps demonstrate compliance with:
- **GDPR** - Data isolation ensures tenant privacy
- **SOC 2** - Automated security testing and audit trails
- **ISO 27001** - Access control verification
- **HIPAA** - Data segregation for healthcare use cases

## Version History

- **v1.0** (2026-01-24) - Initial security test suite
  - Multi-tenant isolation tests
  - CRUD operation security
  - Database RLS verification
  - Authentication & authorization checks
