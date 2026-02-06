# NEXO CRM - Testing Suite Documentation

Comprehensive testing framework for CI/CD pipelines and pre-release validation.

## Overview

This testing suite provides complete coverage of the NEXO CRM system including:
- **Database seed data** with multi-tenant isolation
- **RLS verification** ensuring data security
- **API integration tests** for all endpoints
- **CI/CD automation** for continuous testing
- **Pre-release validation** for deployment readiness

## Quick Start

```bash
# 1. Make scripts executable
chmod +x testing/*.sh

# 2. Run complete CI/CD test suite
./testing/run-ci-tests.sh

# 3. Run pre-release validation before deployment
./testing/run-pre-release-validation.sh
```

## Test Scripts

### 1. seed-test-data.sql
**Purpose:** Populate database with comprehensive test data

**Creates:**
- 5 test accounts (multi-tenant companies)
- 19 users with different roles (Admin, Manager, Employee, Viewer)
- 16 clients across all industries
- 15 projects with varying statuses
- 30+ tasks with assignments
- 16 files with entity associations
- 6 suppliers
- 6 professionals
- Audit logs for activity tracking

**Usage:**
```bash
psql $DATABASE_URL -f testing/seed-test-data.sql
```

**Accounts Created:**
1. **TechFlow Solutions** (Account 1) - Technology startup with 5 users
2. **Creative Minds Agency** (Account 2) - Marketing agency with 4 users
3. **BuildRight Construction** (Account 3) - Construction company with 4 users
4. **HealthCare Plus** (Account 4) - Healthcare provider with 3 users
5. **Industrial Solutions Corp** (Account 5) - Manufacturing with 3 users

**Test Credentials:**
```
Account 1 Admin: admin@techflow.test / test123
Account 2 Admin: admin@creative.test / test123
Account 3 Admin: admin@buildright.test / test123
Account 4 Admin: admin@healthcare.test / test123
Account 5 Admin: admin@industrial.test / test123
```

### 2. test-rls-verification.sql
**Purpose:** Verify Row-Level Security policies work correctly

**Tests:**
- ✅ Account isolation for clients, projects, tasks
- ✅ Cross-account query prevention
- ✅ Public file access
- ✅ Audit log isolation
- ✅ Multi-tenant data integrity
- ✅ 13 comprehensive RLS test cases

**Usage:**
```bash
psql $DATABASE_URL -f testing/test-rls-verification.sql
```

**Expected Output:**
```
✅ PASS: Account 1 user sees only Account 1 clients (5 clients)
✅ PASS: Account 1 user cannot see Account 2 clients
✅ PASS: Cannot query specific client from another account
...
```

### 3. test-api-integration.sh
**Purpose:** Test all REST API endpoints with authentication

**Features:**
- Authentication flow testing
- CRUD operations for all entities
- Cross-account access prevention (RLS enforcement)
- Performance benchmarks
- Response validation

**Tests:**
- 🔐 Authentication (login, token refresh, profile)
- 👥 Client Management (create, read, update, delete, search)
- 📊 Project Management (CRUD, filtering, status updates)
- ✅ Task Management (CRUD, assignment, completion)
- 📁 File Management (upload, download, metadata, search)
- 🏢 Suppliers & Professionals
- ⚡ Performance metrics

**Usage:**
```bash
# Requires running services
export AUTH_SERVICE_URL=http://localhost:3001
export CRM_SERVICE_URL=http://localhost:3002

chmod +x testing/test-api-integration.sh
./testing/test-api-integration.sh
```

**Sample Output:**
```
========================================
AUTHENTICATION TESTS
========================================
✅ PASS: Login as Account 1 Admin
✅ PASS: Account 1 token obtained
✅ PASS: Login with invalid credentials (should fail)
...

Total Tests: 42
Passed: 40
Failed: 0
```

### 4. run-ci-tests.sh
**Purpose:** Complete CI/CD test automation

