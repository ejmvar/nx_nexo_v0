-- ============================================================================
-- Migration: 007 - Files Table with Storage Service Metadata
-- Description: Create files table with multi-backend storage support
-- Date: 2026-02-01
-- Phase: 6.5 - File Storage & Upload
-- ============================================================================

-- Enable pg_trgm extension for full-text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- File identification
  filename VARCHAR(255) NOT NULL,              -- Original filename from user
  stored_filename VARCHAR(255) NOT NULL,       -- Unique stored filename (sanitized)
  mime_type VARCHAR(100) NOT NULL,             -- e.g., 'image/png', 'application/pdf'
  size_bytes BIGINT NOT NULL,                  -- File size in bytes
  
  -- Storage backend metadata (flexible for multiple services)
  file_service_type VARCHAR(50) NOT NULL,      -- 'local', 's3', 'minio', 'rustfs', 'azure', 'gcp', 'cloudflare', 'backblaze', 'custom'
  file_service_name VARCHAR(100),              -- Service name/identifier (e.g., 'nexo-minio-prod', 'nexo-local-dev')
  file_service_id VARCHAR(255),                -- Service-specific ID (bucket name, container, cluster node, etc.)
  file_service_desc TEXT,                      -- Additional service metadata (JSON or text) - endpoints, regions, encryption, etc.
  file_path TEXT NOT NULL,                     -- Relative path within storage service
  file_url TEXT,                               -- Full accessible URL (if applicable) - can be HTTP URL or custom protocol
  
  -- Entity association (polymorphic - can attach files to any entity)
  entity_type VARCHAR(50),                     -- 'client', 'project', 'task', 'employee', 'supplier', 'professional', etc.
  entity_id UUID,                              -- Foreign key to entity (no FK constraint for flexibility)
  
  -- Categorization and organization
  file_category VARCHAR(50),                   -- 'document', 'image', 'avatar', 'attachment', 'contract', 'invoice', etc.
  file_tags TEXT[],                            -- Array of tags for flexible categorization and search
  
  -- Metadata and ownership
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Who uploaded the file
  description TEXT,                            -- User-provided description
  is_public BOOLEAN DEFAULT false,             -- Public access flag (bypass RLS if true)
  
  -- Lifecycle management
  status VARCHAR(20) DEFAULT 'active',         -- 'active', 'archived', 'deleted', 'processing'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,         -- Soft delete timestamp
  
  -- Constraints
  CONSTRAINT files_entity_check CHECK (
    (entity_type IS NULL AND entity_id IS NULL) OR 
    (entity_type IS NOT NULL AND entity_id IS NOT NULL)
  ),
  CONSTRAINT files_status_check CHECK (status IN ('active', 'archived', 'deleted', 'processing'))
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

-- Core lookup indexes
CREATE INDEX idx_files_account_id ON files(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_created_at ON files(created_at DESC) WHERE deleted_at IS NULL;

-- Entity association indexes
CREATE INDEX idx_files_entity_type ON files(entity_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_entity_id ON files(entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_entity ON files(entity_type, entity_id) WHERE deleted_at IS NULL;

-- Categorization indexes
CREATE INDEX idx_files_file_category ON files(file_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_mime_type ON files(mime_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_status ON files(status);

-- Storage service indexes
CREATE INDEX idx_files_service_type ON files(file_service_type);
CREATE INDEX idx_files_service_name ON files(file_service_name);

-- Full-text search indexes (GIN with pg_trgm)
CREATE INDEX idx_files_filename_trgm ON files USING gin (filename gin_trgm_ops);
CREATE INDEX idx_files_description_trgm ON files USING gin (description gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX idx_files_account_entity ON files(account_id, entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_account_category ON files(account_id, file_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_account_status ON files(account_id, status) WHERE deleted_at IS NULL;

-- ============================================================================
-- Row-Level Security (RLS)
-- ============================================================================

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see files from their account
CREATE POLICY files_isolation_policy ON files
  USING (account_id = current_user_account_id())
  WITH CHECK (account_id = current_user_account_id());

-- Policy: Public files are visible to all (for future public sharing feature)
CREATE POLICY files_public_read_policy ON files
  FOR SELECT
  USING (is_public = true AND status = 'active' AND deleted_at IS NULL);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger to update updated_at on row modification
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE files IS 'Stores metadata for uploaded files with support for multiple storage backends';
COMMENT ON COLUMN files.file_service_type IS 'Storage backend type: local, s3, minio, rustfs, azure, gcp, etc.';
COMMENT ON COLUMN files.file_service_name IS 'Service instance identifier for logging and monitoring';
COMMENT ON COLUMN files.file_service_id IS 'Service-specific ID (bucket, container, cluster node)';
COMMENT ON COLUMN files.file_service_desc IS 'JSON metadata: endpoints, regions, encryption settings, etc.';
COMMENT ON COLUMN files.file_path IS 'Relative path within storage service (portable across backends)';
COMMENT ON COLUMN files.file_url IS 'Full URL for file access (HTTP or custom protocol)';
COMMENT ON COLUMN files.entity_type IS 'Polymorphic association: client, project, task, employee, etc.';
COMMENT ON COLUMN files.entity_id IS 'UUID of associated entity';
COMMENT ON COLUMN files.file_category IS 'File category: document, image, avatar, attachment, contract, invoice';
COMMENT ON COLUMN files.file_tags IS 'Array of tags for flexible categorization';

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON files TO nexo_app;

-- ============================================================================
-- Sample data (optional - for development/testing)
-- ============================================================================

-- Uncomment to insert sample file records for testing
/*
INSERT INTO files (account_id, filename, stored_filename, mime_type, size_bytes, 
                   file_service_type, file_service_name, file_path, entity_type, 
                   entity_id, file_category, uploaded_by)
SELECT 
  a.id as account_id,
  'sample-document.pdf' as filename,
  'sample-document-1738435200000-abc123.pdf' as stored_filename,
  'application/pdf' as mime_type,
  1048576 as size_bytes,
  'local' as file_service_type,
  'nexo-local-dev' as file_service_name,
  'uploads/2026/02/sample-document-1738435200000-abc123.pdf' as file_path,
  'client' as entity_type,
  c.id as entity_id,
  'document' as file_category,
  u.id as uploaded_by
FROM accounts a
JOIN users u ON u.account_id = a.id
JOIN clients c ON c.account_id = a.id
LIMIT 1;
*/

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Verify table creation
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'files'
ORDER BY indexname;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'files';

-- ============================================================================
-- End of migration
-- ============================================================================
