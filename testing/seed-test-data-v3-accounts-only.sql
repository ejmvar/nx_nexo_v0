-- ============================================================================
-- NEXO CRM - Test Accounts with Role Creation
-- ============================================================================
-- Purpose: Insert accounts and create default roles
-- Version: 3.0 (Trigger fix)
-- ============================================================================

BEGIN;

-- Insert accounts
INSERT INTO accounts (id, name, slug, settings, active, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechFlow Solutions', 'techflow-test', 
   '{"industry": "technology", "timezone": "America/New_York", "currency": "USD"}'::jsonb, 
   true, NOW(), NOW()),
  
  ('22222222-2222-2222-2222-222222222222', 'Creative Minds Agency', 'creative-test', 
   '{"industry": "marketing", "timezone": "Europe/London", "currency": "GBP"}'::jsonb, 
   true, NOW(), NOW()),
  
  ('33333333-3333-3333-3333-333333333333', 'BuildRight Construction', 'buildright-test', 
   '{"industry": "construction", "timezone": "America/Los_Angeles", "currency": "USD"}'::jsonb, 
   true, NOW(), NOW()),
  
  ('44444444-4444-4444-4444-444444444444', 'HealthCare Plus', 'healthcare-test', 
   '{"industry": "healthcare", "timezone": "America/Chicago", "currency": "USD"}'::jsonb, 
   true, NOW(), NOW()),
  
  ('55555555-5555-5555-5555-555555555555', 'Industrial Solutions Corp', 'industrial-test', 
   '{"industry": "manufacturing", "timezone": "Europe/Berlin", "currency": "EUR"}'::jsonb, 
   true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create default roles for each account
SELECT create_default_roles_for_account('11111111-1111-1111-1111-111111111111');
SELECT create_default_roles_for_account('22222222-2222-2222-2222-222222222222');
SELECT create_default_roles_for_account('33333333-3333-3333-3333-333333333333');
SELECT create_default_roles_for_account('44444444-4444-4444-4444-444444444444');
SELECT create_default_roles_for_account('55555555-5555-5555-5555-555555555555');

COMMIT;

-- Verify
DO $$
DECLARE
  account_count INT;
  role_count INT;
BEGIN
  SELECT COUNT(*) INTO account_count FROM accounts 
  WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
  );
  
  SELECT COUNT(*) INTO role_count FROM roles 
  WHERE account_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Test Accounts Created: % (expected: 5)', account_count;
  RAISE NOTICE '✅ Default Roles Created: % (expected: 20)', role_count;
  RAISE NOTICE '';
END $$;
