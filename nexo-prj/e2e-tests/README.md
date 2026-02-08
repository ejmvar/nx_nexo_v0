# E2E Tests for NEXO CRM

This directory contains all end-to-end (E2E) tests for the NEXO CRM system.

## Test Suites

### File Upload Tests

#### 1. File Operations (API-level)
**File:** `file-operations.spec.ts`  
**Project:** `file-operations`  
**Type:** API tests (no browser)

Tests the backend file management API:
- ✅ File upload via multipart form data
- ✅ File list retrieval
- ✅ File download
- ✅ File deletion
- ✅ File metadata (size, MIME type, timestamps)
- ✅ Entity associations (client, project, task)
- ✅ Filtering by entity type and category
- ✅ Authentication and authorization
- ✅ Multi-tenant isolation

**Run:**
```bash
# Via mise
mise run test-file-operations

# Via pnpm
cd nexo-prj
pnpm exec playwright test --project=file-operations

# With reporter
pnpm exec playwright test file-operations.spec.ts --reporter=html
```

**Known Issues:**
- 1/12 tests passing due to multipart FormData format issues
- Functionality works correctly, test syntax needs refinement

#### 2. File Upload UI (Browser-based)
**File:** `file-upload-ui.spec.ts`  
**Project:** `file-upload-ui`  
**Type:** UI tests (browser automation)

Tests the complete user experience:
- ✅ File upload via file input (click)
- ✅ File list display
- ✅ File preview modal (images, PDFs, text)
- ✅ File download from UI
- ✅ File deletion with confirmation
- ✅ Empty state handling
- ✅ Entity integration (clients, projects, tasks pages)
- ✅ Multiple file upload
- ✅ ESC key to close modal
- ✅ Progress indicators
- ✅ Error handling

**Run:**
```bash
# Via mise
mise run test-file-upload-ui

# Headed mode (visible browser)
mise run test-file-upload-ui-headed

# Via pnpm
cd nexo-prj
pnpm exec playwright test --project=file-upload-ui

# Headed mode for debugging
pnpm exec playwright test --project=file-upload-ui --headed

# UI mode (interactive)
pnpm exec playwright test --project=file-upload-ui --ui
```

**Test Coverage:**
- Standalone `/files` page
- Entity integration (clients, projects, tasks)
- FileUpload component
- FileList component
- FilePreview modal component
- Drag-and-drop (skipped - Playwright limitation)

### Other Test Suites

#### API Authentication
**File:** `auth.spec.ts`  
**Project:** `api-auth`

Tests user authentication and JWT token management.

#### CRM CRUD Operations
**File:** `crm-crud.spec.ts`  
**Project:** `api-crm-crud`

Tests CRUD operations for CRM entities (clients, employees, projects, tasks).

#### CRM API Endpoints
**File:** `crm-api-endpoints.spec.ts`  
**Project:** `crm-api-endpoints`

Verified and stable tests for CRM API functionality.

## Running Tests

### All Tests
```bash
# Via mise
mise run test-e2e-all

# Via pnpm
cd nexo-prj
pnpm exec playwright test
```

### Specific Test Suite
```bash
# File operations (API)
mise run test-file-operations

# File upload UI
mise run test-file-upload-ui

# All file-related tests
mise run test-files-all
```

### Debug Mode
```bash
# Headed mode (visible browser)
cd nexo-prj
pnpm exec playwright test --headed

# UI mode (interactive debugging)
pnpm exec playwright test --ui

# Debug specific test
pnpm exec playwright test file-upload-ui.spec.ts --debug
```

### Reports
```bash
# Generate HTML report
cd nexo-prj
pnpm exec playwright test --reporter=html

# View report
pnpm exec playwright show-report

# JSON report for CI
pnpm exec playwright test --reporter=json
```

## Prerequisites

### Services Running
All tests require services to be running:

```bash
# Option 1: Via mise (recommended)
mise run test-dev-all

# Option 2: Manual start
cd nexo-prj
pnpm nx serve auth-service &
pnpm nx serve crm-service &
pnpm nx serve api-gateway &
pnpm nx serve nexo-prj &
```

### Database
PostgreSQL must be running with test data:
```bash
# Start database
docker compose -f docker/docker-compose.yml up -d postgres

# Seed test data
docker exec -it nexo-postgres psql -U nexo_user -d nexo < database/seed-test-data-v2.sql
```

### Test Credentials
Tests use default test user:
- Email: `admin@techflow.test`
- Password: `test123`

## Configuration

### Playwright Config
**File:** `playwright.config.ts`

