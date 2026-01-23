-- @version: 1.0.0
-- @name: Initial Multi-Tenant Setup with RLS
-- @description: Creates database extensions, enables RLS, and sets up tenant isolation policies

-- ============================================
-- STEP 1: Enable PostgreSQL Extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: Helper Functions
-- ============================================

-- Function to get current user's account_id from session
CREATE OR REPLACE FUNCTION current_user_account_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_account_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- STEP 3: Enable Row Level Security on Tables
-- ============================================

-- Note: Tables should already exist from Prisma migration
-- This script only enables RLS and creates policies

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Accounts table policy
DROP POLICY IF EXISTS accounts_isolation_policy ON accounts;
CREATE POLICY accounts_isolation_policy ON accounts
    FOR ALL
    USING (id = current_user_account_id());

-- Roles table policy
DROP POLICY IF EXISTS roles_isolation_policy ON roles;
CREATE POLICY roles_isolation_policy ON roles
    FOR ALL
    USING (account_id = current_user_account_id());

-- Users table policy
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (account_id = current_user_account_id());

-- Clients table policy
DROP POLICY IF EXISTS clients_isolation_policy ON clients;
CREATE POLICY clients_isolation_policy ON clients
    FOR ALL
    USING (account_id = current_user_account_id());

-- Suppliers table policy
DROP POLICY IF EXISTS suppliers_isolation_policy ON suppliers;
CREATE POLICY suppliers_isolation_policy ON suppliers
    FOR ALL
    USING (account_id = current_user_account_id());

-- Employees table policy
DROP POLICY IF EXISTS employees_isolation_policy ON employees;
CREATE POLICY employees_isolation_policy ON employees
    FOR ALL
    USING (account_id = current_user_account_id());

-- Professionals table policy
DROP POLICY IF EXISTS professionals_isolation_policy ON professionals;
CREATE POLICY professionals_isolation_policy ON professionals
    FOR ALL
    USING (account_id = current_user_account_id());

-- ============================================
-- STEP 5: Create Triggers for updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Seed Default Data (Development Only)
-- ============================================

-- Create default account for development
INSERT INTO accounts (id, name, slug, settings, active)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Default Account',
    'default',
    '{}'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Create default admin role
INSERT INTO roles (account_id, name, permissions)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin',
    '["*"]'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM roles 
    WHERE account_id = '00000000-0000-0000-0000-000000000001'::uuid 
    AND name = 'admin'
);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    rls_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check RLS is enabled
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true;

    -- Check policies exist
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║   Multi-Tenant Setup Complete!                            ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS enabled on % tables', rls_count;
    RAISE NOTICE 'RLS policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'To use RLS, set account_id before queries:';
    RAISE NOTICE '  SET app.current_account_id = ''<account-uuid>'';';
    RAISE NOTICE '';
END $$;
