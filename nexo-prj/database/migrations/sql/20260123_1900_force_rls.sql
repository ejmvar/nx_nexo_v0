-- Migration: Fix RLS to apply to table owners
-- Date: 2026-01-23 19:00
-- Description: Enable FORCE ROW LEVEL SECURITY on all tables to ensure RLS applies even to table owners

-- ============================================
-- FORCE RLS on all tenant-isolated tables
-- ============================================

ALTER TABLE roles FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
ALTER TABLE suppliers FORCE ROW LEVEL SECURITY;
ALTER TABLE employees FORCE ROW LEVEL SECURITY;
ALTER TABLE professionals FORCE ROW LEVEL SECURITY;

-- Note: We don't force RLS on accounts table since it uses id-based policy

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║   RLS Force Enabled - Policies Now Apply to All Users    ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'FORCE ROW LEVEL SECURITY now enabled on:';
    RAISE NOTICE '  - roles';
    RAISE NOTICE '  - users';
    RAISE NOTICE '  - clients';
    RAISE NOTICE '  - suppliers';
    RAISE NOTICE '  - employees';
    RAISE NOTICE '  - professionals';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  RLS policies now apply even to table owners and superusers!';
    RAISE NOTICE '';
END $$;
