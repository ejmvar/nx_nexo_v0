# Quick Reference - Security Testing

## 🚀 One-Line Test Execution

```bash
./test-security-integration.sh
```

**Expected Output**:
```
✅ ALL SECURITY TESTS PASSED SUCCESSFULLY!
✓ Passed: 31 | ✗ Failed: 0 | Total: 14
```

---

## 📋 Pre-Deployment Checklist

### Before Pushing Code

```bash
# 1. Services running?
curl http://localhost:3001/api && curl http://localhost:3003/api

# 2. Run security tests
./test-security-integration.sh

# 3. Only if tests pass:
git push origin feature/your-branch
```

### Before Merging PR

- [ ] All unit tests pass
- [ ] Security tests pass (31/31)
- [ ] Code review approved
- [ ] No linting errors
- [ ] Documentation updated

---

## 🛡️ Security Test Coverage

| Category | Tests | Critical |
|----------|-------|----------|
| Account Isolation | 6 | ✅ YES |
| Cross-Account Prevention | 5 | ✅ YES |
| Database RLS | 4 | ✅ YES |
| Authentication | 4 | ✅ YES |
| CRUD Security | 8 | ✅ YES |
| JWT Validation | 4 | ⚠️ Important |

**Total**: 31 automated tests

---

## 🔍 Quick Debugging

### Test Failed?

```bash
# Check service logs
tail -f /tmp/auth-service.log
tail -f /tmp/crm-service.log

# Verify database
docker exec nexo-postgres psql -U postgres -d nexo_crm -c "
  SELECT a.name, COUNT(c.id) 
  FROM accounts a 
  LEFT JOIN clients c ON c.account_id = a.id 
  GROUP BY a.name;
"

# Manual cleanup if needed
docker exec nexo-postgres psql -U postgres -d nexo_crm -c "
  DELETE FROM accounts WHERE slug LIKE 'test-company-%';
"
```

### Services Not Starting?

```bash
# Start services manually
cd nexo-prj

# Terminal 1: Auth Service
pnpm nx serve auth-service

# Terminal 2: CRM Service  
pnpm nx serve crm-service

# Terminal 3: Run tests
cd .. && ./test-security-integration.sh
```

---

## 📊 What Each Test Validates

### ✅ Multi-Tenant Isolation
```
Account A → GET /clients → Only sees Account A's clients
Account B → GET /clients → Only sees Account B's clients
Account C → GET /clients → Sees 0 clients (none created)
```

### ✅ Cross-Account Protection
```
Account B → GET /clients/{account-A-client-id} → ❌ 404
Account A → UPDATE /clients/{account-B-client-id} → ❌ 403
Account C → DELETE /clients/{account-A-client-id} → ❌ 403
```

### ✅ Same-Account Operations
```
Account A → UPDATE /clients/{own-client-id} → ✅ 200 OK
Account A → DELETE /clients/{own-client-id} → ✅ 200/204
```

---

## 🔐 Security Assertions

### Database Level
```sql
-- RLS Policy Active
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'clients';

-- Context Function Works
SELECT current_user_account_id();

-- Data Isolated
SELECT COUNT(*) FROM clients 
WHERE account_id = 'account-a-uuid';
```

### API Level
```bash
# Unauthenticated → 401
curl http://localhost:3003/api/clients
# {"statusCode": 401}

# Invalid Token → 401
curl -H "Authorization: Bearer invalid" \
  http://localhost:3003/api/clients
# {"statusCode": 401}

# Valid Token, Different Account → 404
curl -H "Authorization: Bearer $ACCOUNT_B_TOKEN" \
  http://localhost:3003/api/clients/$ACCOUNT_A_CLIENT
# {"statusCode": 404}
```

---

## ⚙️ Environment Variables

### Required for Tests

```bash
# Service URLs
AUTH_URL=http://localhost:3001
CRM_URL=http://localhost:3003

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexo_crm
DB_USER=postgres

# JWT (must match services)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

### Verify Configuration

```bash
# Check auth service env
grep JWT nexo-prj/apps/auth-service/.env.local

# Check CRM service env
grep JWT nexo-prj/apps/crm-service/.env.local

# Must match!
```

---

## 🎯 Critical Success Metrics

### Must Be 100%

- ✅ Account isolation tests
- ✅ Cross-account access blocked
- ✅ RLS enforcement
- ✅ JWT validation
- ✅ Unauthenticated requests blocked

### Pipeline Blocking

If ANY of these fail → **Deployment BLOCKED**:
1. Cross-account GET returns data
2. Cross-account UPDATE succeeds
3. Cross-account DELETE succeeds
4. Unauthenticated request succeeds
5. RLS policy not enforced

---

## 📞 CI/CD Integration

### GitHub Actions

```yaml
# Runs on:
- Push to main/develop
- Pull requests
- Daily at 2 AM UTC

# Workflow file:
.github/workflows/security-tests.yml
```

### Manual Trigger

```bash
# From GitHub UI:
Actions → Security Integration Tests → Run workflow
```

---

## 🚨 Common Failures & Fixes

### "Account already exists"
**Cause**: Previous test didn't cleanup  
**Fix**: 
```bash
docker exec nexo-postgres psql -U postgres -d nexo_crm -c "
  DELETE FROM accounts WHERE slug LIKE 'test-company-%';
"
```

### "Cannot connect to service"
**Cause**: Service not running  
**Fix**:
```bash
cd nexo-prj
pnpm nx serve auth-service &
pnpm nx serve crm-service &
sleep 10
```

### "RLS policy violation"
**Cause**: SET LOCAL not working  
**Fix**: Check [database.service.ts](nexo-prj/apps/crm-service/src/database/database.service.ts#L60-L74) uses literal string, not parameter

---

## 📚 Documentation Links

- **Full Testing Guide**: [SECURITY-TESTING.md](SECURITY-TESTING.md)
- **CI/CD Pipeline**: [CI-CD-PIPELINE.md](CI-CD-PIPELINE.md)
- **Implementation Summary**: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 💡 Tips

### Speed Up Local Testing

```bash
# Keep services running in separate terminals
# Only restart when code changes

# Terminal 1: Auth (keep running)
cd nexo-prj && pnpm nx serve auth-service

# Terminal 2: CRM (keep running)
cd nexo-prj && pnpm nx serve crm-service

# Terminal 3: Run tests repeatedly
while true; do
  ./test-security-integration.sh && break
  sleep 5
done
```

### Test Specific Scenarios

```bash
# Edit test script to skip tests:
# Comment out tests you don't need during development
# Remember to uncomment before committing!
```

### Verbose Output

```bash
# Add to test script for debugging:
set -x  # Show all commands
```

---

## ✅ Quick Validation

### Is Everything Working?

Run this one command:
```bash
./test-security-integration.sh && echo "✅ READY TO DEPLOY"
```

If you see:
```
╔════════════════════════════════════════════════╗
║  ✓ ALL SECURITY TESTS PASSED SUCCESSFULLY!    ║
╚════════════════════════════════════════════════╝
✅ READY TO DEPLOY
```

**You're good to go! 🚀**

---

*Last Updated: January 24, 2026*  
*Version: 1.0*