**Stages:**
1. **Environment Setup** - Check tools, dependencies
2. **Database Setup** - Migrations, seed data
3. **Unit Tests** - Jest tests for all modules
4. **Build Verification** - TypeScript compilation
5. **Start Services** - auth-service, crm-service
6. **RLS Verification** - Security policy tests
7. **API Integration** - Endpoint testing
8. **Cleanup** - Stop services, generate report

**Usage:**
```bash
# Full CI/CD suite
chmod +x testing/run-ci-tests.sh
./testing/run-ci-tests.sh

# With custom database
export DATABASE_URL=postgresql://user:pass@host:5432/db
./testing/run-ci-tests.sh

# Skip database cleanup
export SKIP_DB_CLEANUP=true
./testing/run-ci-tests.sh
```

**Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║          NEXO CRM - CI/CD AUTOMATED TEST SUITE                  ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 STAGE 1: Environment Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
✅ SUCCESS: All CI/CD tests passed!
```

**Results Location:**
- Test reports: `./tmp/ci-test-results/`
- Build logs: `./tmp/ci-test-results/build-*.log`
- Test logs: `./tmp/ci-test-results/*-tests-*.log`
- Main report: `./tmp/ci-test-results/ci-report-TIMESTAMP.md`

### 5. run-pre-release-validation.sh
**Purpose:** Final validation before production deployment

**Checks:**
1. **Security Audit** (Critical)
   - Hardcoded secrets/credentials
   - .env files in repository
   - .gitignore configuration
   - npm vulnerabilities
   - JWT secret strength

2. **Configuration Validation**
   - Environment files
   - package.json consistency
   - TypeScript configuration
   - Nx workspace setup
   - Docker configuration

3. **Database Integrity** (Critical)
   - Connection test
   - Required tables
   - RLS policies enabled
   - Orphaned records
   - Index coverage

4. **Build & Code Quality**
   - TypeScript compilation
   - Linting
   - TODO/FIXME comments
   - Test coverage

5. **Performance Benchmarks**
   - Bundle sizes
   - Dependencies size
   - Production optimizations

6. **Documentation**
   - README files
   - API documentation (Swagger)
   - Environment variables
   - Migration docs

7. **Deployment Readiness**
   - Production config
   - CI/CD configuration
   - Health checks
   - Logging setup
   - Error handling

**Usage:**
```bash
chmod +x testing/run-pre-release-validation.sh
./testing/run-pre-release-validation.sh
```

**Exit Codes:**
- `0` - ✅ Ready for production deployment
- `1` - ⚠️  Deployment not recommended (review issues)
- `2` - 🚨 Deployment blocked (critical failures)

**Sample Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║          NEXO CRM - PRE-RELEASE VALIDATION                      ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 SECURITY AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PASS: No hardcoded secrets detected
✅ PASS: No .env files in repository
✅ PASS: .gitignore properly configured
...

════════════════════════════════════════════════════════
                  FINAL RESULTS
════════════════════════════════════════════════════════

Total Checks: 45
Passed: 43
Failed: 2
Warnings: 5
Success Rate: 95%

╔══════════════════════════════════════════════════════╗
║          ✅ READY FOR PRODUCTION DEPLOYMENT ✅       ║
╚══════════════════════════════════════════════════════╝
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: CI/CD Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: nexo_crm_test
          POSTGRES_USER: nexo_user
          POSTGRES_PASSWORD: nexo_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Run CI Tests
        env:
          DATABASE_URL: postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm_test
        run: ./testing/run-ci-tests.sh
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: tmp/ci-test-results/
```

### GitLab CI

```yaml
stages:
  - test
  - validate

ci-tests:
  stage: test
  image: node:20
  services:
    - postgres:16-alpine
  variables:
    POSTGRES_DB: nexo_crm_test
    POSTGRES_USER: nexo_user
    POSTGRES_PASSWORD: nexo_password
    DATABASE_URL: "postgresql://nexo_user:nexo_password@postgres:5432/nexo_crm_test"
  script:
    - npm install -g pnpm
    - ./testing/run-ci-tests.sh
  artifacts:
    paths:
      - tmp/ci-test-results/
    when: always

pre-release-validation:
  stage: validate
  image: node:20
  only:
    - main
    - develop
  script:
    - npm install -g pnpm
    - ./testing/run-pre-release-validation.sh
  allow_failure: false
```

## Test Data Reference

### Account IDs
- Account 1 (TechFlow): `11111111-1111-1111-1111-111111111111`
- Account 2 (Creative): `22222222-2222-2222-2222-222222222222`
- Account 3 (BuildRight): `33333333-3333-3333-3333-333333333333`
- Account 4 (HealthCare): `44444444-4444-4444-4444-444444444444`
- Account 5 (Industrial): `55555555-5555-5555-5555-555555555555`

### User Roles
- **Admin**: Full system access (`*:*`)
- **Manager**: Read/Write access (no delete)
- **Employee**: Read and Create access
- **Viewer**: Read-only access

### Sample Entity IDs

**Clients:**
- Acme Corporation: `c1111111-1111-1111-1111-111111111111`
- Fashion Brand EU: `c2222222-2222-2222-2222-222222222221`
- Property Developers: `c3333333-3333-3333-3333-333333333331`

**Projects:**
- Acme CRM Implementation: `pr111111-1111-1111-1111-111111111111`
- Fashion Campaign: `pr222222-2222-2222-2222-222222222221`
- Riverside Development: `pr333333-3333-3333-3333-333333333331`

**Files:**
- Project Proposal: `f1111111-1111-1111-1111-111111111111`
- Campaign Brief: `f2222222-2222-2222-2222-222222222221`
- Site Plans: `f3333333-3333-3333-3333-333333333331`

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check credentials
echo $DATABASE_URL
```

### Service Not Starting

```bash
# Check logs
tail -f tmp/ci-test-results/auth-service-*.log
tail -f tmp/ci-test-results/crm-service-*.log

# Check ports
lsof -i :3001  # auth-service
lsof -i :3002  # crm-service

# Kill existing processes
pkill -f "nx serve"
```

### RLS Tests Failing

```bash
# Check RLS is enabled
psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';"

# Check policies exist
psql $DATABASE_URL -c "SELECT schemaname, tablename, policyname FROM pg_policies;"

# Re-apply migrations
psql $DATABASE_URL -f nexo-prj/database/migrations/sql/20260126_1100_phase6_rbac.sql
```

### API Tests Failing

```bash
# Check services are healthy
curl http://localhost:3001/health
curl http://localhost:3002/health

# Test authentication directly
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techflow.test","password":"test123"}'

# Check service logs for errors
cat tmp/ci-test-results/crm-service-*.log | grep ERROR
```

## Best Practices

### Before Committing Code

```bash
# 1. Run unit tests
pnpm nx test crm-service

# 2. Run RLS verification
psql $DATABASE_URL -f testing/test-rls-verification.sql

# 3. Check for hardcoded secrets
grep -r "password.*=.*\"" nexo-prj/apps --exclude-dir=node_modules
```

### Before Merging to Main

```bash
# Run complete CI/CD suite
./testing/run-ci-tests.sh

# Verify exit code
echo $?  # Should be 0
```

### Before Production Deployment

```bash
# Run pre-release validation
./testing/run-pre-release-validation.sh

# Review report
cat tmp/pre-release-results/pre-release-report-*.md

# Only deploy if exit code is 0
```

## Continuous Monitoring

### Test Coverage Goals
- Unit Tests: > 80%
- Integration Tests: > 70%
- RLS Tests: 100% (all policies)
- API Tests: 100% (all endpoints)

### Performance Benchmarks
- API Response Time: < 1000ms
- Database Queries: < 500ms
- Build Time: < 5 minutes
- Test Suite: < 10 minutes

## Contributing

When adding new features:

1. ✅ Add unit tests
2. ✅ Add integration tests
3. ✅ Update seed data if needed
4. ✅ Update RLS tests for new tables
5. ✅ Update API tests for new endpoints
6. ✅ Run full CI/CD suite
7. ✅ Run pre-release validation

## License

Part of NEXO CRM System - Internal Testing Framework
