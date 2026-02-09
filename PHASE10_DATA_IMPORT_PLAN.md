# Phase 10: Data Import System - Implementation Plan

**Priority**: HIGH  
**Status**: NOT STARTED  
**Estimated Duration**: 3-5 days  
**Dependencies**: Phase 1-9 complete  

---

## 📋 Overview

Implement a robust data import system allowing bulk import of CRM entities from Excel/CSV files with validation, error handling, and background processing.

---

## 🎯 Goals

1. **User Experience**: Simple drag-and-drop import interface
2. **Data Validation**: Pre-import validation with detailed error reporting
3. **Performance**: Handle large files (10K+ rows) efficiently
4. **Reliability**: Transaction-based imports with rollback on errors
5. **Auditability**: Track import history and changes

---

## 🏗️ Architecture

### Backend Components

```
crm-service/
├── src/
│   ├── import/
│   │   ├── import.module.ts
│   │   ├── import.controller.ts           # API endpoints
│   │   ├── import.service.ts              # Core import logic
│   │   ├── import-job.processor.ts        # Background job processor
│   │   ├── validators/
│   │   │   ├── client-import.validator.ts # Entity-specific validators
│   │   │   ├── project-import.validator.ts
│   │   │   ├── employee-import.validator.ts
│   │   │   └── common.validator.ts        # Shared validation rules
│   │   ├── parsers/
│   │   │   ├── excel.parser.ts            # XLSX parsing
│   │   │   ├── csv.parser.ts              # CSV parsing
│   │   │   └── parser.interface.ts        # Common interface
│   │   └── templates/
│   │       ├── clients-template.xlsx      # Import templates
│   │       ├── projects-template.xlsx
│   │       └── employees-template.xlsx
│   └── database/
│       └── migrations/
│           └── 20260208_phase10_import_tables.sql
```

### Database Schema

```sql
-- Import jobs table
CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,  -- 'clients', 'projects', etc.
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
    total_rows INTEGER,
    processed_rows INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    validation_errors JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import errors table (for detailed error tracking)
CREATE TABLE import_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    field_name VARCHAR(100),
    error_message TEXT NOT NULL,
    row_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_import_jobs_account ON import_jobs(account_id);
CREATE INDEX idx_import_jobs_user ON import_jobs(user_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_errors_job ON import_errors(import_job_id);

-- RLS Policies
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY import_jobs_isolation ON import_jobs
    USING (account_id = current_setting('app.current_account_id')::uuid);

CREATE POLICY import_errors_isolation ON import_errors
    USING (import_job_id IN (
        SELECT id FROM import_jobs 
        WHERE account_id = current_setting('app.current_account_id')::uuid
    ));
```

---

## 🔑 Key Features

### 1. Template Download
```typescript
// GET /api/import/templates/:entity
{
  entity: 'clients' | 'projects' | 'employees' | 'suppliers' | 'professionals' | 'tasks'
}

// Response: Excel file download
```

### 2. File Upload & Validation
```typescript
// POST /api/import/validate
FormData {
  file: File,              // .xlsx or .csv
  entity: string          // 'clients', 'projects', etc.
}

// Response
{
  valid: boolean,
  totalRows: number,
  validRows: number,
  errors: [
    {
      row: number,
      field: string,
      message: string,
      value: any
    }
  ],
  warnings: [...]
}
```

### 3. Import Execution
```typescript
// POST /api/import/execute
{
  fileId: string,          // From upload
  entity: string,
  options: {
    skipErrors: boolean,   // Skip rows with errors
    updateExisting: boolean, // Update if exists (based on unique field)
    dryRun: boolean        // Validate only, don't save
  }
}

// Response
{
  jobId: string,
  status: 'queued' | 'processing',
  estimatedDuration: number  // seconds
}
```

### 4. Job Status Tracking
```typescript
// GET /api/import/jobs/:jobId
{
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  progress: {
    total: number,
    processed: number,
    success: number,
    errors: number,
    percentage: number
  },
  errors: [...],
  startedAt: string,
  completedAt: string
}

// GET /api/import/jobs (list all jobs)
```

### 5. Import History
```typescript
// GET /api/import/history?entity=clients&limit=20&offset=0
{
  jobs: [
    {
      id: string,
      fileName: string,
      entityType: string,
      totalRows: number,
      successCount: number,
      errorCount: number,
      status: string,
      createdAt: string,
      createdBy: string
    }
  ],
  total: number
}
```

---

## 🎨 Frontend Components

### 1. Import Page (`/clients/import`)
```tsx
// apps/nexo-prj/src/app/clients/import/page.tsx

- Template download button
- File upload dropzone (drag-and-drop)
- Validation results display
- Import progress bar
- Error list with row numbers
- Success/failure summary
```

### 2. Import History Page (`/clients/import/history`)
```tsx
- Table of past imports
- Filter by status/date
- View errors for failed imports
- Re-download original file
- Export error log
```

