# CI/CD Pipeline Configuration

## Overview

This document describes the comprehensive CI/CD pipeline for the NEXO CRM multi-tenant application, including mandatory security testing, deployment workflows, and quality gates.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Code Push / PR                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: Code Quality                                      │
│  ├─ Lint (ESLint)                                          │
│  ├─ Type Check (TypeScript)                                │
│  └─ Format Check (Prettier)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Unit Tests                                        │
│  ├─ Auth Service Unit Tests                                │
│  ├─ CRM Service Unit Tests                                 │
│  └─ Coverage Report (>80% required)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: Build & Compile                                   │
│  ├─ Build Auth Service                                     │
│  ├─ Build CRM Service                                      │
│  ├─ Build API Gateway                                      │
│  └─ Generate Prisma Client                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: MANDATORY Security Tests                          │
│  ├─ Multi-Tenant Isolation Tests                           │
│  ├─ Cross-Account Access Prevention                        │
│  ├─ Row-Level Security (RLS) Verification                  │
│  ├─ Authentication & Authorization Tests                   │
│  ├─ CRUD Operation Security                                │
│  └─ Database Integrity Checks                              │
│  ⚠️  BLOCKING: Pipeline fails if any test fails            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 5: Integration Tests                                 │
│  ├─ API Integration Tests                                  │
│  ├─ Database Migration Tests                               │
│  └─ Service Communication Tests                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 6: Container Build                                   │
│  ├─ Build Docker Images                                    │
│  ├─ Security Scan (Trivy/Snyk)                             │
│  └─ Push to Registry                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 7: Deployment                                        │
│  ├─ Deploy to Staging                                      │
│  ├─ Run Smoke Tests                                        │
│  ├─ Deploy to Production (on approval)                     │
│  └─ Post-Deployment Verification                           │
└─────────────────────────────────────────────────────────────┘
```

## Mandatory Security Tests

### Test Execution

**When**: Run on every commit, PR, and before deployment  
**Duration**: ~2-3 minutes  
**Blocking**: YES - Pipeline fails if any security test fails  
**Script**: `test-security-integration.sh`

### Test Coverage

#### 1. Multi-Tenant Isolation (Critical)
```bash
✓ Account A cannot see Account B's data
✓ Account B cannot see Account C's data  
✓ Search operations respect tenant boundaries
✓ Pagination doesn't leak cross-account data
```

#### 2. Access Control (Critical)
```bash
✓ Unauthenticated requests return 401
✓ Invalid tokens return 401
✓ Cross-account GET returns 404/403
✓ Cross-account UPDATE blocked
✓ Cross-account DELETE blocked
```

#### 3. Database Security (Critical)
```bash
✓ RLS policies enforce account_id filtering
✓ SET LOCAL app.current_account_id works
✓ No orphaned data without account ownership
✓ Foreign key constraints enforced
```

#### 4. JWT Security (Important)
```bash
✓ Tokens include accountId claim
✓ Token validation works across services
✓ Expired tokens are rejected
```

#### 5. CRUD Security (Important)
```bash
✓ CREATE assigns correct account_id
✓ READ returns only tenant's data
✓ UPDATE works for same-account only
✓ DELETE works for same-account only
```

### Success Criteria

```bash
╔════════════════════════════════════════════════╗
║  ✓ ALL SECURITY TESTS PASSED SUCCESSFULLY!    ║
╚════════════════════════════════════════════════╝
✓ Passed: 31
✗ Failed: 0
  Total:  14
```

**Exit Code**: 0 = Pass, 1 = Fail (blocks pipeline)

## GitHub Actions Workflows

### 1. Security Tests Workflow

**File**: `.github/workflows/security-tests.yml`

**Triggers**:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Daily schedule (2 AM UTC)
- Manual trigger

**Environment**:
- Node.js 20
- PostgreSQL 16 (service container)
- pnpm 8

**Steps**:
1. Setup PostgreSQL service
2. Install dependencies
3. Run database migrations
4. Start auth service (background)
5. Start CRM service (background)
6. Execute security test suite
7. Upload logs on failure

### 2. Full CI Pipeline (Recommended)

```yaml
name: Full CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm nx affected --target=lint
      - run: pnpm nx affected --target=format:check

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-format
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm nx affected --target=test --coverage

  build:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm nx affected --target=build

  security-tests:
    runs-on: ubuntu-latest
    needs: build
    # See .github/workflows/security-tests.yml for full implementation

  deploy-staging:
    runs-on: ubuntu-latest
    needs: security-tests
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to Staging
        run: ./deploy-staging.sh

  deploy-production:
    runs-on: ubuntu-latest
    needs: security-tests
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://app.example.com
    steps:
      - name: Deploy to Production
        run: ./deploy-production.sh
```

## Local Development Testing

### Pre-Commit Checks

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# Lint
pnpm nx affected --target=lint --uncommitted
if [ $? -ne 0 ]; then
  echo "❌ Lint failed"
  exit 1
fi

# Type check
pnpm nx affected --target=type-check --uncommitted
if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

# Unit tests
pnpm nx affected --target=test --uncommitted
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### Pre-Push Security Tests

```bash
#!/bin/bash
# .git/hooks/pre-push

