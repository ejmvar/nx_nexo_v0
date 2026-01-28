# Attachments System Documentation

## Overview

The Attachments system provides file upload, storage, and retrieval capabilities for the CRM service. Files can be attached to any CRM entity (clients, employees, projects, tasks, etc.) with multi-tenant isolation and comprehensive security controls.

## Configuration

### Environment Variables

All configuration is managed through environment variables in `.env`:

```bash
# File Upload Configuration
UPLOAD_DIR=./uploads                    # Directory for file storage (default: ./uploads)
MAX_FILE_SIZE=10485760                  # Maximum file size in bytes (default: 10MB)
```

### File Size Limits

- **Default Maximum**: 10MB (10,485,760 bytes)
- **Configurable via**: `MAX_FILE_SIZE` environment variable
- **Validation**: Enforced at API level before file is written to disk
- **Error Response**: `400 Bad Request` with descriptive message

**Example configurations:**
- 5MB: `MAX_FILE_SIZE=5242880`
- 20MB: `MAX_FILE_SIZE=20971520`
- 50MB: `MAX_FILE_SIZE=52428800`

## Allowed MIME Types

The system accepts the following file types by default:

### Images
- `image/jpeg` - JPEG images (.jpg, .jpeg)
- `image/png` - PNG images (.png)
- `image/gif` - GIF images (.gif)
- `image/webp` - WebP images (.webp)

