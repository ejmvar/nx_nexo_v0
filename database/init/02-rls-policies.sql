-- NEXO CRM - Row Level Security Policies
-- ========================================
-- Multi-tenant isolation using RLS

-- Helper function to get current user's account_id
-- This should be set by the application when establishing connection
CREATE OR REPLACE FUNCTION current_user_account_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_account_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Accounts table policies
DROP POLICY IF EXISTS accounts_isolation_policy ON accounts;
CREATE POLICY accounts_isolation_policy ON accounts
    FOR ALL
    USING (id = current_user_account_id());

-- Roles table policies
DROP POLICY IF EXISTS roles_isolation_policy ON roles;
CREATE POLICY roles_isolation_policy ON roles
    FOR ALL
    USING (account_id = current_user_account_id());

-- Users table policies
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (account_id = current_user_account_id());

-- Clients table policies
DROP POLICY IF EXISTS clients_isolation_policy ON clients;
CREATE POLICY clients_isolation_policy ON clients
    FOR ALL
    USING (account_id = current_user_account_id());

-- Suppliers table policies
DROP POLICY IF EXISTS suppliers_isolation_policy ON suppliers;
CREATE POLICY suppliers_isolation_policy ON suppliers
    FOR ALL
    USING (account_id = current_user_account_id());

-- Employees table policies
DROP POLICY IF EXISTS employees_isolation_policy ON employees;
CREATE POLICY employees_isolation_policy ON employees
    FOR ALL
    USING (account_id = current_user_account_id());

-- Professionals table policies
DROP POLICY IF EXISTS professionals_isolation_policy ON professionals;
CREATE POLICY professionals_isolation_policy ON professionals
    FOR ALL
    USING (account_id = current_user_account_id());

-- Output RLS setup complete
DO $$
BEGIN
    RAISE NOTICE 'Row Level Security policies created successfully!';
    RAISE NOTICE 'To use RLS, set app.current_account_id before queries:';
    RAISE NOTICE '  SET app.current_account_id = ''<account-uuid>'';';
END $$;
