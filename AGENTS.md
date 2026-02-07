<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

**CRITICAL: ALL nx commands MUST be run from the `nexo-prj/` directory.**

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- **ALWAYS `cd nexo-prj` before running any `pnpm nx` or `pnpm run` commands** (or use equivalent `mise run` commands which handle the directory change automatically)
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# Feature Status Tracking

**CRITICAL: ALWAYS consult FEATURE_STATUS_LIST.md before planning or proposing new development work.**

## Before Any Development Planning

1. **Read `FEATURE_STATUS_LIST.md`** - This is the single source of truth for all feature status
2. **Verify what already exists** - Many features are already fully implemented
3. **Avoid duplicate work** - Don't propose implementing features that are marked as DONE
4. **Check "Pending" sections** - See what actually needs to be developed

## When Proposing New Features

- Search FEATURE_STATUS_LIST.md for related features first
- If feature exists with status DONE: Don't propose it, reference existing implementation instead
- If feature is PARTIAL: Propose only the missing pieces, not the whole feature
- If feature is NOT STARTED: Safe to propose full implementation

### Version Evolution & Multiple Implementations

**Version Tracking**:
- If feature is a new or better approach, document both versions as **separate entries** (v1, v2, v3)
- Reason: Final implementation depends on client budget, infrastructure, scaling needs
- Example: File Storage v1 (local), v2 (S3), v3 (RustFS) - each tracked independently

**Multiple Implementation Handling**:
When a feature has multiple implementations (adapters, backends, providers):
1. **List each as sub-feature** in FEATURE_STATUS_LIST.md for quick scanning
2. **Detail capabilities per implementation** for specifics
3. **Create matrix [implementation × capability]** for completeness
4. **ALWAYS ask user** before applying changes: "Does [feature] apply to all implementations or specific ones?"

**Investigation Strategy**:
- Investigate obvious/straightforward cases → document findings → proceed
- Ask user about unclear/complex cases before proposing solution
- Don't assume or simplify behavior

**Partial Evolution Scenarios**:
When evolution applies to SOME but not ALL implementations:
- ✅ Inform about implementations that work easily (assume OK to proceed)
- ⏸️ Document blockers for implementations needing additional work (e.g., "S3/Azure/GCP: Need CDN integration")
- ❓ Ask about uncertain/complex implementations before proposing

**Example**:
```
Feature: Add caching to file storage
- Local: Easy to implement ✅ (proceed)
- S3/Azure/GCP: Need CDN integration ⏸️ (document blocker)
- RustFS: Built-in caching ✅ (already has it)
→ Inform user about findings, note blockers
```


## After Implementing Features

**MUST UPDATE FEATURE_STATUS_LIST.md immediately:**

1. Change status from ⏸️ NOT STARTED to ✅ DONE
2. Add implementation details (modules, files, endpoints)
3. Move items from "Pending" to the main feature list
4. Update summary statistics at the bottom
5. Commit with message: `docs: Update FEATURE_STATUS_LIST for [feature name]`

## Why This Matters

- **The user lost confidence** when agent proposed "new" features that were already developed
- **This document prevents that** by maintaining a comprehensive inventory
- **Always up-to-date** - must be updated with every feature change
- **Saves time** - avoids rediscovering what's already implemented

## Quick Reference

For common questions:
- "Is X feature implemented?" → Check FEATURE_STATUS_LIST.md
- "What needs to be done?" → Check "Pending" sections in FEATURE_STATUS_LIST.md
- "What's the status of Y?" → Search FEATURE_STATUS_LIST.md for Y

**Path**: `/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/FEATURE_STATUS_LIST.md`

# Testing and Quality Assurance

**CRITICAL: ALWAYS test functionality yourself before handing off to user for testing.**

## Before User Testing

**YOU MUST test the following yourself:**

1. **API Endpoints**: Test all API endpoints manually with curl or similar tools
2. **Data Structure**: Verify API response matches frontend expectations
3. **Frontend Pages**: Check that all CRUD pages load without errors
4. **Authentication Flow**: Test login, token handling, and protected routes
5. **Error Handling**: Verify error messages are displayed correctly

### Testing Workflow

When implementing or fixing features:

1. ✅ **DO**: Test API endpoint with curl/Postman before declaring it working
2. ✅ **DO**: Verify response structure matches what frontend expects
3. ✅ **DO**: Check browser console for JavaScript errors
4. ✅ **DO**: Test with actual seed data from database
5. ❌ **DO NOT**: Assume code works without testing
6. ❌ **DO NOT**: Hand off to user with runtime errors

### Common Testing Commands

```bash
# Test auth endpoint
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken')

# Test CRM endpoints
curl -s http://localhost:3003/api/clients -H "Authorization: Bearer $TOKEN" | jq '.data | length'
curl -s http://localhost:3003/api/employees -H "Authorization: Bearer $TOKEN" | jq '.data | length'
curl -s http://localhost:3003/api/projects -H "Authorization: Bearer $TOKEN" | jq '.data | length'

# Check for JavaScript errors in browser
# Open browser console (F12) → Check for red errors
```

