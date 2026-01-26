-- ============================================================================
-- Phase 6.1: Role-Based Access Control (RBAC)
-- ============================================================================
-- Migration: 20260126_1100_phase6_rbac.sql
-- Purpose: Add roles and permissions system for fine-grained access control
-- Author: NEXO Development Team
-- Date: January 26, 2026
-- ============================================================================

BEGIN;

-- =====================================================
-- 1. CREATE ROLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_role_per_account UNIQUE(account_id, name)
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_isolation_policy ON roles
  USING (account_id = current_user_account_id())
  WITH CHECK (account_id = current_user_account_id());

-- Indexes
CREATE INDEX idx_roles_account ON roles(account_id);
CREATE INDEX idx_roles_name ON roles(account_id, name);

-- Trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CREATE PERMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(50) NOT NULL, -- e.g., 'client', 'employee', 'project'
  action VARCHAR(50) NOT NULL,   -- e.g., 'read', 'write', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions are global, not account-specific (no RLS needed)

-- Indexes
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);

-- =====================================================
-- 3. CREATE ROLE_PERMISSIONS JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- Indexes
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- =====================================================
-- 4. CREATE USER_ROLES JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see role assignments in their account
CREATE POLICY user_roles_isolation_policy ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = user_roles.user_id 
      AND u.account_id = current_user_account_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = user_roles.user_id 
      AND u.account_id = current_user_account_id()
    )
  );

-- Indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- =====================================================
-- 5. INSERT DEFAULT PERMISSIONS
-- =====================================================

-- Client permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('client:read', 'View client information', 'client', 'read'),
  ('client:write', 'Create and update clients', 'client', 'write'),
  ('client:delete', 'Delete clients', 'client', 'delete'),
  ('client:*', 'Full access to clients', 'client', '*');

-- Employee permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('employee:read', 'View employee information', 'employee', 'read'),
  ('employee:write', 'Create and update employees', 'employee', 'write'),
  ('employee:delete', 'Delete employees', 'employee', 'delete'),
  ('employee:*', 'Full access to employees', 'employee', '*');

-- Professional permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('professional:read', 'View professional information', 'professional', 'read'),
  ('professional:write', 'Create and update professionals', 'professional', 'write'),
  ('professional:delete', 'Delete professionals', 'professional', 'delete'),
  ('professional:*', 'Full access to professionals', 'professional', '*');

-- Project permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('project:read', 'View project information', 'project', 'read'),
  ('project:write', 'Create and update projects', 'project', 'write'),
  ('project:delete', 'Delete projects', 'project', 'delete'),
  ('project:*', 'Full access to projects', 'project', '*');

-- Task permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('task:read', 'View task information', 'task', 'read'),
  ('task:write', 'Create and update tasks', 'task', 'write'),
  ('task:delete', 'Delete tasks', 'task', 'delete'),
  ('task:*', 'Full access to tasks', 'task', '*');

-- Supplier permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('supplier:read', 'View supplier information', 'supplier', 'read'),
  ('supplier:write', 'Create and update suppliers', 'supplier', 'write'),
  ('supplier:delete', 'Delete suppliers', 'supplier', 'delete'),
  ('supplier:*', 'Full access to suppliers', 'supplier', '*');

-- Admin permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('account:manage', 'Manage account settings', 'account', 'manage'),
  ('role:manage', 'Manage roles and permissions', 'role', 'manage'),
  ('user:manage', 'Manage users', 'user', 'manage');

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND (p.name = p_permission_name OR p.name = SPLIT_PART(p_permission_name, ':', 1) || ':*')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_name VARCHAR,
  resource VARCHAR,
  action VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.resource, p.action
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
  ORDER BY p.resource, p.action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default roles for new account
CREATE OR REPLACE FUNCTION create_default_roles_for_account(p_account_id UUID)
RETURNS VOID AS $$
DECLARE
  v_admin_role_id UUID;
  v_manager_role_id UUID;
  v_employee_role_id UUID;
  v_client_role_id UUID;
BEGIN
  -- Create Admin role with all permissions
  INSERT INTO roles (account_id, name, description, is_system)
  VALUES (p_account_id, 'Admin', 'Full system access', true)
  RETURNING id INTO v_admin_role_id;

  -- Assign all permissions to Admin
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT v_admin_role_id, id FROM permissions;

  -- Create Manager role
  INSERT INTO roles (account_id, name, description, is_system)
  VALUES (p_account_id, 'Manager', 'Can manage clients, projects, and tasks', true)
  RETURNING id INTO v_manager_role_id;

  -- Assign Manager permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT v_manager_role_id, id FROM permissions
  WHERE name IN (
    'client:*', 'project:*', 'task:*', 'professional:read', 
    'supplier:read', 'employee:read'
  );

  -- Create Employee role
  INSERT INTO roles (account_id, name, description, is_system)
  VALUES (p_account_id, 'Employee', 'Can view and update assigned tasks', true)
  RETURNING id INTO v_employee_role_id;

  -- Assign Employee permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT v_employee_role_id, id FROM permissions
  WHERE name IN (
    'client:read', 'project:read', 'task:read', 'task:write'
  );

  -- Create Client role (read-only)
  INSERT INTO roles (account_id, name, description, is_system)
  VALUES (p_account_id, 'Client', 'Limited read access', true)
  RETURNING id INTO v_client_role_id;

  -- Assign Client permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT v_client_role_id, id FROM permissions
  WHERE name IN ('project:read', 'task:read');

  RAISE NOTICE 'Default roles created for account %', p_account_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. CREATE ROLES FOR EXISTING ACCOUNTS
-- =====================================================

-- Create default roles for all existing accounts
DO $$
DECLARE
  account_record RECORD;
BEGIN
  FOR account_record IN SELECT id FROM accounts LOOP
    PERFORM create_default_roles_for_account(account_record.id);
  END LOOP;
  RAISE NOTICE 'Default roles created for all existing accounts';
END $$;

-- =====================================================
-- 8. AUTO-ASSIGN ADMIN ROLE TO EXISTING USERS
-- =====================================================

-- Assign Admin role to all existing users (they created the accounts)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.account_id = u.account_id
WHERE r.name = 'Admin'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- 9. VALIDATION
-- =====================================================

DO $$
DECLARE
  v_role_count INT;
  v_permission_count INT;
  v_user_role_count INT;
BEGIN
  -- Check roles created
  SELECT COUNT(*) INTO v_role_count FROM roles;
  IF v_role_count = 0 THEN
    RAISE EXCEPTION 'No roles created';
  END IF;
  RAISE NOTICE 'Created % roles', v_role_count;

  -- Check permissions created  
  SELECT COUNT(*) INTO v_permission_count FROM permissions;
  IF v_permission_count < 20 THEN
    RAISE EXCEPTION 'Insufficient permissions created';
  END IF;
  RAISE NOTICE 'Created % permissions', v_permission_count;

  -- Check user role assignments
  SELECT COUNT(*) INTO v_user_role_count FROM user_roles;
  RAISE NOTICE 'Assigned roles to % users', v_user_role_count;

  RAISE NOTICE 'Phase 6.1 RBAC schema migration completed successfully';
END $$;

COMMIT;
