-- Phase 11: Attachments table for file uploads
-- This table stores metadata for uploaded files with multi-tenant support

CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachments_account_id ON attachments(account_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(account_id, entity_type, entity_id);

-- Add foreign key constraints (optional, depends on if you want strict referential integrity)
-- ALTER TABLE attachments ADD CONSTRAINT fk_attachments_account_id FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
-- ALTER TABLE attachments ADD CONSTRAINT fk_attachments_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- Comments
COMMENT ON TABLE attachments IS 'Stores metadata for uploaded files with multi-tenant support';
COMMENT ON COLUMN attachments.entity_type IS 'Type of entity: client, employee, project, task, etc.';
COMMENT ON COLUMN attachments.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN attachments.file_name IS 'Unique file name stored on disk';
COMMENT ON COLUMN attachments.original_name IS 'Original file name from upload';
COMMENT ON COLUMN attachments.file_path IS 'Full path to file on disk';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN attachments.mime_type IS 'MIME type of the file';