### Documents
- `application/pdf` - PDF documents (.pdf)
- `application/msword` - Microsoft Word 97-2003 (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Microsoft Word (.docx)
- `application/vnd.ms-excel` - Microsoft Excel 97-2003 (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Microsoft Excel (.xlsx)

### Text Files
- `text/plain` - Plain text files (.txt)
- `text/csv` - CSV files (.csv)

**Total**: 11 MIME types supported

### MIME Type Validation

- Validation occurs before file storage
- Rejects unsupported file types with `400 Bad Request`
- Error message includes list of allowed types
- Cannot be configured via environment variables (requires code change for security)

## API Endpoints

### Upload File

```http
POST /api/attachments/upload
```

**Query Parameters:**
- `entityType` (required) - Entity type (e.g., 'client', 'employee', 'project', 'task')
- `entityId` (required) - UUID of the entity
- `description` (optional) - Description of the attachment

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Headers: `Authorization: Bearer <JWT_TOKEN>`

**Response (201):**
```json
{
  "id": "uuid",
  "account_id": "uuid",
  "entity_type": "client",
  "entity_id": "uuid",
  "file_name": "1769478692467-jywc1b.txt",
  "original_name": "document.txt",
  "file_path": "uploads/1769478692467-jywc1b.txt",
  "file_size": 1024,
  "mime_type": "text/plain",
  "uploaded_by": "uuid",
  "description": "Important document",
  "created_at": "2026-01-27T04:51:32.480Z",
  "updated_at": "2026-01-27T04:51:32.480Z"
}
```

### List Attachments

```http
GET /api/attachments
```

**Query Parameters (all optional):**
- `entityType` - Filter by entity type
- `entityId` - Filter by specific entity

**Response (200):**
```json
[
  { /* attachment object */ },
  { /* attachment object */ }
]
```

### Get Attachment Metadata

```http
GET /api/attachments/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "account_id": "uuid",
  /* ... full attachment metadata ... */
}
```

### Download File

```http
GET /api/attachments/:id/download
```

**Response (200):**
- Content-Type: Original file MIME type
- Content-Disposition: `attachment; filename="original_filename.ext"`
- Content-Length: File size in bytes
- Body: File binary data

### Get Statistics

```http
GET /api/attachments/stats
```

**Response (200):**
```json
{
  "totalFiles": 42,
  "totalSize": 1048576,
  "byEntityType": {
    "client": {
      "count": 15,
      "size": 524288
    },
    "project": {
      "count": 27,
      "size": 524288
    }
  }
}
```

### Delete Attachment

```http
DELETE /api/attachments/:id
```

**Response (204):**
- No content
- File deleted from both disk and database

## Security & Permissions

### Required Permissions

- `attachment:create` - Upload files
- `attachment:read` - View, list, download files
- `attachment:delete` - Delete files

### Multi-Tenant Isolation

- All operations filtered by `account_id` from JWT token
- Users can only access attachments within their account
- Database queries automatically enforce account isolation via `DatabaseService.queryWithAccount()`

### File Storage Security

- Files stored with randomly generated names (timestamp + random string)
- Original filenames preserved in database metadata
- Upload directory should be outside web root
- No directory traversal vulnerabilities (path sanitization)

## File Naming Convention

**Generated filename format:**
```
{timestamp}-{random}.{extension}
```

**Example:**
- Original: `invoice-2024.pdf`
- Stored as: `1769478692467-jywc1b.pdf`

This ensures:
- No filename collisions
- No special character issues
- Chronological ordering
- Unpredictable URLs (security)

## Logging & Observability

All file operations are comprehensively logged for audit and analysis:

### Upload Events

```
📤 Upload request: file="document.pdf" size=1024 mime="application/pdf" entity=client:uuid account=uuid user=uuid
✅ File uploaded successfully: id=uuid file="document.pdf" stored_as="1769478692467-jywc1b.pdf" size=1024 bytes mime="application/pdf" entity=client:uuid account=uuid
```

### Validation Failures

```
❌ File size validation failed: 15728640 bytes exceeds limit of 10485760 bytes (10MB) for file "large-document.pdf"
❌ MIME type validation failed: "application/exe" not in allowed list for file "malware.exe"
```

### Download Events

```
⬇️  Downloading attachment: id=uuid file="document.pdf" size=1024 account=uuid
✅ Download successful: id=uuid bytes=1024
```

### Delete Events

```
🗑️  Deleting attachment: id=uuid file="document.pdf" size=1024 account=uuid
✅ File deleted from disk: uploads/1769478692467-jywc1b.pdf
✅ Attachment deleted successfully: id=uuid file="document.pdf"
```

### Error Events

```
❌ Upload failed for "document.pdf": Database connection error - Rolling back file write
🧹 Cleaned up orphaned file: uploads/1769478692467-jywc1b.pdf
⚠️  File not found on disk: uploads/missing-file.pdf - ENOENT: no such file or directory. Proceeding with database deletion.
```

### Log Analysis

Logs are structured for easy parsing and analysis:

**Log format:**
- Emoji indicators for quick visual scanning
- Key-value pairs for structured parsing
- Consistent timestamp prefixes
- Account and user IDs for audit trails

**Searchable fields:**
- `id=<uuid>` - Attachment ID
- `file="<name>"` - Original filename
- `account=<uuid>` - Account ID
- `user=<uuid>` - User ID
- `size=<bytes>` - File size
- `mime="<type>"` - MIME type
- `entity=<type>:<id>` - Entity reference

**Example log queries:**
```bash
# Find all uploads by user
grep "📤 Upload request" crm-service.log | grep "user=user-uuid-123"

# Find failed validations
grep "❌" crm-service.log

# Track specific file lifecycle
grep "id=attachment-uuid-456" crm-service.log

# Monitor large file uploads
grep "📤 Upload request" crm-service.log | grep -E "size=[5-9][0-9]{6}|size=[1-9][0-9]{7}"

# Find storage errors
grep "Rolling back file write" crm-service.log
```

## Database Schema

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_attachments_account_id ON attachments(account_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_entity ON attachments(account_id, entity_type, entity_id);
```

## Error Handling

### File Size Exceeded

```json
{
  "message": "File size exceeds maximum allowed size of 10MB",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Invalid MIME Type

```json
{
  "message": "File type application/exe is not allowed. Allowed types: image/jpeg, image/png, ...",
  "error": "Bad Request",
  "statusCode": 400
}
```

### File Not Found

```json
{
  "message": "Attachment with ID <uuid> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### Insufficient Permissions

```json
{
  "message": "Insufficient permissions. Required: attachment:create",
  "error": "Forbidden",
  "statusCode": 403
}
```

## Testing

See `/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj/scripts/test-attachments.sh` for comprehensive testing script.

## Maintenance

### Cleanup Orphaned Files

```bash
# Find database records without files
SELECT id, file_path FROM attachments WHERE NOT EXISTS (
  SELECT 1 FROM pg_stat_file(file_path)
);

# Find files without database records
# (Manual filesystem scan required)
```

### Monitor Storage Usage

```bash
# Check total storage per account
SELECT 
  account_id,
  COUNT(*) as file_count,
  SUM(file_size) as total_bytes,
  pg_size_pretty(SUM(file_size)) as total_size
FROM attachments
GROUP BY account_id
ORDER BY SUM(file_size) DESC;
```

## Best Practices

1. **Regular Backups**: Include uploads directory in backup strategy
2. **Storage Monitoring**: Set up alerts for disk space usage
3. **Log Rotation**: Configure log rotation for attachment logs
4. **Access Controls**: Restrict filesystem permissions on uploads directory
5. **Virus Scanning**: Consider integrating antivirus scanning for uploaded files
6. **CDN/S3**: For production, consider cloud storage (AWS S3, Azure Blob, etc.)
7. **Rate Limiting**: Implement rate limits on upload endpoints
8. **Quota Management**: Set per-account storage quotas

## Future Enhancements

- [ ] AWS S3/Azure Blob storage support
- [ ] Image thumbnail generation
- [ ] Document preview/conversion
- [ ] Virus/malware scanning integration
- [ ] Storage quota enforcement per account
- [ ] Bulk download (ZIP archives)
- [ ] File versioning
- [ ] Trash/soft delete with recovery
