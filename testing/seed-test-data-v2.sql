-- ============================================================================
-- NEXO CRM - Test Data Seed Script (Schema-Aligned Version)
-- ============================================================================
-- Purpose: Populate database with comprehensive multi-tenant test data
-- Aligned with: Phase 6 schema (RBAC, File Storage, RLS)
-- Version: 2.0 (Schema-corrected)
-- Date: February 5, 2026
-- ============================================================================

BEGIN;

-- ============================================================================
-- TEST ACCOUNTS (5 tenants for isolation testing)
-- ============================================================================

INSERT INTO accounts (id, name, slug, settings, active, created_at, updated_at)
VALUES
  -- Account 1: Technology Startup
  ('11111111-1111-1111-1111-111111111111', 'TechFlow Solutions', 'techflow-test', 
   '{"industry": "technology", "timezone": "America/New_York", "currency": "USD"}'::jsonb, 
   true, NOW(), NOW()),
  
  -- Account 2: Marketing Agency
  ('22222222-2222-2222-2222-222222222222', 'Creative Minds Agency', 'creative-test', 
   '{"industry": "marketing", "timezone": "Europe/London", "currency": "GBP"}'::jsonb, 
   true, NOW(), NOW()),
  
  -- Account 3: Construction Company
  ('33333333-3333-3333-3333-333333333333', 'BuildRight Construction', 'buildright-test', 
   '{"industry": "construction", "timezone": "America/Los_Angeles", "currency": "USD"}'::jsonb, 
   true, NOW(), NOW()),
  
  -- Account 4: Healthcare Provider
  ('44444444-4444-4444-4444-444444444444', 'HealthCare Plus', 'healthcare-test', 
   '{"industry": "healthcare", "timezone": "America/Chicago", "currency": "USD"}'::jsonb, 
   true, NOW(), NOW()),
  
  -- Account 5: Manufacturing
  ('55555555-5555-5555-5555-555555555555', 'Industrial Solutions Corp', 'industrial-test', 
   '{"industry": "manufacturing", "timezone": "Europe/Berlin", "currency": "EUR"}'::jsonb, 
   true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST USERS (19 users across all accounts)
-- ============================================================================
-- Password hash for 'test123': $2b$10$YourHashHere (bcrypt)

INSERT INTO users (id, account_id, email, username, password_hash, first_name, last_name, active, email_verified, created_at, updated_at)
VALUES
  -- Account 1 Users (TechFlow)
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'admin@techflow.test', 'admin_techflow', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Alex', 'Anderson', true, true, NOW(), NOW()),
  
  ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'manager@techflow.test', 'manager_techflow', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Maria', 'Garcia', true, true, NOW(), NOW()),
  
  ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'employee@techflow.test', 'emp_techflow', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'John', 'Smith', true, true, NOW(), NOW()),
  
  ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 
   'viewer@techflow.test', 'viewer_techflow', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Sarah', 'Johnson', true, true, NOW(), NOW()),
  
  ('a1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 
   'robert@techflow.test', 'robert_techflow', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Robert', 'Davis', true, true, NOW(), NOW()),

  -- Account 2 Users (Creative Minds)
  ('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'admin@creative.test', 'admin_creative', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Emma', 'Wilson', true, true, NOW(), NOW()),
  
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'designer@creative.test', 'designer_creative', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Oliver', 'Brown', true, true, NOW(), NOW()),
  
  ('a2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'copywriter@creative.test', 'copy_creative', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Sophia', 'Martinez', true, true, NOW(), NOW()),
  
  ('a2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 
   'account@creative.test', 'account_creative', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'James', 'Taylor', true, true, NOW(), NOW()),

  -- Account 3 Users (BuildRight)
  ('a3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'admin@buildright.test', 'admin_buildright', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Michael', 'Lee', true, true, NOW(), NOW()),
  
  ('a3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'engineer@buildright.test', 'eng_buildright', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Ava', 'Rodriguez', true, true, NOW(), NOW()),
  
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'foreman@buildright.test', 'foreman_buildright', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'William', 'Harris', true, true, NOW(), NOW()),
  
  ('a3333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 
   'surveyor@buildright.test', 'survey_buildright', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Isabella', 'Clark', true, true, NOW(), NOW()),

  -- Account 4 Users (HealthCare)
  ('a4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 
   'admin@healthcare.test', 'admin_healthcare', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Benjamin', 'White', true, true, NOW(), NOW()),
  
  ('a4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 
   'nurse@healthcare.test', 'nurse_healthcare', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Mia', 'Thompson', true, true, NOW(), NOW()),
  
  ('a4444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 
   'receptionist@healthcare.test', 'reception_healthcare', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Charlotte', 'Moore', true, true, NOW(), NOW()),

  -- Account 5 Users (Industrial)
  ('a5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'admin@industrial.test', 'admin_industrial', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Henry', 'Walker', true, true, NOW(), NOW()),
  
  ('a5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 
   'operator@industrial.test', 'operator_industrial', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Amelia', 'Lopez', true, true, NOW(), NOW()),
  
  ('a5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 
   'quality@industrial.test', 'quality_industrial', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Evelyn', 'Hill', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- ROLES & PERMISSIONS (RBAC System)
-- ============================================================================
-- Note: Default roles (Admin, Manager, Employee, Client) are created automatically
-- by migration triggers, so we just ensure they exist

-- Additional custom roles can be added here if needed
-- The migration already creates 4 roles per account with proper permissions

-- ============================================================================
-- USER ROLE ASSIGNMENTS
-- ============================================================================
-- Assign users to roles (Admin roles already assigned by migration)

DO $$
DECLARE
  admin_role_id UUID;
  manager_role_id UUID;
  employee_role_id UUID;
  client_role_id UUID;
BEGIN
  -- Account 1 role assignments
  SELECT id INTO admin_role_id FROM roles WHERE account_id = '11111111-1111-1111-1111-111111111111' AND name = 'Admin';
  SELECT id INTO manager_role_id FROM roles WHERE account_id = '11111111-1111-1111-1111-111111111111' AND name = 'Manager';
  SELECT id INTO employee_role_id FROM roles WHERE account_id = '11111111-1111-1111-1111-111111111111' AND name = 'Employee';
  SELECT id INTO client_role_id FROM roles WHERE account_id = '11111111-1111-1111-1111-111111111111' AND name = 'Client';
  
  INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
    ('a1111111-1111-1111-1111-111111111111', admin_role_id, NOW()),
    ('a1111111-1111-1111-1111-111111111112', manager_role_id, NOW()),
    ('a1111111-1111-1111-1111-111111111113', employee_role_id, NOW()),
    ('a1111111-1111-1111-1111-111111111114', client_role_id, NOW()),
    ('a1111111-1111-1111-1111-111111111115', employee_role_id, NOW())
  ON CONFLICT DO NOTHING;

  -- Account 2 role assignments
  SELECT id INTO admin_role_id FROM roles WHERE account_id = '22222222-2222-2222-2222-222222222222' AND name = 'Admin';
  SELECT id INTO manager_role_id FROM roles WHERE account_id = '22222222-2222-2222-2222-222222222222' AND name = 'Manager';
  SELECT id INTO employee_role_id FROM roles WHERE account_id = '22222222-2222-2222-2222-222222222222' AND name = 'Employee';
  
  INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
    ('a2222222-2222-2222-2222-222222222221', admin_role_id, NOW()),
    ('a2222222-2222-2222-2222-222222222222', manager_role_id, NOW()),
    ('a2222222-2222-2222-2222-222222222223', employee_role_id, NOW()),
    ('a2222222-2222-2222-2222-222222222224', employee_role_id, NOW())
  ON CONFLICT DO NOTHING;

  -- Account 3 role assignments
  SELECT id INTO admin_role_id FROM roles WHERE account_id = '33333333-3333-3333-3333-333333333333' AND name = 'Admin';
  SELECT id INTO manager_role_id FROM roles WHERE account_id = '33333333-3333-3333-3333-333333333333' AND name = 'Manager';
  SELECT id INTO employee_role_id FROM roles WHERE account_id = '33333333-3333-3333-3333-333333333333' AND name = 'Employee';
  
  INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
    ('a3333333-3333-3333-3333-333333333331', admin_role_id, NOW()),
    ('a3333333-3333-3333-3333-333333333332', manager_role_id, NOW()),
    ('a3333333-3333-3333-3333-333333333333', employee_role_id, NOW()),
    ('a3333333-3333-3333-3333-333333333334', employee_role_id, NOW())
  ON CONFLICT DO NOTHING;

  -- Account 4 role assignments
  SELECT id INTO admin_role_id FROM roles WHERE account_id = '44444444-4444-4444-4444-444444444444' AND name = 'Admin';
  SELECT id INTO employee_role_id FROM roles WHERE account_id = '44444444-4444-4444-4444-444444444444' AND name = 'Employee';
  
  INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
    ('a4444444-4444-4444-4444-444444444441', admin_role_id, NOW()),
    ('a4444444-4444-4444-4444-444444444442', employee_role_id, NOW()),
    ('a4444444-4444-4444-4444-444444444443', employee_role_id, NOW())
  ON CONFLICT DO NOTHING;

  -- Account 5 role assignments
  SELECT id INTO admin_role_id FROM roles WHERE account_id = '55555555-5555-5555-5555-555555555555' AND name = 'Admin';
  SELECT id INTO employee_role_id FROM roles WHERE account_id = '55555555-5555-5555-5555-555555555555' AND name = 'Employee';
  
  INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
    ('a5555555-5555-5555-5555-555555555551', admin_role_id, NOW()),
    ('a5555555-5555-5555-5555-555555555552', employee_role_id, NOW()),
    ('a5555555-5555-5555-5555-555555555553', employee_role_id, NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================================
-- CLIENTS (16 clients across all accounts)
-- ============================================================================

INSERT INTO clients (id, account_id, name, email, phone, company, address, status, created_by, created_at, updated_at)
VALUES
  -- Account 1 Clients
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'John Doe', 'john.doe@acmecorp.com', '+1-555-0101', 'Acme Corporation', 
   '123 Business St, New York, NY 10001', 'active', 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'Jane Smith', 'jane@globaltech.com', '+1-555-0102', 'Global Tech Industries', 
   '456 Tech Ave, San Francisco, CA 94102', 'active', 'a1111111-1111-1111-1111-111111111112', NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'Mike Johnson', 'mike@startupxyz.io', '+1-555-0103', 'StartupXYZ', 
   '789 Innovation Dr, Austin, TX 78701', 'active', 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 
   'Emily Davis', 'emily@dataservices.com', '+1-555-0104', 'Data Services Inc', 
   '321 Cloud Blvd, Seattle, WA 98101', 'prospect', 'a1111111-1111-1111-1111-111111111112', NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 
   'David Wilson', 'david@retailpro.com', '+1-555-0105', 'Retail Pro Solutions', 
   '654 Commerce Way, Chicago, IL 60601', 'active', 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),

  -- Account 2 Clients
  ('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'Sophie Martin', 'sophie@fashioneu.com', '+44-20-7946-0958', 'Fashion Brand EU', 
   '10 Oxford Street, London W1D 1AN, UK', 'active', 'a2222222-2222-2222-2222-222222222221', NOW(), NOW()),
  
  ('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'Lucas Bernard', 'lucas@restaurantchain.fr', '+33-1-42-96-89-89', 'Restaurant Chain Ltd', 
   '25 Rue de la Paix, 75002 Paris, France', 'active', 'a2222222-2222-2222-2222-222222222221', NOW(), NOW()),
  
  ('c2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'Isabella Costa', 'isabella@ecommerce.pt', '+351-21-123-4567', 'E-Commerce Solutions', 
   'Av. da Liberdade 123, 1250-096 Lisbon, Portugal', 'prospect', 'a2222222-2222-2222-2222-222222222222', NOW(), NOW()),

  -- Account 3 Clients
  ('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'Robert Brown', 'robert@propertydevelopers.com', '+1-310-555-0201', 'Property Developers Inc', 
   '1000 Wilshire Blvd, Los Angeles, CA 90017', 'active', 'a3333333-3333-3333-3333-333333333331', NOW(), NOW()),
  
  ('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'Amanda Green', 'amanda@citycouncil.gov', '+1-310-555-0202', 'City Council Projects', 
   '200 N Spring St, Los Angeles, CA 90012', 'active', 'a3333333-3333-3333-3333-333333333331', NOW(), NOW()),
  
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'Daniel Martinez', 'daniel@realestate.com', '+1-858-555-0301', 'Real Estate Partners', 
   '1234 Harbor Dr, San Diego, CA 92101', 'prospect', 'a3333333-3333-3333-3333-333333333332', NOW(), NOW()),

  -- Account 4 Clients
  ('c4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 
   'Patricia Adams', 'patricia@insurance.com', '+1-312-555-0401', 'Insurance Provider Co', 
   '800 Michigan Ave, Chicago, IL 60611', 'active', 'a4444444-4444-4444-4444-444444444441', NOW(), NOW()),
  
  ('c4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 
   'Christopher Lee', 'chris@medicalequip.com', '+1-312-555-0402', 'Medical Equipment Supplies', 
   '1500 S Michigan Ave, Chicago, IL 60605', 'active', 'a4444444-4444-4444-4444-444444444441', NOW(), NOW()),

  -- Account 5 Clients
  ('c5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'Klaus Schmidt', 'klaus@automotive.de', '+49-30-12345678', 'Automotive GmbH', 
   'Hauptstraße 100, 10827 Berlin, Germany', 'active', 'a5555555-5555-5555-5555-555555555551', NOW(), NOW()),
  
  ('c5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 
   'Anna Müller', 'anna@electronics.de', '+49-30-98765432', 'Electronics Manufacturing', 
   'Industrieweg 50, 10115 Berlin, Germany', 'active', 'a5555555-5555-5555-5555-555555555551', NOW(), NOW()),
  
  ('c5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 
   'Hans Weber', 'hans@machinery.de', '+49-89-11223344', 'Machinery Parts Ltd', 
   'Leopoldstraße 25, 80802 Munich, Germany', 'prospect', 'a5555555-5555-5555-5555-555555555552', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Continue in next part due to length...

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
  account_count INT;
  user_count INT;
  client_count INT;
BEGIN
  SELECT COUNT(*) INTO account_count FROM accounts WHERE id::text LIKE '11111111%' OR id::text LIKE '22222222%' OR id::text LIKE '33333333%' OR id::text LIKE '44444444%' OR id::text LIKE '55555555%';
  SELECT COUNT(*) INTO user_count FROM users WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '44444444%' OR account_id::text LIKE '55555555%';
  SELECT COUNT(*) INTO client_count FROM clients WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '44444444%' OR account_id::text LIKE '55555555%';
  
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════╗';
  RAISE NOTICE '║   Test Data Seeded Successfully (Part 1)         ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Accounts: %', account_count;
  RAISE NOTICE 'Test Users: %', user_count;
  RAISE NOTICE 'Test Clients: %', client_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Run seed-test-data-v2-part2.sql for remaining entities...';
  RAISE NOTICE '';
END $$;
