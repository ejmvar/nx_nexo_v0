# Test Scripts

This directory contains automated test scripts for the NEXO CRM system.

## Attachment System Tests

### Overview

The `test-attachments.sh` script provides comprehensive end-to-end testing of the file upload/attachment system.

### Prerequisites

Before running the tests, ensure:

1. **Services are running:**
   - Auth Service (default: `http://localhost:3001`)
   - CRM Service (default: `http://localhost:3003`)
   - PostgreSQL database
   - Redis cache
   - RabbitMQ message broker

2. **Required tools installed:**
   - `curl` - For HTTP requests
   - `jq` - For JSON parsing
   - `bash` - Shell interpreter

3. **Database migrations applied:**
   ```bash
   docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < database/migrations/011-attachments-table.sql
   ```

### Running the Tests

#### Basic Usage

```bash
cd nexo-prj
./scripts/test-attachments.sh
```

#### With Custom Service URLs

```bash
AUTH_SERVICE_URL=http://localhost:3001 \
CRM_SERVICE_URL=http://localhost:3003 \
./scripts/test-attachments.sh
```

#### In CI/CD Pipeline

The tests are automatically run in GitHub Actions:

```yaml
# See .github/workflows/ci.yml
- name: Run attachments E2E tests
  run: bash scripts/test-attachments.sh
```

### Test Coverage

The script performs the following tests:

1. **Upload Small Text File** - Validates basic file upload functionality
2. **Upload Large File (>10MB)** - Verifies size limit enforcement
3. **Upload Invalid MIME Type** - Checks MIME type validation
4. **List Attachments** - Tests attachment listing and filtering
5. **Get Attachment Metadata** - Verifies metadata retrieval
6. **Download Attachment** - Tests file download and content integrity
7. **Get Statistics** - Validates statistics endpoint
8. **Delete Attachment** - Verifies deletion from disk and database
9. **Upload Without Authentication** - Tests authentication enforcement
10. **Multiple File Uploads** - Validates batch operations

### Expected Output

Successful test run:

```
╔═══════════════════════════════════════════════════════════════╗
║         Attachments System Comprehensive Test Suite          ║
╚═══════════════════════════════════════════════════════════════╝

[INFO] Auth Service: http://localhost:3001
[INFO] CRM Service: http://localhost:3003
[INFO] Test User: attachment-test-1738012345@test.com

═══════════════════════════════════════════════════════
  Test 1: Upload Small Text File
═══════════════════════════════════════════════════════
[✓PASS] Small file uploaded successfully (ID: uuid...)
[✓PASS] File size correct: 60 bytes
[✓PASS] MIME type correct: text/plain

...

═══════════════════════════════════════════════════════
  Test Summary
═══════════════════════════════════════════════════════

  Total Tests:  25
  Passed:       25
  Failed:       0

╔═══════════════════════════════════════════════════════════════╗
║                  ALL TESTS PASSED! ✓                          ║
╚═══════════════════════════════════════════════════════════════╝
```

### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_SERVICE_URL` | `http://localhost:3001` | Auth service endpoint |
| `CRM_SERVICE_URL` | `http://localhost:3003` | CRM service endpoint |
| `TEST_USER_EMAIL` | Generated | Email for test user |
| `TEST_USER_PASSWORD` | `Test123!` | Password for test user |

### Temporary Files

The script creates temporary test files in `/tmp/tmp.XXXXXX/`:

- `test-small.txt` - Small text file (60 bytes)
- `test-image.jpg` - Fake image file (1KB)
- `test-document.pdf` - Fake PDF file (100KB)
- `test-large.bin` - Large file (11MB, exceeds limit)
- `test-invalid.exe` - Invalid file type
- `downloaded-file` - Downloaded file for verification

All temporary files are automatically cleaned up on exit.

### Troubleshooting

#### Services Not Running

```
[✗FAIL] Failed to register user or get access token
```

**Solution:** Start the required services:

```bash
# Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# Start services
cd nexo-prj
pnpm nx serve auth-service &
pnpm nx serve crm-service &
```

#### Database Migration Not Applied

```
ERROR:  relation "attachments" does not exist
```

**Solution:** Apply the migration:

```bash
docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < database/migrations/011-attachments-table.sql
```

#### Permission Errors

```
[✗FAIL] Insufficient permissions. Required: attachment:create
```

**Solution:** Ensure the test user has proper permissions. The script creates users with Admin role by default.

#### Port Conflicts

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3003
```

**Solution:** Kill processes using the required ports:

```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:3003 | xargs kill -9
```

### Log Analysis

Test logs include structured logging for analysis:

```bash
# View test execution
grep "\[INFO\]" test-output.log

# View passed tests
grep "\[✓PASS\]" test-output.log

# View failed tests
grep "\[✗FAIL\]" test-output.log

# View warnings
grep "\[WARN\]" test-output.log
```

### Integration with CI/CD

The test script is integrated into the CI/CD pipeline:

**GitHub Actions** (`.github/workflows/ci.yml`):

```yaml
- name: Run attachments E2E tests
  working-directory: nexo-prj
  env:
    AUTH_SERVICE_URL: http://localhost:3001
    CRM_SERVICE_URL: http://localhost:3003
    MAX_FILE_SIZE: 10485760
    UPLOAD_DIR: ./uploads
  run: bash scripts/test-attachments.sh
```

**Local CI simulation:**

```bash
# Same as CI would run
cd nexo-prj
MAX_FILE_SIZE=10485760 \
UPLOAD_DIR=./uploads \
bash scripts/test-attachments.sh
```

### Best Practices

1. **Run tests before commits:**
   ```bash
   # Pre-commit hook
   ./scripts/test-attachments.sh || exit 1
   ```

2. **Run tests after changes to:**
   - AttachmentsService
   - AttachmentsController
   - Database migrations
   - Authentication/permissions

3. **Check service logs on failure:**
   ```bash
   # View CRM service logs
   tail -f /tmp/crm-service.log

   # View auth service logs
   tail -f /tmp/auth-service.log
   ```

4. **Re-run specific test scenarios:**
   ```bash
   # Edit script to comment out other tests
   # Keep only the test you want to debug
   ```

### Performance Benchmarks

Expected execution times:

- Authentication setup: ~2 seconds
- Each upload test: ~0.5 seconds
- Download test: ~0.2 seconds
- Delete test: ~0.3 seconds
- **Total execution time: ~10-15 seconds**

### Contributing

When adding new attachment features:

1. Add corresponding test cases to `test-attachments.sh`
2. Update test coverage documentation
3. Ensure tests pass in CI/CD
4. Update this README with new test descriptions

## Other Test Scripts

### Coming Soon

- `test-auth.sh` - Authentication system tests
- `test-crm.sh` - CRM operations tests
- `test-websockets.sh` - Real-time updates tests
- `test-cache.sh` - Redis caching tests

## Support

For issues or questions:
- Check service logs: `/tmp/crm-service.log`, `/tmp/auth-service.log`
- Review [ATTACHMENTS.md](../apps/crm-service/ATTACHMENTS.md)
- Check database connection: `docker exec -it nexo-postgres psql -U nexo_user -d nexo_crm`
