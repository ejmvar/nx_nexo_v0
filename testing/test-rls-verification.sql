-- ============================================================================
-- NEXO CRM - Row-Level Security (RLS) Verification Tests
-- Purpose: Verify that RLS policies correctly isolate data between accounts
-- Date: 2026-02-03
-- ============================================================================
-- This script tests:
-- - Account isolation: Users can only see their account's data
-- - Cross-account data leakage prevention
-- - Role-based access control
-- - Public data access
-- ============================================================================

\set ON_ERROR_STOP on
\set VERBOSITY verbose

\echo '============================================================================'
\echo 'NEXO CRM - RLS Verification Test Suite'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- TEST 1: Account Isolation for Clients
-- ============================================================================

\echo 'TEST 1: Verify Account 1 user can only see Account 1 clients'
\echo '-----------------------------------------------------------'

-- Set user context to Account 1 user (TechFlow Admin)
SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111';

-- Count clients - should only see Account 1 clients
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM clients WHERE account_id = '11111111-1111-1111-1111-111111111111')
    THEN '✅ PASS: Account 1 user sees only Account 1 clients (' || COUNT(*) || ' clients)'
    ELSE '❌ FAIL: Account 1 user sees clients from other accounts'
  END AS test_result
FROM clients;

-- Verify cannot see Account 2 clients
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM clients 
      WHERE account_id = '22222222-2222-2222-2222-222222222222'
    )
    THEN '✅ PASS: Account 1 user cannot see Account 2 clients'
    ELSE '❌ FAIL: Account 1 user can see Account 2 clients (DATA LEAK!)'
  END AS test_result;

\echo ''

-- ============================================================================
-- TEST 2: Account Isolation for Projects
-- ============================================================================

\echo 'TEST 2: Verify Account 2 user can only see Account 2 projects'
\echo '-----------------------------------------------------------'

-- Set user context to Account 2 user (Creative Minds Admin)
SET LOCAL app.current_account_id = '22222222-2222-2222-2222-222222222222';

-- Count projects - should only see Account 2 projects
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM projects WHERE account_id = '22222222-2222-2222-2222-222222222222')
    THEN '✅ PASS: Account 2 user sees only Account 2 projects (' || COUNT(*) || ' projects)'
    ELSE '❌ FAIL: Account 2 user sees projects from other accounts'
  END AS test_result
FROM projects;

-- Verify cannot see Account 1 or Account 3 projects
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM projects 
      WHERE account_id != '22222222-2222-2222-2222-222222222222'
    )
    THEN '✅ PASS: Account 2 user cannot see other accounts'' projects'
    ELSE '❌ FAIL: Account 2 user can see other accounts'' projects (DATA LEAK!)'
  END AS test_result;

\echo ''

-- ============================================================================
-- TEST 3: Account Isolation for Tasks
-- ============================================================================

\echo 'TEST 3: Verify Account 3 user can only see Account 3 tasks'
\echo '--------------------------------------------------------'

-- Set user context to Account 3 user (BuildRight Employee)
SET LOCAL app.current_account_id = '33333333-3333-3333-3333-333333333333';

-- Count tasks - should only see Account 3 tasks
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM tasks WHERE account_id = '33333333-3333-3333-3333-333333333333')
    THEN '✅ PASS: Account 3 user sees only Account 3 tasks (' || COUNT(*) || ' tasks)'
    ELSE '❌ FAIL: Account 3 user sees tasks from other accounts'
  END AS test_result
FROM tasks;

-- Verify task details match account
SELECT 
  CASE 
    WHEN COUNT(DISTINCT account_id) = 1 AND MIN(account_id) = '33333333-3333-3333-3333-333333333333'
    THEN '✅ PASS: All visible tasks belong to Account 3'
    ELSE '❌ FAIL: Visible tasks belong to multiple accounts (DATA LEAK!)'
  END AS test_result
FROM tasks;

\echo ''

-- ============================================================================
-- TEST 4: Account Isolation for Files
-- ============================================================================

\echo 'TEST 4: Verify Account 4 user can only see Account 4 files'
\echo '--------------------------------------------------------'

-- Set user context to Account 4 user (HealthCare Manager)
SET LOCAL app.current_account_id = '44444444-4444-4444-4444-444444444444';

-- Count files - should only see Account 4 files
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM files WHERE account_id = '44444444-4444-4444-4444-444444444444' AND deleted_at IS NULL)
    THEN '✅ PASS: Account 4 user sees only Account 4 files (' || COUNT(*) || ' files)'
    ELSE '❌ FAIL: Account 4 user sees files from other accounts'
  END AS test_result
FROM files
WHERE deleted_at IS NULL;

-- Verify cannot access Account 1 files
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM files 
      WHERE account_id = '11111111-1111-1111-1111-111111111111'
      AND deleted_at IS NULL
    )
    THEN '✅ PASS: Account 4 user cannot see Account 1 files'
    ELSE '❌ FAIL: Account 4 user can see Account 1 files (DATA LEAK!)'
  END AS test_result;