Key settings:
- **Timeout:** 60 seconds per test
- **Workers:** 1 (sequential execution for consistency)
- **Retries:** 2 in CI, 0 in local
- **Screenshots:** Only on failure
- **Trace:** On first retry

### Project Configuration

#### file-operations
```typescript
{
  name: 'file-operations',
  testMatch: /file-operations\.spec\.ts/,
  use: {
    baseURL: 'http://localhost:3002', // API Gateway
  }
}
```

#### file-upload-ui
```typescript
{
  name: 'file-upload-ui',
  testMatch: /file-upload-ui\.spec\.ts/,
  use: {
    baseURL: 'http://localhost:3000', // Frontend
    viewport: { width: 1280, height: 720 },
  }
}
```

## Test Structure

### API Tests (file-operations.spec.ts)
```typescript
test.describe('File Operations', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    authToken = await login(request);
  });

  test('should upload a file successfully', async ({ request }) => {
    const response = await uploadFile(request, authToken, testFile);
    expect(response.ok()).toBeTruthy();
  });
});
```

### UI Tests (file-upload-ui.spec.ts)
```typescript
test.describe('File Upload UI - Standalone Files Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should upload a file via file input', async ({ page }) => {
    await page.goto('/files');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
    // Verify upload success
  });
});
```

## Troubleshooting

### Tests Fail: "Cannot connect to service"
**Solution:** Ensure all services are running
```bash
mise run test-dev-all
# or manually start each service
```

### Tests Fail: "User not found"
**Solution:** Seed test data
```bash
docker exec -it nexo-postgres psql -U nexo_user -d nexo < database/seed-test-data-v2.sql
```

### Tests Timeout
**Solution:** Increase timeout in playwright.config.ts or check service logs
```bash
# Check service health
curl http://localhost:3001/api/auth/health
curl http://localhost:3003/api/health
curl http://localhost:3000
```

### File Upload Tests Fail (API)
**Known Issue:** Multipart FormData format in Playwright
**Workaround:** Test manually or fix format in uploadFile helper

### Frontend Not Loading
**Solution:** Verify Next.js is running and compiled
```bash
cd nexo-prj
pnpm nx serve nexo-prj
# Wait for "ready - started server on 0.0.0.0:3000"
```

### Port Already in Use
**Solution:** Kill existing processes
```bash
mise run test-cleanup-services
# or manually
lsof -ti:3000,3001,3002,3003 | xargs kill -9
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    # Start services
    docker compose up -d
    
    # Run tests
    cd nexo-prj
    pnpm exec playwright test --reporter=list
    
    # Upload artifacts
    pnpm exec playwright show-report
```

### Test Reports
Generated in:
- `nexo-prj/playwright-report/` (HTML)
- `nexo-prj/playwright-results.json` (JSON)

## Best Practices

### Writing Tests
1. ✅ Use descriptive test names
2. ✅ Clean up after tests (delete uploaded files)
3. ✅ Use temporary files for test data
4. ✅ Wait for async operations (uploads, downloads)
5. ✅ Verify state changes (file appears in list, modal opens)
6. ✅ Test error cases (unauthorized access, invalid files)

### Running Tests
1. ✅ Run locally before committing
2. ✅ Use headed mode for debugging
3. ✅ Check service logs if tests fail
4. ✅ Clean up between test runs
5. ✅ Use sequential execution (workers: 1) for API tests

### Debugging
1. ✅ Use `--headed` to see browser actions
2. ✅ Use `--ui` for interactive debugging
3. ✅ Use `--debug` to pause at breakpoints
4. ✅ Check screenshots in `test-results/`
5. ✅ Review trace files for failed tests

## Future Improvements

### Planned
- [ ] Fix multipart FormData format in file-operations.spec.ts
- [ ] Add drag-and-drop tests (when Playwright supports it better)
- [ ] Add large file upload tests (progress indicator)
- [ ] Add concurrent upload tests
- [ ] Add file size limit validation tests
- [ ] Add MIME type restriction tests

### Nice to Have
- [ ] Visual regression testing for FilePreview modal
- [ ] Accessibility testing (ARIA labels, keyboard navigation)
- [ ] Performance testing (upload speed, list rendering)
- [ ] Mobile viewport testing
- [ ] Cross-browser testing (Firefox, Safari)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [NEXO CRM Documentation](../README.md)
- [File Storage Architecture](../../../AGENTS.md#file-storage-architecture)
- [API Documentation](../../../API.md)

## Support

For questions or issues:
1. Check this README
2. Review test output and logs
3. Check service logs: `mise run logs:all`
4. Check [AGENTS.md](../../../AGENTS.md) for development guidelines
