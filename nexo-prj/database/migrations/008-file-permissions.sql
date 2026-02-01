-- =====================================================
-- Phase 6.5: File Storage RBAC Permissions
-- 
-- Adds file management permissions to the RBAC system
-- Date: 2026-02-01
-- =====================================================

-- =====================================================
-- 1. ADD FILE PERMISSIONS
-- =====================================================

-- File permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('file:read', 'View and download files', 'file', 'read'),
  ('file:write', 'Upload and update files', 'file', 'write'),
  ('file:delete', 'Delete files', 'file', 'delete'),
  ('file:*', 'Full access to files', 'file', '*');

-- =====================================================
-- 2. UPDATE DEFAULT ROLES WITH FILE PERMISSIONS
-- =====================================================

-- Add file permissions to Admin role (file:*)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin'
AND p.name = 'file:*'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Add file:read and file:write to Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manager'
AND p.name IN ('file:read', 'file:write')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Add file:read to Employee role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Employee'
AND p.name = 'file:read'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Add file:read to Viewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Viewer'
AND p.name = 'file:read'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- =====================================================
-- 3. VERIFICATION
-- =====================================================

-- Verify file permissions were added
SELECT 
  'File Permissions' as check_name,
  COUNT(*) as permission_count
FROM permissions
WHERE resource = 'file';

-- Verify role assignments
SELECT 
  r.name as role_name,
  COUNT(DISTINCT p.id) as file_permission_count,
  ARRAY_AGG(DISTINCT p.name ORDER BY p.name) as permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'file'
GROUP BY r.name
ORDER BY r.name;

-- =====================================================
-- 4. COMMENTS
-- =====================================================

COMMENT ON TABLE permissions IS 'Stores fine-grained permissions for RBAC system. Updated in Phase 6.5 to include file storage permissions.';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- 
-- Added:
-- - 4 file permissions (read, write, delete, *)
-- - Role mappings:
--   * Admin: file:*
--   * Manager: file:read, file:write
--   * Employee: file:read
--   * Viewer: file:read
-- 
-- =====================================================