\echo ''

-- ============================================================================
-- TEST 5: Public Files Access
-- ============================================================================

\echo 'TEST 5: Verify public files are accessible across accounts'
\echo '--------------------------------------------------------'

-- Reset to Account 5 user
SET LOCAL app.current_account_id = '55555555-5555-5555-5555-555555555555';

-- Check if public files from other accounts are visible
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM files 
      WHERE is_public = true 
      AND account_id != '55555555-5555-5555-5555-555555555555'
      AND deleted_at IS NULL
    )
    THEN '✅ PASS: Public files from other accounts are visible'
    ELSE '⚠️  INFO: No public files from other accounts exist (expected for test data)'
  END AS test_result;

-- Verify own public files are visible
SELECT 
  CASE 
    WHEN COUNT(*) > 0
    THEN '✅ PASS: Own account''s files are visible (' || COUNT(*) || ' files)'
    ELSE '⚠️  INFO: No files in Account 5'
  END AS test_result
FROM files
WHERE account_id = '55555555-5555-5555-5555-555555555555'
AND deleted_at IS NULL;

\echo ''

-- ============================================================================
-- TEST 6: User Context Validation
-- ============================================================================

\echo 'TEST 6: Verify user context enforcement'
\echo '-------------------------------------'

-- Test with Account 1 Admin
SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111';

SELECT 
  CASE 
    WHEN current_setting('app.user_id', true)::uuid = '11111111-1111-1111-1111-111111111111'
    THEN '✅ PASS: User context correctly set'
    ELSE '❌ FAIL: User context not set correctly'
  END AS test_result;

-- Verify account association
SELECT 
  CASE 
    WHEN u.account_id = '11111111-1111-1111-1111-111111111111'
    THEN '✅ PASS: User belongs to expected account'
    ELSE '❌ FAIL: User account mismatch'
  END AS test_result
FROM users u
WHERE u.id = current_setting('app.user_id', true)::uuid;

\echo ''

-- ============================================================================
-- TEST 7: Cross-Account Query Prevention
-- ============================================================================

\echo 'TEST 7: Attempt to query cross-account data explicitly'
\echo '-----------------------------------------------------'

-- Set user to Account 2
SET LOCAL app.current_account_id = '22222222-2222-2222-2222-222222222222';

-- Try to explicitly query Account 1 client by ID (should return 0 rows)
SELECT 
  CASE 
    WHEN COUNT(*) = 0
    THEN '✅ PASS: Cannot query specific client from another account'
    ELSE '❌ FAIL: Able to query client from another account (SECURITY BREACH!)'
  END AS test_result
FROM clients
WHERE id = 'c1111111-1111-1111-1111-111111111111'; -- Account 1 client

-- Try to query Account 1 project (should return 0 rows)
SELECT 
  CASE 
    WHEN COUNT(*) = 0
    THEN '✅ PASS: Cannot query specific project from another account'
    ELSE '❌ FAIL: Able to query project from another account (SECURITY BREACH!)'
  END AS test_result
FROM projects
WHERE id = 'pr111111-1111-1111-1111-111111111111'; -- Account 1 project

\echo ''

-- ============================================================================
-- TEST 8: Audit Logs Isolation
-- ============================================================================

\echo 'TEST 8: Verify audit logs are isolated by account'
\echo '-----------------------------------------------'

-- Set user to Account 1
SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111';

-- Count audit logs - should only see Account 1 logs
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM audit_logs WHERE account_id = '11111111-1111-1111-1111-111111111111')
    THEN '✅ PASS: User sees only their account''s audit logs (' || COUNT(*) || ' logs)'
    ELSE '❌ FAIL: User sees audit logs from other accounts'
  END AS test_result
FROM audit_logs;

-- Verify no cross-account audit logs visible
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM audit_logs 
      WHERE account_id != '11111111-1111-1111-1111-111111111111'
    )
    THEN '✅ PASS: No cross-account audit logs visible'
    ELSE '❌ FAIL: Cross-account audit logs are visible (DATA LEAK!)'
  END AS test_result;

\echo ''

-- ============================================================================
-- TEST 9: Suppliers Isolation
-- ============================================================================

\echo 'TEST 9: Verify suppliers are isolated by account'
\echo '----------------------------------------------'

-- Set user to Account 3
SET LOCAL app.current_account_id = '33333333-3333-3333-3333-333333333333';

-- Count suppliers - should only see Account 3 suppliers
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM suppliers WHERE account_id = '33333333-3333-3333-3333-333333333333')
    THEN '✅ PASS: User sees only their account''s suppliers (' || COUNT(*) || ' suppliers)'
    ELSE '❌ FAIL: User sees suppliers from other accounts'
  END AS test_result
FROM suppliers;

-- Verify cannot see Account 1 suppliers
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM suppliers 
      WHERE account_id = '11111111-1111-1111-1111-111111111111'
    )
    THEN '✅ PASS: Cannot see suppliers from other accounts'
    ELSE '❌ FAIL: Can see suppliers from other accounts (DATA LEAK!)'
  END AS test_result;