### 3. Reusable Components
```tsx
// libs/shared-ui/import/

- ImportUploader.tsx          // Drag-drop file upload
- ImportValidator.tsx          // Validation results
- ImportProgressTracker.tsx    // Real-time progress
- ImportErrorList.tsx          // Error display
- ImportJobCard.tsx            // Job summary card
```

---

## 📝 Import Template Format

### Example: Clients Import Template

```
| Name* | Email* | Phone | Address | City | Country | Status | Notes |
|-------|--------|-------|---------|------|---------|--------|-------|
| ACME Corp | contact@acme.com | +1234567890 | 123 Main St | New York | USA | active | New client |
```

**Column Rules**:
- `*` = Required field
- Email must be valid format
- Phone can be various formats
- Status: active, inactive, suspended
- Notes: Free text

### Example: Projects Import Template

```
| Name* | Client Email* | Start Date* | End Date | Budget | Status | Description |
|-------|---------------|-------------|----------|--------|--------|-------------|
| Website Redesign | contact@acme.com | 2026-03-01 | 2026-06-30 | 50000 | active | Full redesign |
```

**Column Rules**:
- Client Email: Must match existing client (foreign key lookup)
- Dates: YYYY-MM-DD format
- Budget: Number (no currency symbols)
- Status: draft, active, completed, cancelled

---

## ✅ Validation Rules

### Common Validations
- **Required fields**: Cannot be empty
- **Email format**: `user@domain.com`
- **Phone format**: International or local
- **Date format**: ISO 8601 (YYYY-MM-DD)
- **Number format**: Integer or decimal
- **Enum values**: Must match predefined list

### Entity-Specific Validations

**Clients**:
- Email must be unique (or update existing)
- Name required, min 2 characters
- Phone optional but must be valid format

**Projects**:
- Client must exist (lookup by email or ID)
- Budget must be positive number
- Start date <= End date
- Status must be valid enum

**Employees**:
- Email must be unique
- Role must exist in system
- Hire date cannot be future

---

## 🚀 Implementation Phases

### Phase 10.1: Backend Foundation (Day 1)
- [ ] Create migration for import tables
- [ ] Implement import module structure
- [ ] Create Excel/CSV parsers
- [ ] Basic validation framework

### Phase 10.2: Entity Import Logic (Day 2)
- [ ] Implement client import
- [ ] Implement project import
- [ ] Implement employee import
- [ ] Transaction handling + rollback

### Phase 10.3: Background Processing (Day 3)
- [ ] Set up Bull queue (Redis-based)
- [ ] Implement job processor
- [ ] Progress tracking
- [ ] Error handling + retry logic

### Phase 10.4: Frontend UI (Day 4)
- [ ] Import page UI
- [ ] File upload + validation
- [ ] Progress tracking UI
- [ ] Error display
- [ ] History page

### Phase 10.5: Testing & Polish (Day 5)
- [ ] Unit tests for validators
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing (10K rows)
- [ ] Documentation

---

## 📦 Dependencies to Install

```bash
# Backend
cd nexo-prj
pnpm add xlsx papaparse bull @nestjs/bull

# For background jobs
pnpm add @nestjs/bull bull redis

# Types
pnpm add -D @types/papaparse @types/bull
```

---

## 🧪 Testing Strategy

### Unit Tests
- Parser tests (Excel/CSV)
- Validator tests (each entity)
- Error handling tests

### Integration Tests
- End-to-end import flow
- Transaction rollback
- RLS policy enforcement

### E2E Tests
```typescript
test('should import clients from Excel', async () => {
  // Upload file
  // Validate
  // Execute import
  // Verify database records
  // Check import job status
});
```

### Performance Tests
- 100 rows: < 5 seconds
- 1,000 rows: < 30 seconds
- 10,000 rows: < 5 minutes

---

## 🔒 Security Considerations

1. **File Validation**: Only .xlsx and .csv allowed
2. **File Size Limit**: 10MB max
3. **Row Limit**: 10,000 rows per import
4. **RLS Enforcement**: All imports respect account isolation
5. **Permission Check**: `entity:write` permission required
6. **Virus Scanning**: Consider adding ClamAV for file scanning

---

## 📊 Success Metrics

- **Usefulness**: Import 1,000+ records/day across accounts
- **Reliability**: 99% success rate for valid data
- **Performance**: <= 5 min for 10K rows
- **User Satisfaction**: < 2 min from upload to completion for typical files

---

## 🔜 Future Enhancements (Phase 10+)

- [ ] Import from Google Sheets
- [ ] Scheduled imports (daily/weekly)
- [ ] Field mapping UI (custom column names)
- [ ] Data transformation rules
- [ ] Import webhooks/notifications
- [ ] Duplicate detection (fuzzy matching)
- [ ] Import templates per account
- [ ] Multi-entity imports (relationships)

---

## 📚 Documentation to Create

1. **User Guide**: How to prepare import files
2. **API Documentation**: Import endpoints
3. **Admin Guide**: Monitoring imports
4. **Developer Guide**: Adding new entity imports

---

**Ready to implement?** Start with Phase 10.1!