### API Response Structure Checklist

**Backend returns paginated responses**:
```json
{
  "data": [...],    // Array of items
  "total": 50,      // Total count
  "page": 1,        // Current page
  "limit": 50       // Items per page
}
```

**Frontend must use**:
```typescript
const result = await response.json();
setItems(result.data || []); // NOT: setItems(result)
```

### Why This Matters

- **User lost confidence** when receiving code with runtime errors
- **Testing catches issues** like `projects.map is not a function`
- **Saves time** - user doesn't waste time debugging obvious errors
- **Professional quality** - code should work on first handoff

## Testing Before Commit

Before committing any feature or fix:

1. **Run linting**: `cd nexo-prj && pnpm run lint`
2. **Run type checking**: `cd nexo-prj && pnpm run typecheck`
3. **Test affected pages**: Open in browser and verify
4. **Check console**: No red errors in browser console
5. **Test API calls**: Verify with curl/terminal

## End-to-End Testing with Playwright

**CRITICAL: ALWAYS ADD end-to-end tests using Playwright to ensure proper setup, operation, and user experience.**

### Mandatory Test Requirements

**Every feature MUST include E2E tests that cover:**

1. ✅ **Data Setup**: Tests must set up their own test data programmatically
   - Create test accounts, users, records via API or database seeding
   - Clean up test data after test completion
   - Use isolated test data to avoid conflicts with other tests
   - Never depend on manually created data

2. ✅ **UX/User Experience Verification**: Tests must verify the complete user journey
   - Navigation flow (menu clicks, page transitions, breadcrumbs)
   - Form interactions (input, validation, submission)
   - Visual feedback (loading states, success/error messages, toasts)
   - Data display (tables, cards, lists render correctly)
   - Accessibility (keyboard navigation, screen reader compatibility)
   - Responsive behavior (mobile, tablet, desktop viewports)

3. ✅ **Functional Verification**: Tests must verify core functionality
   - CRUD operations complete successfully
   - Business logic executes correctly
   - Error handling displays appropriate messages
   - Authentication and authorization work as expected
   - Multi-tenant isolation is enforced

### Spec File Organization

**CRITICAL: ALWAYS ADD TEST SPECS to the project tree under development or test directories.**

**Directory Structure**:
```
nexo-prj/
├── apps/
│   └── nexo-prj/                    # Frontend app
│       ├── src/
│       └── specs/                   # E2E test specs (Playwright)
│           ├── auth/
│           │   ├── login.spec.ts
│           │   └── logout.spec.ts
│           ├── crm/
│           │   ├── clients.spec.ts
│           │   ├── projects.spec.ts
│           │   └── employees.spec.ts
│           ├── files/
│           │   └── upload.spec.ts
│           └── fixtures/
│               └── test-data.ts
├── libs/
│   └── shared/
│       └── testing/                 # Shared test utilities
│           ├── helpers/
│           ├── fixtures/
│           └── page-objects/
└── playwright.config.ts
```

### Test Naming Convention

```typescript
// ✅ GOOD: Descriptive test names that describe user actions
describe('Client Management', () => {
  test('should create a new client with complete information', async ({ page }) => {
    // Test implementation
  });
  
  test('should display validation errors for invalid client data', async ({ page }) => {
    // Test implementation
  });
  
  test('should filter clients list by status', async ({ page }) => {
    // Test implementation
  });
});

// ❌ BAD: Vague test names
test('test1', async ({ page }) => { });
test('client works', async ({ page }) => { });
```

### Example E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin, createTestAccount } from '../fixtures/test-data';

