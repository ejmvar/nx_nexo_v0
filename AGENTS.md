<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

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