echo "Running security tests before push..."

cd "$(git rev-parse --show-toplevel)"

# Ensure services are running
if ! curl -sf http://localhost:3001/api > /dev/null; then
  echo "⚠️  Starting auth service..."
  cd nexo-prj && pnpm nx serve auth-service &
  sleep 5
fi

if ! curl -sf http://localhost:3003/api > /dev/null; then
  echo "⚠️  Starting CRM service..."
  cd nexo-prj && pnpm nx serve crm-service &
  sleep 5
fi

# Run security tests
./test-security-integration.sh

if [ $? -ne 0 ]; then
  echo "❌ Security tests failed - push blocked"
  exit 1
fi

echo "✅ Security tests passed"
```

## Deployment Gates

### Staging Deployment

**Requirements**:
- ✅ All unit tests pass
- ✅ All security tests pass
- ✅ Build successful
- ✅ No critical vulnerabilities
- ✅ Code review approved (1+ approver)

**Auto-Deploy**: On merge to `develop`

### Production Deployment

**Requirements**:
- ✅ All staging requirements
- ✅ Staging deployment successful
- ✅ Smoke tests pass on staging
- ✅ Security tests pass on staging environment
- ✅ Manual approval from team lead
- ✅ Release notes documented

**Auto-Deploy**: On merge to `main` (after approval)

## Monitoring & Alerts

### Test Failure Notifications

```yaml
# .github/workflows/security-tests.yml (excerpt)
jobs:
  security-tests:
    steps:
      - name: Notify on Failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚨 Security tests failed!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Security Test Failure* \n Branch: ${{ github.ref }} \n Commit: ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Daily Security Test Reports

**Schedule**: Daily at 2 AM UTC  
**Purpose**: Detect regressions in production-like environment  
**Notification**: Email + Slack on failure

## Test Data Management

### Cleanup Strategy

All security tests use disposable test data:
- Test accounts created: `test-company-alpha`, `test-company-beta`, `test-company-gamma`
- Automatic cleanup on test completion (success or failure)
- No impact on production data
- Idempotent - safe to run multiple times

### Database Seeding for Tests

```sql
-- Test accounts and users are created via API during tests
-- No manual seeding required
-- All test data automatically cleaned up
```

## Security Test Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| Test Success Rate | 100% | < 100% blocks deploy |
| Test Execution Time | < 3 min | > 5 min (investigate) |
| Account Isolation Tests | All pass | 1 failure blocks |
| Cross-Account Access Tests | All blocked | 1 leak blocks |
| RLS Enforcement | 100% | < 100% blocks |

### Test Coverage Requirements

- Multi-tenant isolation: **100%** (all scenarios)
- CRUD operations: **100%** (all operations)
- Authentication: **100%** (all endpoints)
- Authorization: **100%** (all access levels)

## Rollback Procedures

### If Security Tests Fail in Production

1. **Immediate**:
   ```bash
   # Rollback to previous version
   kubectl rollout undo deployment/crm-service
   kubectl rollout undo deployment/auth-service
   ```

2. **Investigation**:
   ```bash
   # Check logs
   kubectl logs -f deployment/crm-service --tail=200
   
   # Run security tests against live environment
   AUTH_URL=https://staging.example.com \
   CRM_URL=https://staging.example.com \
   ./test-security-integration.sh
   ```

3. **Fix & Redeploy**:
   - Fix identified issue
   - Re-run full test suite locally
   - Create new PR with fix
   - Wait for CI to pass
   - Deploy through normal pipeline

## Best Practices

### ✅ DO

- Run security tests before every deployment
- Treat test failures as critical incidents
- Keep test suite up-to-date with new features
- Monitor test execution time
- Add tests for new security-sensitive features
- Run tests against staging before production
- Review test logs on failures
- Keep test environment synchronized with production

### ❌ DON'T

- Skip security tests to speed up deployment
- Deploy if any security test fails
- Use production data in tests
- Modify tests to "make them pass"
- Ignore intermittent test failures
- Run tests only in CI (test locally too)
- Disable tests temporary "to fix later"

## Compliance & Audit

### Audit Trail

All security test runs are logged:
- Timestamp
- Git commit SHA
- Test results (pass/fail)
- Execution environment
- Test output (retained for 90 days)

### Compliance Reports

**Quarterly Security Report** includes:
- Security test pass rate
- Any security test failures (with resolution)
- New security tests added
- Changes to security policies
- Access control verification results

## Support & Troubleshooting

### Common Issues

1. **Test Timeout**
   - Increase timeout in test script
   - Check service startup time
   - Verify database connection

2. **Flaky Tests**
   - Add retry logic with exponential backoff
   - Improve test isolation
   - Check for timing issues

3. **Environment Differences**
   - Ensure test environment matches production
   - Verify all environment variables
   - Check database version compatibility

### Getting Help

- Documentation: `SECURITY-TESTING.md`
- Test Script: `test-security-integration.sh`
- Issues: GitHub Issues with `security` label
- Slack: #security-testing channel

## Version History

- **v1.0** (2026-01-24) - Initial CI/CD pipeline with mandatory security tests
  - Comprehensive security test suite
  - GitHub Actions workflows
  - Deployment gates
  - Monitoring and alerts
