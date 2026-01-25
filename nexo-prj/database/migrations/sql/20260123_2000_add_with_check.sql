-- Migration: Fix RLS policies to include WITH CHECK clause
-- Date: 2026-01-23 20:00
-- Description: Add WITH CHECK clause to RLS policies for INSERT/UPDATE protection

-- ============================================
-- Recreate policies with WITH CHECK clause
-- ============================================

-- Roles table policy
DROP POLICY IF EXISTS roles_isolation_policy ON roles;
CREATE POLICY roles_isolation_policy ON roles
    FOR ALL
    USING (account_id = current_user_account_id())
    WITH CHECK (account_id = current_user_account_id());

-- Users table policy
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (account_id = current_user_account_id())
    WITH CHECK (account_id = current_user_account_id());

-- Clients table policy
DROP POLICY IF EXISTS clients_isolation_policy ON clients;
CREATE POLICY clients_isolation_policy ON clients
    FOR ALL
    USING (account_id = current_user_account_id())
    WITH CHECK (account_id = current_user_account_id());

-- Suppliers table policy
DROP POLICY IF EXISTS suppliers_isolation_policy ON suppliers;
CREATE POLICY suppliers_isolation_policy ON suppliers
    FOR ALL
    USING (account_id = current_user_account_id())
    WITH CHECK (account_id = current_user_account_id());

-- Employees table policy
DROP POLICY IF EXISTS employees_isolation_policy ON employees;
CREATE POLICY employees_isolation_policy ON employees
    FOR ALL
    USING (account_id = current_user_account_id())
    WITH CHECK (account_id = current_user_account_id());

-- Professionals table policy
DROP POLICY IF EXISTS professionals_isolation_policy ON professionals;
CREATE POLICY professionals_isolation_policy ON professionals
    FOR ALL
    USING (account_id = current_user_account_id())
    WITH CHECK (account_id = current_user_account_id());

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║   RLS Policies Updated with WITH CHECK Clauses           ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'All policies now have both USING and WITH CHECK clauses';
    RAISE NOTICE 'This protects SELECT, UPDATE, DELETE (USING) and INSERT, UPDATE (WITH CHECK)';
    RAISE NOTICE '';
END $$;