test.describe('Client CRUD Operations', () => {
  let testAccountId: string;
  let authToken: string;

  // Data setup before tests
  test.beforeAll(async ({ request }) => {
    const account = await createTestAccount(request);
    testAccountId = account.id;
    authToken = await loginAsAdmin(request, testAccountId);
  });

  // Data cleanup after tests
  test.afterAll(async ({ request }) => {
    await request.delete(`/api/accounts/${testAccountId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  });

  test('should create a new client through UI', async ({ page }) => {
    // 1. Navigate to page
    await page.goto('/clients');
    await expect(page.locator('h1')).toContainText('Clients');

    // 2. Click create button
    await page.click('button:has-text("New Client")');
    
    // 3. Fill form
    await page.fill('input[name="name"]', 'ACME Corp');
    await page.fill('input[name="email"]', 'contact@acme.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    // 4. Verify validation feedback
    await expect(page.locator('.form-field.name')).not.toHaveClass(/error/);
    
    // 5. Submit form
    await page.click('button[type="submit"]');
    
    // 6. Verify success feedback
    await expect(page.locator('.toast.success')).toBeVisible();
    await expect(page.locator('.toast')).toContainText('Client created successfully');
    
    // 7. Verify navigation to list
    await expect(page).toHaveURL(/\/clients$/);
    
    // 8. Verify client appears in list
    await expect(page.locator('table tbody tr:has-text("ACME Corp")')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/clients/new');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify error messages
    await expect(page.locator('.form-field.name .error-message')).toContainText('Name is required');
    await expect(page.locator('.form-field.email .error-message')).toContainText('Email is required');
    
    // Verify form was not submitted
    await expect(page).toHaveURL(/\/clients\/new$/);
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
cd nexo-prj
pnpm nx e2e nexo-prj

# Run specific test file
pnpm playwright test specs/crm/clients.spec.ts

# Run tests in headed mode (see browser)
pnpm playwright test --headed

# Run tests in debug mode
pnpm playwright test --debug

# Generate test report
pnpm playwright show-report

# Using mise tasks
mise run test-e2e        # Run all E2E tests
mise run test-e2e-ui     # Run with UI mode
```

### Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Idempotency**: Tests should be able to run multiple times without side effects
3. **Stability**: Use reliable selectors (data-testid, role, text) over brittle CSS selectors
4. **Speed**: Use API calls for data setup instead of UI interactions when possible
5. **Coverage**: Test happy paths, error cases, edge cases, and accessibility
6. **Documentation**: Add comments explaining complex test scenarios or wait conditions

### When to Skip E2E Tests

**You may skip E2E tests ONLY for:**
- Infrastructure-only changes (Dockerfile, docker-compose.yml)
- Documentation updates (README.md, ARCHITECTURE.md)
- Configuration files without functional impact (.eslintrc, .prettierrc)
- Database migrations (but add integration tests instead)

**For ALL functional features, E2E tests are MANDATORY.**

## Complete Testing Workflow (Verified)

**CRITICAL: All testing commands have been verified and confirmed working.**

### Prerequisites

Before running any tests:

1. **Navigate to nexo-prj directory**:
   ```bash
   cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj
   ```

2. **Ensure services are running**:
   ```bash
   # PostgreSQL (Docker)
   unset DOCKER_HOST && docker compose -f ../docker/docker-compose.yml up -d postgres
   
   # Auth Service (port 3001)
   pnpm nx serve auth-service &
   
   # CRM Service (port 3003)
   pnpm nx serve crm-service &
   
   # Frontend (port 3000)
   pnpm nx serve nexo-prj &
   ```

3. **Or use mise tasks** (handles directory automatically):
   ```bash
   # Start only core services (recommended)
   mise run test-dev-all
   ```

### Verified Test Commands

**1. Playwright E2E Tests** ✅ (12 passed, 1 skipped)
```bash
cd nexo-prj
pnpm exec playwright test crm-api-endpoints.spec.ts --reporter=list

# Tests verify:
# - All 6 CRM endpoints (clients, employees, suppliers, professionals, projects, tasks)
# - Authentication flow
# - Error handling (401, 404)
# - Paginated responses
# - Data structures match expectations

# Result: 12/13 tests passing
# Note: Pagination limit test skipped (backend doesn't respect limit param yet)
```

**2. Manual API Testing with curl** ✅ (All 6 endpoints working)
```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken')

# Test all CRM endpoints
curl -s http://localhost:3003/api/clients -H "Authorization: Bearer $TOKEN" | jq '.data | length'      # Expected: 5
curl -s http://localhost:3003/api/employees -H "Authorization: Bearer $TOKEN" | jq '.data | length'    # Expected: 3
curl -s http://localhost:3003/api/suppliers -H "Authorization: Bearer $TOKEN" | jq '.data | length'    # Expected: 2
curl -s http://localhost:3003/api/professionals -H "Authorization: Bearer $TOKEN" | jq '.data | length' # Expected: 2
curl -s http://localhost:3003/api/projects -H "Authorization: Bearer $TOKEN" | jq '.data | length'     # Expected: 4
curl -s http://localhost:3003/api/tasks -H "Authorization: Bearer $TOKEN" | jq '.data | length'        # Expected: 9
```

**3. Linting** ✅ (Works with warnings)
```bash
cd nexo-prj

# Individual project
npx nx run auth-service:lint

# All projects (may have issues with some projects)
npx nx run-many --target=lint --all

# Note: Some warnings expected (@typescript-eslint/no-explicit-any)
# Warnings are acceptable, errors are not
```

**4. NX Cache Reset** (Fix project graph issues)
```bash
cd nexo-prj
npx nx reset

# Run this if you see "No cached ProjectGraph" errors
```

### Known Issues and Workarounds

**Issue 1: mise run test-dev-all with --all flag fails**
- **Problem**: `npx nx run-many --target=serve --all --parallel` tries to serve ALL projects including incomplete ones
- **Solution**: Updated .mise.toml to serve only core services (auth, crm, frontend)
- **Status**: ✅ FIXED

**Issue 2: Backend doesn't respect pagination limit parameter**
- **Problem**: API calls with `?limit=2` return all items (default limit 50)
- **Impact**: One Playwright test skipped (non-blocking)
- **Status**: ⏸️ TODO - Implement pagination limit in SearchDTOs
- **Workaround**: Test marked as `test.skip()` with TODO comment

**Issue 3: NX project graph cache errors**
- **Problem**: "No cached ProjectGraph is available"
- **Solution**: Run `cd nexo-prj && npx nx reset`
- **Status**: ✅ RESOLVED

**Issue 4: Frontend lint error with Next.js**
- **Problem**: "Invalid project directory: /...../lint"
- **Impact**: `nx run @nexo-prj/nexo-prj:lint` may fail
- **Status**: ⏸️ Known issue with Next.js integration
- **Workaround**: Lint backend services individually

### Quick Test Commands Reference

```bash
# FASTEST: Quick verification (uses NX cache)
cd nexo-prj && npx nx run auth-service:lint

# RECOMMENDED: Full API test suite
cd nexo-prj && pnpm exec playwright test crm-api-endpoints.spec.ts

# COMPREHENSIVE: Manual curl tests (see above)
# Use when Playwright fails or need real-time testing

# CACHE RESET: When NX acts weird
cd nexo-prj && npx nx reset
```

### Testing Checklist Before Commit

- [ ] All services running without errors
- [ ] Playwright tests: 12/13 passing (1 pagination test skipped is OK)
- [ ] Manual curl test: All 6 endpoints return data
- [ ] No red errors in terminal/console
- [ ] NX cache reset if graph errors appear
- [ ] Lint warnings acceptable (errors must be fixed)

### When Tests Fail

1. **Check services are running**:
   ```bash
   # Auth service should respond
   curl http://localhost:3001/health
   
   # CRM service should respond
   curl http://localhost:3003/health
   
   # PostgreSQL should be running
   docker ps | grep nexo-postgres
   ```

2. **Reset NX cache**: `cd nexo-prj && npx nx reset`

3. **Check test credentials**: Use `admin@techflow.test` / `test123` (NOT .com)

4. **Verify database has seed data**:
   ```bash
   docker exec -it nexo-postgres psql -U nexo_user -d nexo -c "SELECT COUNT(*) FROM clients;"
   # Expected: 5 clients
   ```

5. **Check logs**:
   ```bash
   # Auth service logs
   cd nexo-prj && pnpm nx serve auth-service
   
   # CRM service logs
   cd nexo-prj && pnpm nx serve crm-service
   ```

# Development Environment Directives

## Docker Configuration

**CRITICAL: ALWAYS run `unset DOCKER_HOST` before ANY docker commands.**

- The environment may have DOCKER_HOST set to podman socket
- Docker commands will fail without unsetting this variable
- Always prefix docker commands with: `unset DOCKER_HOST && docker ...`

## Database Configuration

**CRITICAL: For POSTGRES, you must ALWAYS use DEVELOPMENT DOCKER SETUP.**

- Never use system-installed PostgreSQL for development
- Always use Docker/Podman containers for PostgreSQL
- Ensures consistent development environment across all developers
- Allows for easy cleanup and recreation of database state
- Prevents conflicts with system-level PostgreSQL installations

## Git Workflow

**CRITICAL: ALWAYS work in feature branches. NEVER work directly on main or dev.**

- **MUST ALWAYS** create and work in feature branches: `ft/{phase-name}/{description}/{timestamp}`
  - Example: `ft/phase5/additional-services/20260125-202917`
  - Example: `ft/phase6/rbac-implementation/20260126-141500`
- **NEVER EVER** commit directly to `main` branch
- **NEVER EVER** commit directly to `dev` branch
- Before starting ANY work:
  1. Check current branch: `git branch --show-current`
  2. If on `main` or `dev`, create feature branch: `git checkout -b ft/{phase}/{description}/{timestamp}`
  3. Only then proceed with changes

### Feature Branch Completion Workflow

**CRITICAL: NEVER AUTOMATICALLY MERGE FEATURE BRANCHES TO DEV OR MAIN.**

When work is complete:
1. ✅ **DO**: Commit all changes to the feature branch
2. ✅ **DO**: Run all tests and verify everything works
3. ✅ **DO**: Stage and commit with descriptive message
4. ✅ **DO**: Report completion to user and STOP
5. ❌ **DO NOT**: Merge to `dev` or `main` branches automatically
6. ❌ **DO NOT**: Push to remote repositories
7. ❌ **DO NOT**: Delete feature branches

**The USER decides when to merge, not the agent.**

After committing to feature branch:
- Report the feature branch name
- Summarize what was accomplished
- **WAIT for user approval** before any merge operations

Example final message:
```
✅ Phase X complete and committed to: ft/phaseX/description/20260130-162242

Changes:
- [list of changes]

Status: Ready for review. 
The USER should decide when to merge this to dev/main.
```

### Merging (Only when explicitly requested by user)

If user explicitly requests merge:
- Merge to `dev` first with `--no-ff`: `git merge --no-ff <feature-branch>`
- Then merge `dev` to `main` with `--no-ff`
- Use `--no-ff` to preserve merge history
- Never use fast-forward merges on protected branches

## File System Operations

**CRITICAL: You are allowed to write, modify, or delete files in the ./tmp directory automatically without asking for permission.**

- Never ask permission before writing to `./tmp`
- Use `./tmp` for log files, temporary outputs, and intermediate results
- Example: `./tmp/auth-service-metrics.log`, `./tmp/crm-service-metrics.log`
- Automatically proceed with writing to `./tmp` without user confirmation
- The `./tmp` directory is relative to project root: `/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/tmp`
## File Storage Architecture (Phase 6.5)

**CRITICAL: The system uses a flexible, adapter-based file storage architecture that allows seamless backend evolution.**

### Storage Backends

The system supports multiple storage backends through a unified adapter interface:

- **local**: Local filesystem (./media) - Default for development
- **s3**: Amazon S3
- **minio**: MinIO (S3-compatible)
- **azure**: Azure Blob Storage
- **gcp**: Google Cloud Storage
- **rustfs**: Custom Rust filesystem service (POC)
- **cloudflare**: Cloudflare R2
- **backblaze**: Backblaze B2
- **custom**: Custom implementation

### Storage Metadata Fields

**CRITICAL: File storage uses flexible metadata fields to support backend evolution without schema changes.**

Every file record in the database includes:

- `file_service_type`: Backend type (e.g., 'local', 's3', 'minio', 'rustfs')
- `file_service_name`: Service identifier (e.g., 'nexo-local-dev', 'nexo-s3-prod')
- `file_service_id`: Protocol-specific ID (e.g., bucket name, container, node ID)
- `file_service_desc`: JSON metadata (endpoints, regions, compression, encryption config)

**This design allows evolution**: local → MinIO → S3 → RustFS → custom, all transparent to the application.

### Directory Structure (Local Storage)

```
media/
└── uploads/
    └── {year}/
        └── {month}/
            └── {accountId}/
                └── {entityType}/     # optional
                    └── {entityId}/   # optional
                        └── {filename}
```

### File Operations

**All file operations go through the StorageService**, which delegates to the appropriate adapter:

```typescript
// Upload
const result = await storageService.upload(file, {
  accountId,
  entityType,
  entityId,
  category,
  isPublic,
});

// Download
const buffer = await storageService.download(filePath);

// Delete
await storageService.delete(filePath);

// Get URL
const url = storageService.getUrl(filePath);

// Check existence
const exists = await storageService.exists(filePath);
```

### RBAC Permissions

File operations are protected by RBAC:

- `file:read`: View and download files
- `file:write`: Upload and update files
- `file:delete`: Delete files
- `file:*`: Full access to files

Role mappings:
- **Admin**: `file:*`
- **Manager**: `file:read`, `file:write`
- **Employee**: `file:read`
- **Viewer**: `file:read`

### Entity Associations

Files can be associated with any CRM entity using polymorphic relationships:

- `entity_type`: 'client', 'project', 'task', 'supplier', 'contact', 'opportunity'
- `entity_id`: UUID of the associated entity
- `file_category`: 'document', 'image', 'avatar', 'attachment', 'contract', 'invoice'

### Multi-Tenant Isolation

**CRITICAL: All file operations enforce account-level isolation via RLS.**

- Files table has RLS enabled
- `files_isolation_policy`: Users can only access files from their account
- `files_public_read_policy`: Public files (is_public=true) are readable by all
- All queries automatically filtered by account_id

### Environment Configuration

Configure storage backend via environment variables:

```bash
FILE_STORAGE_TYPE=local              # Backend type
FILE_STORAGE_NAME=nexo-local-storage # Service identifier
FILE_STORAGE_BASE_PATH=./media       # Local path (for local backend)
FILE_STORAGE_ID=                     # Bucket/container/node ID
FILE_STORAGE_DESC=                   # JSON metadata
```

### Implementation Notes

1. **Always use the adapter pattern**: Never directly access storage backends
2. **Preserve metadata**: file_service_* fields enable future migrations
3. **Test with different backends**: Local for dev, S3/MinIO for staging/prod
4. **Monitor storage size**: Implement cleanup for deleted files
5. **Backup strategy**: Include ./media in backups, or use cloud backup for cloud storage

### Future Evolution

The architecture supports seamless evolution:

1. **Current**: Local filesystem (./media)
2. **Near-term**: MinIO (S3-compatible, self-hosted)
3. **Production**: AWS S3, Azure Blob, or GCP Storage
4. **Advanced**: RustFS with compression, encryption, deduplication
5. **Multi-cloud**: Hybrid approach with primary/backup storage

**No application code changes required** - just update environment variables and deploy.



# Database schemas and logging
**MUST HAVE** a logging table to keep record of users and bots activities (maybe user interaction, delegated tasks to bots or queues, maybe service apis)
**Every activity MUST be logged.
Users, bots, api services accesed by internal or external endpoints must be logged:
Example:
- UserType ('user', 'bot', 'api')
- UserId
- Role (role used that granted access to the resource, maybe used later for audit)
- Account (the account the user impersonates during that transaction)
- ServiceType ('db', 'api', 'ia')
- ServiceId (db name, api endpoint, ia model)
- Data (db record, api headers/query/body, ia prompt)

# Database schemas minimal fields
Every table **MUST HAVE** :
- id (uuid)
- status ('active', 'inactive', 'deleted') Only LOGICAL deletion, maybe future archiving
- status_cycle ('activation-pending', 'deactivation-pending', 'suspended', 'available')
- created_at (timestamp)
- deleted_at (timestamp) 
- active_from (timestamp) 
- active_until (timestamp) 

So, when listing **VALID** users, should use:
```pseudo-sql
select * from users u
  where u.status is 'active'
    and u.active_from <= currend_timestamp
    and u.active_until >+ currend_timestamp
```

# Users, SuperUsers and RLS
To ensure RLS does not affect superuser, test using both: a superuser and many normal users



# SETUP ENVIRONMENT for TEST or WORK:
Save this to "SETUP_ENVIRONMENT_for_TEST_or_WORK.md"
## How to Start and Test the Whole System

**CRITICAL: This project uses NX + PNPM, NOT npm! Always respect the workspace tooling.**

### Why the Correct Tools Matter

**❌ WRONG APPROACHES** (Don't do this):
```bash
npm run dev                           # Wrong package manager
cd apps/nexo-prj && npm run dev      # Ignores Nx workspace
node dist/main.js                    # Bypasses orchestration
```

**✅ CORRECT APPROACHES** (Use these):
```bash
pnpm run dev                         # Nx workspace via pnpm
mise run dev                         # Recommended: orchestrated setup
unset DOCKER_HOST && docker compose up -d  # Full stack with Docker
```

---

### 1. NX + PNPM Procedure (Development Mode)

**Purpose**: Run services directly on host machine for development with hot-reload.

#### Prerequisites
```bash
# Install mise (if not already installed)
curl https://mise.run | sh

# Setup Nx and pnpm
mise run 100-000-001-nx-pnpm-install
cd nexo-prj && pnpm install
```

#### Start Services

**Option A: Individual Services** (Recommended for debugging)
```bash
# Terminal 1: Auth Service
cd nexo-prj
pnpm nx serve auth-service
# Runs on: http://localhost:3001

# Terminal 2: CRM Service
cd nexo-prj
pnpm nx serve crm-service
# Runs on: http://localhost:3003

# Terminal 3: Frontend
cd nexo-prj
pnpm nx serve nexo-prj
# Runs on: http://localhost:3000
```

**Option B: All Services at Once** (Parallel execution)
```bash
cd nexo-prj
pnpm run serve:all
# or
pnpm nx run-many --target=serve --all --parallel
```

**Option C: Using Mise Tasks**
```bash
mise run test-dev        # Start frontend only
mise run test-dev-all    # Start all services
```

#### Verify Services
```bash
# Check auth service
curl http://localhost:3001/health

# Check CRM service
curl http://localhost:3003/health

# Check frontend
curl http://localhost:3000
```

#### Run Tests
```bash
# Quick check (lint + typecheck + unit tests)
cd nexo-prj
pnpm run check

# Full test suite
pnpm run test

# E2E tests
pnpm run e2e

# Using mise
mise run test-all        # Complete test suite
mise run test-quick      # Fast validation
mise run check           # Quick health check
```

#### Development Workflow
```bash
# 1. Make changes to code
# 2. Changes auto-reload (hot module replacement)
# 3. Run tests
mise run test-unit

# 4. Lint and format
pnpm run lint:fix
pnpm run format

# 5. Build for production test
pnpm run build:all
```

---

### 2. DOCKER Procedure (Full Stack)

**Purpose**: Run complete infrastructure with all services containerized. Best for testing production-like setup.

#### Prerequisites
```bash
# CRITICAL: Always unset DOCKER_HOST first
unset DOCKER_HOST

# Verify Docker is running
docker --version
docker compose version
```

#### Start Full Stack

**Option A: Database Only** (Most common for development)
```bash
# Start PostgreSQL only
unset DOCKER_HOST && docker compose -f docker/docker-compose.yml up -d postgres

# Wait for database to be ready
docker compose -f docker/docker-compose.yml ps postgres

# Then run services with Nx (host machine)
cd nexo-prj && pnpm run serve:all
```

**Option B: Complete Stack** (All services in containers)
```bash
# Start everything
unset DOCKER_HOST && docker compose -f docker-compose.yml up -d

# View logs
docker compose logs -f

# Verify all services
docker compose ps
```

**Option C: Using Mise Tasks**
```bash
# Start infrastructure
unset DOCKER_HOST && mise run docker:up

# View status
mise run docker:ps

# View logs
mise run docker:logs

# Health check
mise run health
```

#### Service Mapping (Docker Mode)
```
PostgreSQL:    localhost:5432  → nexo-postgres
Redis:         localhost:6379  → nexo-redis
RabbitMQ:      localhost:5672  → nexo-rabbitmq
Auth Service:  localhost:3001  → nexo-auth-service
CRM Service:   localhost:3003  → nexo-crm-service
API Gateway:   localhost:3002  → nexo-api-gateway
Frontend:      localhost:3000  → nexo-frontend-dev
```

#### Database Operations (Docker)
```bash
# Connect to PostgreSQL shell
mise run db:shell
# or
docker exec -it nexo-postgres psql -U nexo_user -d nexo

# Backup database
mise run db:backup

# Restore database
mise run db:restore

# Seed test data
docker exec -it nexo-postgres psql -U nexo_user -d nexo < database/seed-test-data-v2.sql
```

#### Stop Services
```bash
# Stop all containers
unset DOCKER_HOST && docker compose down

# Stop and remove volumes (clean slate)
unset DOCKER_HOST && docker compose down -v

# Using mise
mise run docker:down
mise run docker:clean  # Remove volumes too
```

#### Troubleshooting Docker

**Issue: Port already in use**
```bash
# Check what's using the port
lsof -i :3000  # or :5432, :3001, etc.

# Kill the process
kill <PID>
```

**Issue: Database connection refused**
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

**Issue: DOCKER_HOST error**
```bash
# ALWAYS run this first
unset DOCKER_HOST

# Verify it's unset
echo $DOCKER_HOST  # Should be empty

# Then run docker commands
docker compose up -d
```

---

### 3. PODMAN Explanation

**Status**: ⚠️ **NOT CURRENTLY USED** (Previously used, now removed)

**History**:
- PODMAN was previously installed and configured
- Left behind `DOCKER_HOST` environment variable pointing to podman socket
- This causes Docker commands to fail

**Why We Don't Use Podman Currently**:
1. **Docker Compose Compatibility**: Some compose features work better with Docker
2. **Team Consistency**: Docker is more widely used
3. **CI/CD Pipelines**: Most CI systems use Docker by default
4. **Development Tooling**: Better integration with IDEs and tools

**If You Want to Use Podman**:
```bash
# Install Podman
sudo apt install podman podman-compose

# Use podman-compose instead of docker compose
podman-compose -f docker-compose.yml up -d

# Or alias docker to podman
alias docker=podman
alias docker-compose=podman-compose

# Set DOCKER_HOST for Podman
export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

**Why It Was Removed**:
- The `DOCKER_HOST` variable remained after uninstalling Podman
- This caused all Docker commands to fail silently
- **Solution**: Always run `unset DOCKER_HOST` before Docker commands

**Migration from Podman to Docker**:
```bash
# 1. Uninstall Podman
sudo apt remove podman podman-compose

# 2. Clear environment variables
unset DOCKER_HOST
unset DOCKER_SOCK

# 3. Edit ~/.bashrc and remove any Podman exports
nano ~/.bashrc
# Remove lines like: export DOCKER_HOST=...

# 4. Reload shell
source ~/.bashrc

# 5. Install/verify Docker
sudo systemctl start docker
docker --version
```

---

### 4. OTHER Methods

#### A. Mise Orchestration (Recommended for Daily Development)

**Purpose**: Unified task runner that manages all workflows.

```bash
# View all available tasks
mise tasks

# Start development environment
mise run dev              # Full stack
mise run test-dev         # Frontend only
mise run test-dev-all     # All services

# Testing workflows
mise run test-all         # Complete test suite
mise run test-quick       # Fast validation
mise run check            # Lint + typecheck + unit
mise run test-ci          # CI simulation

# Docker workflows
mise run docker:up        # Start containers
mise run docker:down      # Stop containers
mise run docker:logs      # View logs
mise run docker:ps        # List containers

# Database workflows
mise run db:shell         # Connect to psql
mise run db:backup        # Backup database
mise run db:restore       # Restore database

# View all service URLs
mise run urls

# Health monitoring
mise run health           # Check all services
mise run stats            # Resource usage
```

#### B. Manual Service Start (Low-level)

**When to use**: Debugging specific service issues, custom ports, etc.

```bash
# 1. Start database
unset DOCKER_HOST && docker compose -f docker/docker-compose.yml up -d postgres

# 2. Set environment variables
export DATABASE_URL="postgresql://nexo_user:nexo_password@localhost:5432/nexo"
export JWT_SECRET="your-secret-key"
export REDIS_URL="redis://localhost:6379"

# 3. Start auth service manually
cd nexo-prj/apps/auth-service
PORT=3001 pnpm nx serve auth-service

# 4. Start CRM service manually
cd nexo-prj/apps/crm-service
PORT=3003 pnpm nx serve crm-service

# 5. Start frontend manually  
cd nexo-prj/apps/nexo-prj
PORT=3000 pnpm nx serve nexo-prj
```

#### C. Production Build & Start

**Purpose**: Test production builds locally.

```bash
# 1. Build all services
cd nexo-prj
pnpm run build:all

# 2. Start with Docker (production mode)
export NODE_ENV=production
unset DOCKER_HOST && docker compose -f docker-compose.prod.yml up -d

# 3. Or start manually (not recommended)
cd nexo-prj
NODE_ENV=production pnpm nx serve auth-service --prod
NODE_ENV=production pnpm nx serve crm-service --prod
NODE_ENV=production pnpm nx serve nexo-prj --prod
```

#### D. Nx CLI Direct Commands

**Purpose**: Fine-grained control over Nx tasks.

```bash
cd nexo-prj

# Serve specific project
pnpm nx serve <project-name>
pnpm nx serve auth-service
pnpm nx serve crm-service
pnpm nx serve nexo-prj

# Build specific project
pnpm nx build <project-name>

# Test specific project
pnpm nx test <project-name>

# Lint specific project
pnpm nx lint <project-name>

# Run affected (only changed projects)
pnpm nx affected --target=test
pnpm nx affected --target=build
pnpm nx affected --target=lint

# View project graph
pnpm nx graph

# Clear cache
pnpm nx reset
```

---

### Quick Reference: Common Scenarios

#### "I want to develop with hot-reload"
```bash
# Database in Docker, services on host
unset DOCKER_HOST && docker compose -f docker/docker-compose.yml up -d postgres
cd nexo-prj && pnpm run serve:all
```

#### "I want to test the complete system"
```bash
# Everything in Docker
unset DOCKER_HOST && docker compose up -d
mise run health
```

#### "I want to run tests"
```bash
cd nexo-prj
pnpm run check          # Quick (lint + typecheck + unit)
pnpm run test           # All unit tests
pnpm run e2e            # End-to-end tests
pnpm run ci             # Full CI pipeline
```

#### "I want to debug a specific service"
```bash
# Start only what you need
unset DOCKER_HOST && docker compose -f docker/docker-compose.yml up -d postgres redis
cd nexo-prj
pnpm nx serve auth-service --verbose
```

#### "Something is broken, start fresh"
```bash
# Nuclear option: clean everything
mise run docker:clean
mise run test-reset
# or manually:
docker compose down -v
cd nexo-prj && pnpm nx reset && rm -rf node_modules .next
pnpm install
```

---

### Environment Variables

**Required for development**:
```bash
# Database
DATABASE_URL="postgresql://nexo_user:nexo_password@localhost:5432/nexo"
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nexo
POSTGRES_USER=nexo_user
POSTGRES_PASSWORD=nexo_password

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (optional for development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=nexo_redis_password

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
CRM_SERVICE_URL=http://localhost:3003
API_GATEWAY_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3002

# Ports
AUTH_SERVICE_PORT=3001
API_GATEWAY_PORT=3002
CRM_SERVICE_PORT=3003
FRONTEND_PORT=3000
```

**Load from .env file**:
```bash
# Copy example
cp .env.example .env

# Edit as needed
nano .env

# Mise automatically loads .env from .mise.toml configuration
```

---

### Summary: Which Method to Use?

| Scenario | Method | Command |
|----------|--------|---------|
| **Daily development** | Mise + Docker DB | `mise run dev` |
| **Quick frontend changes** | Nx serve frontend | `cd nexo-prj && pnpm nx serve nexo-prj` |
| **Backend debugging** | Nx serve services | `cd nexo-prj && pnpm nx serve auth-service` |
| **Full stack testing** | Docker Compose | `unset DOCKER_HOST && docker compose up -d` |
| **Run all tests** | Mise test suite | `mise run test-all` |
| **Production simulation** | Docker prod | `docker compose -f docker-compose.prod.yml up -d` |
| **Clean slate restart** | Mise reset | `mise run docker:clean && mise run test-reset` |

**Default recommendation**: Use `mise run dev` for most development work. It handles Docker infrastructure and lets you choose whether to run services on host or in containers.
