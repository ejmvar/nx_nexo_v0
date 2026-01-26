-- ============================================================================
-- Phase 6.2: Audit Logging System Migration
-- Created: 2026-01-26 12:00
-- Purpose: Track all CRUD operations for compliance and security audits
-- ============================================================================

BEGIN;

-- ============================================================================
-- Step 1: Create audit_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action details
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE'
  entity_type VARCHAR(100) NOT NULL, -- 'client', 'employee', 'project', 'task', etc.
  entity_id UUID, -- Can be NULL for LIST operations
  
  -- Change tracking
  changes JSONB, -- { "old": {...}, "new": {...} }
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10), -- 'GET', 'POST', 'PUT', 'DELETE'
  request_path TEXT,
  
  -- Status tracking
  status_code INTEGER, -- HTTP status code
  error_message TEXT, -- If operation failed
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Step 2: Add indexes for efficient querying
-- ============================================================================

CREATE INDEX idx_audit_logs_account_id ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX idx_audit_logs_account_entity ON audit_logs(account_id, entity_type, created_at DESC);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- ============================================================================
-- Step 3: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see audit logs from their account
CREATE POLICY audit_logs_account_isolation
  ON audit_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id 
      FROM users 
      WHERE id = current_setting('app.user_id', true)::uuid
    )
  );

-- Policy: Only admins can view audit logs (additional check)
CREATE POLICY audit_logs_admin_only
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = current_setting('app.user_id', true)::uuid
        AND r.name IN ('Admin', 'Manager')
        AND r.account_id = audit_logs.account_id
    )
  );

-- Policy: System can insert audit logs (bypass RLS for inserts)
CREATE POLICY audit_logs_insert_system
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Step 4: Create audit logging helper function
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit(
  p_account_id UUID,
  p_user_id UUID,
  p_action VARCHAR(50),
  p_entity_type VARCHAR(100),
  p_entity_id UUID,
  p_changes JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_request_method VARCHAR(10) DEFAULT NULL,
  p_request_path TEXT DEFAULT NULL,
  p_status_code INTEGER DEFAULT 200,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    account_id,
    user_id,
    action,
    entity_type,
    entity_id,
    changes,
    ip_address,
    user_agent,
    request_method,
    request_path,
    status_code,
    error_message,
    created_at
  )
  VALUES (
    p_account_id,
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_changes,
    p_ip_address,
    p_user_agent,
    p_request_method,
    p_request_path,
    p_status_code,
    p_error_message,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ============================================================================
-- Step 5: Create view for audit trail reports
-- ============================================================================

CREATE OR REPLACE VIEW audit_trail AS
SELECT 
  al.id,
  al.account_id,
  a.name as account_name,
  al.user_id,
  u.email as user_email,
  CONCAT(u.first_name, ' ', u.last_name) as user_name,
  al.action,
  al.entity_type,
  al.entity_id,
  al.changes,
  al.ip_address,
  al.user_agent,
  al.request_method,
  al.request_path,
  al.status_code,
  al.error_message,
  al.created_at
FROM audit_logs al
LEFT JOIN accounts a ON al.account_id = a.id
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- ============================================================================
-- Step 6: Grant permissions
-- ============================================================================

-- Note: Application uses nexo_user role directly, no additional grants needed
-- RLS policies control access based on app.user_id session variable

-- ============================================================================
-- Step 7: Create retention policy function (optional cleanup)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % audit logs older than % days', deleted_count, retention_days;
  
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- Step 8: Migration completion
-- ============================================================================

DO $$
DECLARE
  v_table_count INTEGER;
  v_index_count INTEGER;
  v_policy_count INTEGER;
BEGIN
  -- Verify table exists
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_name = 'audit_logs';
  
  -- Verify indexes exist
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE tablename = 'audit_logs';
  
  -- Verify RLS policies exist
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'audit_logs';
  
  RAISE NOTICE 'Phase 6.2 Audit Logging Migration Summary:';
  RAISE NOTICE '- Tables created: %', v_table_count;
  RAISE NOTICE '- Indexes created: %', v_index_count;
  RAISE NOTICE '- RLS policies created: %', v_policy_count;
  RAISE NOTICE 'Audit logging system is ready!';
END;
$$;

COMMIT;

-- ============================================================================
-- Usage Examples:
-- ============================================================================

-- Example 1: Log a client creation
-- SELECT log_audit(
--   '00000000-0000-0000-0000-000000000001', -- account_id
--   '8a9fb033-5b5b-4a64-af32-286987be65cf', -- user_id
--   'CREATE', -- action
--   'client', -- entity_type
--   '123e4567-e89b-12d3-a456-426614174000', -- entity_id
--   '{"new": {"name": "John Doe", "email": "john@example.com"}}'::jsonb, -- changes
--   '192.168.1.1'::inet, -- ip_address
--   'Mozilla/5.0...', -- user_agent
--   'POST', -- request_method
--   '/api/clients', -- request_path
--   201, -- status_code
--   NULL -- error_message
-- );

-- Example 2: Query audit trail for an entity
-- SELECT * FROM audit_trail
-- WHERE entity_type = 'client'
--   AND entity_id = '123e4567-e89b-12d3-a456-426614174000'
-- ORDER BY created_at DESC;

-- Example 3: Find all changes by a user
-- SELECT * FROM audit_trail
-- WHERE user_email = 'admin@acme.com'
--   AND action IN ('UPDATE', 'DELETE')
-- ORDER BY created_at DESC
-- LIMIT 50;

-- Example 4: Cleanup old logs (run as cron job)
-- SELECT cleanup_old_audit_logs(90); -- Keep last 90 days
