-- Migration: Remove SUPERUSER and BYPASSRLS from nexo_user
-- Date: 2026-01-23 21:00
-- Description: Make nexo_user subject to RLS policies by removing SUPERUSER and BYPASSRLS

-- Remove SUPERUSER and BYPASSRLS from nexo_user
-- This is CRITICAL for RLS to work properly
ALTER ROLE nexo_user NOSUPERUSER NOBYPASSRLS;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║   User Privileges Updated - RLS Now Enforced             ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  nexo_user is now a REGULAR USER (not superuser)';
    RAISE NOTICE '✅ RLS policies will now be enforced for nexo_user';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes:';
    RAISE NOTICE '  - NOSUPERUSER: User is no longer a database superuser';
    RAISE NOTICE '  - NOBYPASSRLS: User cannot bypass Row Level Security';
    RAISE NOTICE '';
END $$;