\echo ''

-- ============================================================================
-- TEST 10: Professionals Isolation
-- ============================================================================

\echo 'TEST 10: Verify professionals are isolated by account'
\echo '--------------------------------------------------'

-- Set user to Account 2
SET LOCAL app.current_account_id = '22222222-2222-2222-2222-222222222222';

-- Count professionals - should only see Account 2 professionals
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM professionals WHERE account_id = '22222222-2222-2222-2222-222222222222')
    THEN '✅ PASS: User sees only their account''s professionals (' || COUNT(*) || ' professionals)'
    ELSE '❌ FAIL: User sees professionals from other accounts'
  END AS test_result
FROM professionals;

\echo ''

-- ============================================================================
-- TEST 11: Role and Permission Isolation
-- ============================================================================

\echo 'TEST 11: Verify roles are isolated by account'
\echo '-------------------------------------------'

-- Set user to Account 1
SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111';

-- Count roles - should only see Account 1 roles
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM roles WHERE account_id = '11111111-1111-1111-1111-111111111111')
    THEN '✅ PASS: User sees only their account''s roles (' || COUNT(*) || ' roles)'
    ELSE '❌ FAIL: User sees roles from other accounts'
  END AS test_result
FROM roles;

-- Verify cannot see roles from other accounts
SELECT 
  CASE 
    WHEN COUNT(DISTINCT account_id) = 1
    THEN '✅ PASS: All visible roles belong to the same account'
    ELSE '❌ FAIL: Visible roles belong to multiple accounts (DATA LEAK!)'
  END AS test_result
FROM roles;

\echo ''

-- ============================================================================
-- TEST 12: Employee Data Isolation
-- ============================================================================

\echo 'TEST 12: Verify employees are isolated by account'
\echo '-----------------------------------------------'

-- Set user to Account 4
SET LOCAL app.current_account_id = 'a4444444-4444-4444-4444-444444444441';

-- Count employees (users) - should only see Account 4 users
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM users WHERE account_id = '44444444-4444-4444-4444-444444444444')
    THEN '✅ PASS: User sees only their account''s employees (' || COUNT(*) || ' users)'
    ELSE '❌ FAIL: User sees employees from other accounts'
  END AS test_result
FROM users;

-- Verify all visible users belong to same account
SELECT 
  CASE 
WHEN COUNT(DISTINCT account_id) = 1 AND MIN(account_id) = '44444444-4444-4444-4444-444444444444'
    THEN '✅ PASS: All visible users belong to Account 4'
    ELSE '❌ FAIL: Visible users belong to multiple accounts (DATA LEAK!)'
  END AS test_result
FROM users;

\echo ''

-- ============================================================================
-- TEST 13: Multi-Tenant Data Integrity
-- ============================================================================

\echo 'TEST 13: Verify data integrity across all tables'
\echo '----------------------------------------------'

-- Check that all entity relationships respect account boundaries
-- Example: All tasks belong to projects in the same account

SELECT 
  CASE 
    WHEN COUNT(*) = 0
    THEN '✅ PASS: All tasks belong to projects in the same account'
    ELSE '❌ FAIL: ' || COUNT(*) || ' tasks belong to projects in different accounts (DATA INTEGRITY ISSUE!)'
  END AS test_result
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.account_id != p.account_id;

-- Check that all projects belong to clients in the same account
SELECT 
  CASE 
    WHEN COUNT(*) = 0
    THEN '✅ PASS: All projects belong to clients in the same account'
    ELSE '❌ FAIL: ' || COUNT(*) || ' projects belong to clients in different accounts (DATA INTEGRITY ISSUE!)'
  END AS test_result
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
WHERE p.client_id IS NOT NULL AND p.account_id != c.account_id;

-- Check that all files with entity associations are in the same account
SELECT 
  CASE 
    WHEN COUNT(*) = 0
    THEN '✅ PASS: All files with entity associations are in the same account'
    ELSE '❌ FAIL: ' || COUNT(*) || ' files have entity associations in different accounts (DATA INTEGRITY ISSUE!)'
  END AS test_result
FROM files f
LEFT JOIN projects p ON f.entity_type = 'project' AND f.entity_id = p.id
WHERE f.entity_type = 'project' AND f.entity_id IS NOT NULL AND f.account_id != p.account_id;

\echo ''

-- ============================================================================
-- Final Summary
-- ============================================================================

\echo '============================================================================'
\echo 'RLS VERIFICATION TEST SUITE COMPLETED'
\echo '============================================================================'
\echo ''
\echo 'Key Points:'
\echo '  • Each account can only see its own data'
\echo '  • Cross-account queries return 0 results'
\echo '  • Data integrity is maintained across relationships'
\echo '  • Public data access policies work correctly'
\echo ''
\echo 'If any tests show ❌ FAIL, investigate RLS policies immediately!'
\echo '============================================================================'
