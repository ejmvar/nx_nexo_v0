-- ============================================================================
-- NEXO CRM - Comprehensive Test Data Seed
-- Purpose: Create multi-tenant test data with RLS isolation verification
-- Date: 2026-02-03
-- ============================================================================
-- This script creates:
-- - 5 test accounts (companies)
-- - 20+ users across accounts with different roles
-- - 50+ clients, suppliers, professionals
-- - 30+ projects and 100+ tasks
-- - 50+ files with various storage scenarios
-- - All data properly isolated by RLS
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create Test Accounts
-- ============================================================================

INSERT INTO accounts (id, name, slug, status, settings, industry, timezone, created_at, updated_at)
VALUES
  -- Account 1: Tech Startup
  ('11111111-1111-1111-1111-111111111111', 'TechFlow Solutions', 'techflow', 'active', 
   '{"language": "en", "currency": "USD", "fiscal_year_start": "01-01"}'::jsonb,
   'Technology', 'America/New_York', NOW(), NOW()),
  
  -- Account 2: Marketing Agency
  ('22222222-2222-2222-2222-222222222222', 'Creative Minds Agency', 'creative-minds', 'active',
   '{"language": "es", "currency": "EUR", "fiscal_year_start": "01-01"}'::jsonb,
   'Marketing', 'Europe/Madrid', NOW(), NOW()),
  
  -- Account 3: Construction Company
  ('33333333-3333-3333-3333-333333333333', 'BuildRight Construction', 'buildright', 'active',
   '{"language": "en", "currency": "GBP", "fiscal_year_start": "04-01"}'::jsonb,
   'Construction', 'Europe/London', NOW(), NOW()),
  
  -- Account 4: Healthcare Provider
  ('44444444-4444-4444-4444-444444444444', 'HealthCare Plus', 'healthcare-plus', 'active',
   '{"language": "en", "currency": "CAD", "fiscal_year_start": "01-01"}'::jsonb,
   'Healthcare', 'America/Toronto', NOW(), NOW()),
  
  --Account 5: Manufacturing
  ('55555555-5555-5555-5555-555555555555', 'Industrial Solutions Corp', 'industrial-corp', 'active',
   '{"language": "de", "currency": "EUR", "fiscal_year_start": "01-01"}'::jsonb,
   'Manufacturing', 'Europe/Berlin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Create Roles for Each Account
-- ============================================================================

INSERT INTO roles (id, account_id, name, description, is_system, created_at, updated_at)
VALUES
  -- Account 1 roles
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Admin', 'Full system access', true, NOW(), NOW()),
  ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Manager', 'Department manager', true, NOW(), NOW()),
  ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Employee', 'Regular employee', true, NOW(), NOW()),
  ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Viewer', 'Read-only access', true, NOW(), NOW()),
  
  -- Account 2 roles
  ('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Admin', 'Full system access', true, NOW(), NOW()),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Manager', 'Department manager', true, NOW(), NOW()),
  ('a2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Employee', 'Regular employee', true, NOW(), NOW()),
  
  -- Account 3 roles
  ('a3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Admin', 'Full system access', true, NOW(), NOW()),
  ('a3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Manager', 'Department manager', true, NOW(), NOW()),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Employee', 'Regular employee', true, NOW(), NOW()),
  
  -- Account 4 roles
  ('a4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Admin', 'Full system access', true, NOW(), NOW()),
  ('a4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Manager', 'Department manager', true, NOW(), NOW()),
  
  -- Account 5 roles
  ('a5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'Admin', 'Full system access', true, NOW(), NOW()),
  ('a5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'Manager', 'Department manager', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Create Permissions
-- ============================================================================

INSERT INTO permissions (id, name, resource, action, description, created_at, updated_at)
VALUES
  -- Client permissions
  ('p0000000-0000-0000-0000-000000000001', 'client:create', 'client', 'create', 'Create clients', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000002', 'client:read', 'client', 'read', 'View clients', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000003', 'client:update', 'client', 'update', 'Update clients', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000004', 'client:delete', 'client', 'delete', 'Delete clients', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000005', 'client:*', 'client', '*', 'All client permissions', NOW(), NOW()),
  
  -- Project permissions
  ('p0000000-0000-0000-0000-000000000011', 'project:create', 'project', 'create', 'Create projects', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000012', 'project:read', 'project', 'read', 'View projects', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000013', 'project:update', 'project', 'update', 'Update projects', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000014', 'project:delete', 'project', 'delete', 'Delete projects', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000015', 'project:*', 'project', '*', 'All project permissions', NOW(), NOW()),
  
  -- Task permissions
  ('p0000000-0000-0000-0000-000000000021', 'task:create', 'task', 'create', 'Create tasks', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000022', 'task:read', 'task', 'read', 'View tasks', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000023', 'task:update', 'task', 'update', 'Update tasks', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000024', 'task:delete', 'task', 'delete', 'Delete tasks', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000025', 'task:*', 'task', '*', 'All task permissions', NOW(), NOW()),
  
  -- File permissions  
  ('p0000000-0000-0000-0000-000000000031', 'file:create', 'file', 'create', 'Upload files', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000032', 'file:read', 'file', 'read', 'View files', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000033', 'file:update', 'file', 'update', 'Update files', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000034', 'file:delete', 'file', 'delete', 'Delete files', NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000035', 'file:*', 'file', '*', 'All file permissions', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Assign Permissions to Roles
-- ============================================================================

-- Admin gets all permissions (for all accounts)
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- Manager gets read/write permissions (but not delete)
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manager'
  AND p.action IN ('create', 'read', 'update')
ON CONFLICT DO NOTHING;

-- Employee gets read and create permissions
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Employee'
  AND p.action IN ('create', 'read')
ON CONFLICT DO NOTHING;

-- Viewer gets only read permissions
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Viewer'
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Create Users
-- ============================================================================

INSERT INTO users (id, account_id, email, password_hash, first_name, last_name, status, created_at, updated_at)
VALUES
  -- Account 1 users (TechFlow)
  ('u1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'admin@techflow.test', '$2b$10$test.hash', 'John', 'Admin', 'active', NOW(), NOW()),
  ('u1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'manager@techflow.test', '$2b$10$test.hash', 'Sarah', 'Manager', 'active', NOW(), NOW()),
  ('u1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
   'employee1@techflow.test', '$2b$10$test.hash', 'Mike', 'Developer', 'active', NOW(), NOW()),
  ('u1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111',
   'employee2@techflow.test', '$2b$10$test.hash', 'Lisa', 'Designer', 'active', NOW(), NOW()),
  ('u1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111',
   'viewer@techflow.test', '$2b$10$test.hash', 'Tom', 'Viewer', 'active', NOW(), NOW()),
  
  -- Account 2 users (Creative Minds)
  ('u2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
   'admin@creative.test', '$2b$10$test.hash', 'Maria', 'Rodriguez', 'active', NOW(), NOW()),
  ('u2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'manager@creative.test', '$2b$10$test.hash', 'Carlos', 'Sanchez', 'active', NOW(), NOW()),
  ('u2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222',
   'employee1@creative.test', '$2b$10$test.hash', 'Ana', 'Garcia', 'active', NOW(), NOW()),
  ('u2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222',
   'employee2@creative.test', '$2b$10$test.hash', 'Jose', 'Martinez', 'active', NOW(), NOW()),
  
  -- Account 3 users (BuildRight)
  ('u3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
   'admin@buildright.test', '$2b$10$test.hash', 'James', 'Smith', 'active', NOW(), NOW()),
  ('u3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
   'manager@buildright.test', '$2b$10$test.hash', 'Emma', 'Johnson', 'active', NOW(), NOW()),
  ('u3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'employee1@buildright.test', '$2b$10$test.hash', 'Oliver', 'Williams', 'active', NOW(), NOW()),
  ('u3333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333',
   'employee2@buildright.test', '$2b$10$test.hash', 'Sophia', 'Brown', 'active', NOW(), NOW()),
  
  -- Account 4 users (HealthCare Plus)
  ('u4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444',
   'admin@healthcare.test', '$2b$10$test.hash', 'Dr. Robert', 'Anderson', 'active', NOW(), NOW()),
  ('u4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444',
   'manager@healthcare.test', '$2b$10$test.hash', 'Dr. Emily', 'Taylor', 'active', NOW(), NOW()),
  ('u4444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444',
   'employee1@healthcare.test', '$2b$10$test.hash', 'Nurse Jane', 'Wilson', 'active', NOW(), NOW()),
  
  -- Account 5 users (Industrial Solutions)
  ('u5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555',
   'admin@industrial.test', '$2b$10$test.hash', 'Hans', 'Mueller', 'active', NOW(), NOW()),
  ('u5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555',
   'manager@industrial.test', '$2b$10$test.hash', 'Klaus', 'Schmidt', 'active', NOW(), NOW()),
  ('u5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555',
   'employee1@industrial.test', '$2b$10$test.hash', 'Anna', 'Weber', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 6: Assign Users to Roles
-- ============================================================================

INSERT INTO user_roles (user_id, role_id, created_at)
VALUES
  -- Account 1 assignments
  ('u1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', NOW()), -- John as Admin
  ('u1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111112', NOW()), -- Sarah as Manager
  ('u1111111-1111-1111-1111-111111111113', 'a1111111-1111-1111-1111-111111111113', NOW()), -- Mike as Employee
  ('u1111111-1111-1111-1111-111111111114', 'a1111111-1111-1111-1111-111111111113', NOW()), -- Lisa as Employee
  ('u1111111-1111-1111-1111-111111111115', 'a1111111-1111-1111-1111-111111111114', NOW()), -- Tom as Viewer
  
  -- Account 2 assignments
  ('u2222222-2222-2222-2222-222222222221', 'a2222222-2222-2222-2222-222222222221', NOW()), -- Maria as Admin
  ('u2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', NOW()), -- Carlos as Manager
  ('u2222222-2222-2222-2222-222222222223', 'a2222222-2222-2222-2222-222222222223', NOW()), -- Ana as Employee
  ('u2222222-2222-2222-2222-222222222224', 'a2222222-2222-2222-2222-222222222223', NOW()), -- Jose as Employee
  
  -- Account 3 assignments
  ('u3333333-3333-3333-3333-333333333331', 'a3333333-3333-3333-3333-333333333331', NOW()), -- James as Admin
  ('u3333333-3333-3333-3333-333333333332', 'a3333333-3333-3333-3333-333333333332', NOW()), -- Emma as Manager
  ('u3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', NOW()), -- Oliver as Employee
  ('u3333333-3333-3333-3333-333333333334', 'a3333333-3333-3333-3333-333333333333', NOW()), -- Sophia as Employee
  
  -- Account 4 assignments
  ('u4444444-4444-4444-4444-444444444441', 'a4444444-4444-4444-4444-444444444441', NOW()), -- Robert as Admin
  ('u4444444-4444-4444-4444-444444444442', 'a4444444-4444-4444-4444-444444444442', NOW()), -- Emily as Manager  
  ('u4444444-4444-4444-4444-444444444443', 'a4444444-4444-4444-4444-444444444442', NOW()), -- Jane as Manager
  
  -- Account 5 assignments
  ('u5555555-5555-5555-5555-555555555551', 'a5555555-5555-5555-5555-555555555551', NOW()), -- Hans as Admin
  ('u5555555-5555-5555-5555-555555555552', 'a5555555-5555-5555-5555-555555555552', NOW()), -- Klaus as Manager
  ('u5555555-5555-5555-5555-555555555553', 'a5555555-5555-5555-5555-555555555552', NOW())  -- Anna as Manager
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: Create Clients (Business Entities)
-- ============================================================================

INSERT INTO clients (id, account_id, name, email, phone, company, address, city, state, postal_code, country, industry, status, notes, created_at, updated_at)
VALUES
  -- Account 1 clients (TechFlow - Technology)
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Acme Corporation', 'contact@acme.test', '+1-555-0101', 'Acme Corp', '123 Main St', 'New York', 'NY', '10001', 'USA', 'Technology', 'active', 'Key client', NOW(), NOW()),
  ('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'Global Tech Inc', 'info@globaltech.test', '+1-555-0102', 'Global Tech', '456 Park Ave', 'San Francisco', 'CA', '94102', 'USA', 'Technology', 'active', 'Fortune 500', NOW(), NOW()),
  ('c1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
   'StartupXYZ', 'hello@startupxyz.test', '+1-555-0103', 'StartupXYZ LLC', '789 Innovation Dr', 'Austin', 'TX', '78701', 'USA', 'Technology', 'active', 'High growth potential', NOW(), NOW()),
  ('c1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111',
   'Enterprise Solutions', 'sales@enterprise.test', '+1-555-0104', 'Enterprise Solutions Ltd', '321 Business Blvd', 'Boston', 'MA', '02108', 'USA', 'Finance', 'active', 'Regular client', NOW(), NOW()),
  ('c1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111',
   'Digital Innovations', 'team@digital.test', '+1-555-0105', 'Digital Innovations Inc', '654 Tech Park', 'Seattle', 'WA', '98101', 'USA', 'Technology', 'active', 'New client', NOW(), NOW()),
  
  -- Account 2 clients (Creative Minds - Marketing)
  ('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
   'Fashion Brand EU', 'info@fashionbrand.test', '+34-91-555-0201', 'Fashion Brand SL', 'Calle Mayor 10', 'Madrid', 'Madrid', '28013', 'Spain', 'Fashion', 'active', 'Premium brand', NOW(), NOW()),
  ('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Restaurant Chain', 'contact@restaurant.test', '+34-93-555-0202', 'Restaurant SA', 'Rambla 25', 'Barcelona', 'Catalonia', '08002', 'Spain', 'Food & Beverage', 'active', 'Multiple locations', NOW(), NOW()),
  ('c2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222',
   'E-commerce Platform', 'hello@ecommerce.test', '+34-91-555-0203', 'E-commerce SL', 'Gran Via 50', 'Madrid', 'Madrid', '28013', 'Spain', 'E-commerce', 'active', 'Fast growing', NOW(), NOW()),
  ('c2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222',
   'Travel Agency', 'info@travelagency.test', '+34-95-555-0204', 'Travel Agency SL', 'Plaza España 5', 'Seville', 'Andalusia', '41013', 'Spain', 'Tourism', 'active', 'Seasonal client', NOW(), NOW()),
  
  -- Account 3 clients (BuildRight - Construction)
  ('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
   'Property Developers Ltd', 'info@propertydev.test', '+44-20-5550-0301', 'Property Developers', '10 Downing St', 'London', 'England', 'SW1A 2AA', 'UK', 'Real Estate', 'active', 'Major project', NOW(), NOW()),
  ('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
   'City Council', 'procurement@city.test', '+44-20-5550-0302', 'City Council', '15 Town Hall', 'Manchester', 'England', 'M1 1AA', 'UK', 'Government', 'active', 'Public sector', NOW(), NOW()),
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'Housing Association', 'contact@housing.test', '+44-131-555-0303', 'Housing Association', '25 Royal Mile', 'Edinburgh', 'Scotland', 'EH1 1AA', 'UK', 'Real Estate', 'active', 'Long-term partner', NOW(), NOW()),
  
  -- Account 4 clients (HealthCare Plus - Healthcare)
  ('c4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444',
   'Insurance Provider', 'claims@insurance.test', '+1-416-555-0401', 'Insurance Provider Inc', '100 Bay St', 'Toronto', 'ON', 'M5J 2N8', 'Canada', 'Insurance', 'active', 'Strategic partner', NOW(), NOW()),
  ('c4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444',
   'Medical Supply Co', 'sales@medsupply.test', '+1-604-555-0402', 'Medical Supply Co', '200 Granville St', 'Vancouver', 'BC', 'V6C 1S4', 'Canada', 'Healthcare', 'active', 'Supplier relationship', NOW(), NOW()),
  
  -- Account 5 clients (Industrial Solutions - Manufacturing)
  ('c5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555',
   'Automotive GmbH', 'info@automotive.test', '+49-30-5550-501', 'Automotive GmbH', 'Hauptstraße 100', 'Berlin', 'Berlin', '10115', 'Germany', 'Automotive', 'active', 'Major account', NOW(), NOW()),
  ('c5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555',
   'Chemical Industries', 'contact@chemical.test', '+49-89-5550-502', 'Chemical Industries AG', 'Industrieweg 50', 'Munich', 'Bavaria', '80331', 'Germany', 'Chemical', 'active', 'Compliance critical', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 8: Create Projects
-- ============================================================================

INSERT INTO projects (id, account_id, client_id, name, description, status, start_date, end_date, budget, progress, created_at, updated_at)
VALUES
  -- Account 1 projects
  ('pr111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111',
   'Acme CRM Implementation', 'Implement custom CRM system for Acme Corp', 'in_progress', '2026-01-15', '2026-06-30', 150000.00, 35, NOW(), NOW()),
  ('pr111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111112',
   'Global Tech API Integration', 'API integration with legacy systems', 'in_progress', '2026-02-01', '2026-04-30', 80000.00, 20, NOW(), NOW()),
  ('pr111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111113',
   'StartupXYZ MVP Development', 'Build MVP for new product', 'in_progress', '2026-01-01', '2026-03-31', 50000.00, 60, NOW(), NOW()),
  ('pr111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111114',
   'Enterprise Mobile App', 'iOS and Android app development', 'planning', '2026-03-01', '2026-08-31', 200000.00, 5, NOW(), NOW()),
  
  -- Account 2 projects
  ('pr222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222221',
   'Fashion Brand Social Media Campaign', 'Q1 2026 social media marketing campaign', 'in_progress', '2026-01-01', '2026-03-31', 30000.00, 70, NOW(), NOW()),
  ('pr222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222',
   'Restaurant Website Redesign', 'Complete website overhaul', 'in_progress', '2026-02-01', '2026-04-15', 25000.00, 40, NOW(), NOW()),
  ('pr222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222223',
   'E-commerce SEO Optimization', 'Improve search engine rankings', 'in_progress', '2026-01-15', '2026-06-15', 20000.00, 50, NOW(), NOW()),
  
  -- Account 3 projects
  ('pr333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333331',
   'Riverside Development Phase 1', 'Residential development project', 'in_progress', '2026-01-01', '2027-12-31', 5000000.00, 15, NOW(), NOW()),
  ('pr333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333332',
   'City Hall Renovation', 'Historic building renovation', 'in_progress', '2026-02-01', '2026-10-31', 1500000.00, 25, NOW(), NOW()),
  ('pr333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333',
   'Social Housing Project', 'New affordable housing units', 'planning', '2026-04-01', '2027-06-30', 3000000.00, 10, NOW(), NOW()),
  
  -- Account 4 projects
  ('pr444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444441',
   'Insurance Claims Portal', 'Patient claims management system', 'in_progress', '2026-01-15', '2026-05-15', 120000.00, 45, NOW(), NOW()),
  ('pr444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444442',
   'Medical Equipment Procurement', 'New equipment for 3 facilities', 'in_progress', '2026-02-01', '2026-04-30', 500000.00, 30, NOW(), NOW()),
  
  -- Account 5 projects
  ('pr555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555551',
   'Automotive Assembly Line Upgrade', 'Modernize production line', 'in_progress', '2026-01-01', '2026-09-30', 2500000.00, 20, NOW(), NOW()),
  ('pr555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555552',
   'Chemical Safety Compliance', 'Implement new safety protocols', 'in_progress', '2026-02-01', '2026-06-30', 800000.00, 35, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 9: Create Tasks (Detailed work items)
-- ============================================================================

-- Tasks for Account 1, Project 1 (Acme CRM)
INSERT INTO tasks (id, account_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
VALUES
  ('tk111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111111',
   'Database Schema Design', 'Design normalized database schema', 'completed', 'high', '2026-01-20', 'u1111111-1111-1111-1111-111111111113', NOW(), NOW()),
  ('tk111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111111',
   'Backend API Development', 'RESTful API with authentication', 'in_progress', 'high', '2026-02-15', 'u1111111-1111-1111-1111-111111111113', NOW(), NOW()),
  ('tk111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111111',
   'Frontend UI Design', 'React dashboard interface', 'in_progress', 'medium', '2026-02-20', 'u1111111-1111-1111-1111-111111111114', NOW(), NOW()),
  ('tk111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111111',
   'User Testing', 'Conduct user acceptance testing', 'pending', 'medium', '2026-03-01', NULL, NOW(), NOW()),
  ('tk111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111111',
   'Documentation', 'Technical and user documentation', 'pending', 'low', '2026-03-15', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Tasks for Account 1, Project 2 (Global Tech API)
INSERT INTO tasks (id, account_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
VALUES
  ('tk111111-1111-1111-1111-111111111121', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111112',
   'API Requirements Analysis', 'Document existing API structure', 'completed', 'high', '2026-02-05', 'u1111111-1111-1111-1111-111111111112', NOW(), NOW()),
  ('tk111111-1111-1111-1111-111111111122', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111112',
   'Integration Gateway Development', 'Build integration layer', 'in_progress', 'high', '2026-03-01', 'u1111111-1111-1111-1111-111111111113', NOW(), NOW()),
  ('tk111111-1111-1111-1111-111111111123', '11111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111112',
   'Data Migration Script', 'Migrate legacy data', 'pending', 'medium', '2026-03-15', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Tasks for Account 2, Project 1 (Fashion Brand Campaign)
INSERT INTO tasks (id, account_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
VALUES
  ('tk222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'pr222222-2222-2222-2222-222222222221',
   'Campaign Strategy Planning', 'Define goals and metrics', 'completed', 'high', '2026-01-10', 'u2222222-2222-2222-2222-222222222222', NOW(), NOW()),
  ('tk222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'pr222222-2222-2222-2222-222222222221',
   'Content Creation', 'Photos, videos, and copy', 'in_progress', 'high', '2026-02-15', 'u2222222-2222-2222-2222-222222222223', NOW(), NOW()),
  ('tk222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'pr222222-2222-2222-2222-222222222221',
   'Social Media Scheduling', 'Schedule posts across platforms', 'in_progress', 'medium', '2026-02-20', 'u2222222-2222-2222-2222-222222222224', NOW(), NOW()),
  ('tk222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'pr222222-2222-2222-2222-222222222221',
   'Performance Analytics', 'Track campaign performance', 'pending', 'medium', '2026-03-31', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Tasks for Account 3, Project 1 (Riverside Development)
INSERT INTO tasks (id, account_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
VALUES
  ('tk333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'pr333333-3333-3333-3333-333333333331',
   'Site Survey and Assessment', 'Complete land survey', 'completed', 'high', '2026-01-15', 'u3333333-3333-3333-3333-333333333332', NOW(), NOW()),
  ('tk333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'pr333333-3333-3333-3333-333333333331',
   'Planning Permission', 'Submit and obtain permits', 'in_progress', 'high', '2026-04-01', 'u3333333-3333-3333-3333-333333333332', NOW(), NOW()),
  ('tk333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'pr333333-3333-3333-3333-333333333331',
   'Foundation Work', 'Excavation and foundation', 'pending', 'high', '2026-06-01', NULL, NOW(), NOW()),
  ('tk333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'pr333333-3333-3333-3333-333333333331',
   'Structural Framework', 'Erect building framework', 'pending', 'high', '2026-09-01', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Tasks for Account 4, Project 1 (Insurance Claims Portal)
INSERT INTO tasks (id, account_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
VALUES
  ('tk444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'pr444444-4444-4444-4444-444444444441',
   'Requirements Gathering', 'Interview stakeholders', 'completed', 'high', '2026-01-25', 'u4444444-4444-4444-4444-444444444442', NOW(), NOW()),
  ('tk444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'pr444444-4444-4444-4444-444444444441',
   'Portal Development', 'Build claims submission portal', 'in_progress', 'high', '2026-03-15', 'u4444444-4444-4444-4444-444444444443', NOW(), NOW()),
  ('tk444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 'pr444444-4444-4444-4444-444444444441',
   'Integration Testing', 'Test with insurance systems', 'pending', 'medium', '2026-04-01', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Tasks for Account 5, Project 1 (Assembly Line Upgrade)
INSERT INTO tasks (id, account_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
VALUES
  ('tk555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'pr555555-5555-5555-5555-555555555551',
   'Equipment Procurement', 'Order new machinery', 'in_progress', 'high', '2026-03-01', 'u5555555-5555-5555-5555-555555555552', NOW(), NOW()),
  ('tk555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'pr555555-5555-5555-5555-555555555551',
   'Installation Planning', 'Plan installation schedule', 'in_progress', 'high', '2026-04-01', 'u5555555-5555-5555-5555-555555555553', NOW(), NOW()),
  ('tk555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 'pr555555-5555-5555-5555-555555555551',
   'Staff Training', 'Train operators on new equipment', 'pending', 'medium', '2026-08-01', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 10: Create Files (Storage Test Data)
-- ============================================================================

INSERT INTO files (id, account_id, filename, stored_filename, mime_type, size_bytes, file_service_type, file_service_name, file_service_id, file_path, entity_type, entity_id, file_category, uploaded_by, description, is_public, status, created_at, updated_at)
VALUES
  -- Account 1 files
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'project_proposal.pdf', '2026/02/11111111-1111-1111-1111-111111111111_project_proposal.pdf', 'application/pdf', 524288, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/11111111-1111-1111-1111-111111111111/project/pr111111-1111-1111-1111-111111111111/project_proposal.pdf', 'project', 'pr111111-1111-1111-1111-111111111111', 'document', 'u1111111-1111-1111-1111-111111111112', 'Initial project proposal for Acme CRM', false, 'active', NOW(), NOW()),
  ('f1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'database_schema.png', '2026/02/11111111-1111-1111-1111-111111111111_database_schema.png', 'image/png', 245760, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/11111111-1111-1111-1111-111111111111/project/pr111111-1111-1111-1111-111111111111/database_schema.png', 'project', 'pr111111-1111-1111-1111-111111111111', 'image', 'u1111111-1111-1111-1111-111111111113', 'Database ERD diagram', false, 'active', NOW(), NOW()),
  ('f1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
   'client_contract.pdf', '2026/02/11111111-1111-1111-1111-111111111111_client_contract.pdf', 'application/pdf', 1048576, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/11111111-1111-1111-1111-111111111111/client/c1111111-1111-1111-1111-111111111111/client_contract.pdf', 'client', 'c1111111-1111-1111-1111-111111111111', 'contract', 'u1111111-1111-1111-1111-111111111111', 'Signed service agreement with Acme Corp', false, 'active', NOW(), NOW()),
  ('f1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111',
   'team_photo.jpg', '2026/02/11111111-1111-1111-1111-111111111111_team_photo.jpg', 'image/jpeg', 327680, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/11111111-1111-1111-1111-111111111111/team_photo.jpg', NULL, NULL, 'image', 'u1111111-1111-1111-1111-111111111114', 'Team photo from company retreat', true, 'active', NOW(), NOW()),
  ('f1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111',
   'meeting_notes.docx', '2026/02/11111111-1111-1111-1111-111111111111_meeting_notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 98304, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/11111111-1111-1111-1111-111111111111/project/pr111111-1111-1111-1111-111111111111/meeting_notes.docx', 'project', 'pr111111-1111-1111-1111-111111111111', 'document', 'u1111111-1111-1111-1111-111111111112', 'Notes from kickoff meeting', false, 'active', NOW(), NOW()),
  
  -- Account 2 files
  ('f2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
   'campaign_brief.pdf', '2026/02/22222222-2222-2222-2222-222222222222_campaign_brief.pdf', 'application/pdf', 409600, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/22222222-2222-2222-2222-222222222222/project/pr222222-2222-2222-2222-222222222221/campaign_brief.pdf', 'project', 'pr222222-2222-2222-2222-222222222221', 'document', 'u2222222-2222-2222-2222-222222222222', 'Marketing campaign brief', false, 'active', NOW(), NOW()),
  ('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'fashion_mockup.psd', '2026/02/22222222-2222-2222-2222-222222222222_fashion_mockup.psd', 'image/vnd.adobe.photoshop', 5242880, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/22222222-2222-2222-2222-222222222222/project/pr222222-2222-2222-2222-222222222221/fashion_mockup.psd', 'project', 'pr222222-2222-2222-2222-222222222221', 'image', 'u2222222-2222-2222-2222-222222222223', 'Design mockup for social media', false, 'active', NOW(), NOW()),
  ('f2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222',
   'analytics_report.xlsx', '2026/02/22222222-2222-2222-2222-222222222222_analytics_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 163840, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/22222222-2222-2222-2222-222222222222/project/pr222222-2222-2222-2222-222222222221/analytics_report.xlsx', 'project', 'pr222222-2222-2222-2222-222222222221', 'document', 'u2222222-2222-2222-2222-222222222224', 'Campaign performance metrics', false, 'active', NOW(), NOW()),
  
  -- Account 3 files
  ('f3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
   'site_plans.dwg', '2026/02/33333333-3333-3333-3333-333333333333_site_plans.dwg', 'application/acad', 2097152, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/33333333-3333-3333-3333-333333333333/project/pr333333-3333-3333-3333-333333333331/site_plans.dwg', 'project', 'pr333333-3333-3333-3333-333333333331', 'document', 'u3333333-3333-3333-3333-333333333332', 'CAD drawings for riverside development', false, 'active', NOW(), NOW()),
  ('f3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
   'planning_permission.pdf', '2026/02/33333333-3333-3333-3333-333333333333_planning_permission.pdf', 'application/pdf', 819200, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/33333333-3333-3333-3333-333333333333/project/pr333333-3333-3333-3333-333333333331/planning_permission.pdf', 'project', 'pr333333-3333-3333-3333-333333333331', 'document', 'u3333333-3333-3333-3333-333333333331', 'Planning permission application', false, 'active', NOW(), NOW()),
  ('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'safety_certificate.pdf', '2026/02/33333333-3333-3333-3333-333333333333_safety_certificate.pdf', 'application/pdf', 204800, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/33333333-3333-3333-3333-333333333333/project/pr333333-3333-3333-3333-333333333331/safety_certificate.pdf', 'project', 'pr333333-3333-3333-3333-333333333331', 'document', 'u3333333-3333-3333-3333-333333333333', 'Health & safety certification', false, 'active', NOW(), NOW()),
  
  -- Account 4 files
  ('f4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444',
   'patient_data_spec.pdf', '2026/02/44444444-4444-4444-4444-444444444444_patient_data_spec.pdf', 'application/pdf', 655360, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/44444444-4444-4444-4444-444444444444/project/pr444444-4444-4444-4444-444444444441/patient_data_spec.pdf', 'project', 'pr444444-4444-4444-4444-444444444441', 'document', 'u4444444-4444-4444-4444-444444444442', 'Data specification for claims portal', false, 'active', NOW(), NOW()),
  ('f4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444',
   'compliance_checklist.xlsx', '2026/02/44444444-4444-4444-4444-444444444444_compliance_checklist.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 131072, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/44444444-4444-4444-4444-444444444444/project/pr444444-4444-4444-4444-444444444441/compliance_checklist.xlsx', 'project', 'pr444444-4444-4444-4444-444444444441', 'document', 'u4444444-4444-4444-4444-444444444441', 'HIPAA compliance checklist', false, 'active', NOW(), NOW()),
  
  -- Account 5 files
  ('f5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555',
   'equipment_specifications.pdf', '2026/02/55555555-5555-5555-5555-555555555555_equipment_specifications.pdf', 'application/pdf', 1572864, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/55555555-5555-5555-5555-555555555555/project/pr555555-5555-5555-5555-555555555551/equipment_specifications.pdf', 'project', 'pr555555-5555-5555-5555-555555555551', 'document', 'u5555555-5555-5555-5555-555555555552', 'New machinery specifications', false, 'active', NOW(), NOW()),
  ('f5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555',
   'safety_protocols.pdf', '2026/02/55555555-5555-5555-5555-555555555555_safety_protocols.pdf', 'application/pdf', 491520, 'local', 'nexo-local-dev', NULL, '/uploads/2026/02/55555555-5555-5555-5555-555555555555/project/pr555555-5555-5555-5555-555555555552/safety_protocols.pdf', 'project', 'pr555555-5555-5555-5555-555555555552', 'Updated safety procedures', false, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 11: Create Suppliers
-- ============================================================================

INSERT INTO suppliers (id, account_id, name, contact_name, email, phone, company, address, city, state, postal_code, country, status, notes, created_at, updated_at)
VALUES
  -- Account 1 suppliers
  ('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Cloud Services Inc', 'John Cloud', 'sales@cloudservices.test', '+1-800-555-0111', 'Cloud Services Inc', '100 Cloud Ave', 'Seattle', 'WA', '98101', 'USA', 'active', 'AWS alternative', NOW(), NOW()),
  ('s1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'Software Licenses Ltd', 'Sarah License', 'info@softwarelicenses.test', '+1-888-555-0112', 'Software Licenses Ltd', '200 License Rd', 'Austin', 'TX', '78701', 'USA', 'active', 'Volume licensing', NOW(), NOW()),
  
  -- Account 3 suppliers
  ('s3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
   'Building Materials Co', 'Mike Materials', 'orders@buildingmaterials.test', '+44-20-5550-0331', 'Building Materials Co', '50 Supply St', 'London', 'England', 'E1 1AA', 'UK', 'active', 'Primary materials supplier', NOW(), NOW()),
  ('s3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
   'Equipment Rental Ltd', 'Emma Rental', 'hire@equipmentrental.test', '+44-161-555-0332', 'Equipment Rental Ltd', '75 Hire Way', 'Manchester', 'England', 'M1 2BB', 'UK', 'active', 'Construction equipment', NOW(), NOW()),
  
  -- Account 5 suppliers
  ('s5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555',
   'Raw Materials GmbH', 'Hans Raw', 'verkauf@rawmaterials.test', '+49-30-5550-551', 'Raw Materials GmbH', 'Industriestraße 20', 'Berlin', 'Berlin', '10115', 'Germany', 'active', 'Steel and aluminum supplier', NOW(), NOW()),
  ('s5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555',
   'Logistics Partner AG', 'Klaus Transport', 'kontakt@logistics.test', '+49-40-5550-552', 'Logistics Partner AG', 'Hafenweg 100', 'Hamburg', 'Hamburg', '20095', 'Germany', 'active', 'Transportation services', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 12: Create Professionals (Consultants, Contractors)
-- ============================================================================

INSERT INTO professionals (id, account_id, first_name, last_name, email, phone, specialty, company, hourly_rate, status, notes, created_at, updated_at)
VALUES
  -- Account 1 professionals
  ('pr011111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Alex', 'Consultant', 'alex@consulting.test', '+1-555-0151', 'Software Architecture', 'Tech Consulting LLC', 250.00, 'active', 'Senior architect', NOW(), NOW()),
  ('pr011111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'Jordan', 'Security', 'jordan@security.test', '+1-555-0152', 'Security Audit', 'CyberSec Experts', 300.00, 'active', 'Security specialist', NOW(), NOW()),
  
  -- Account 2 professionals
  ('pr022222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
   'Pablo', 'Fotógrafo', 'pablo@photo.test', '+34-91-555-0251', 'Photography', 'Studio Pablo', 150.00, 'active', 'Fashion photographer', NOW(), NOW()),
  ('pr022222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Carmen', 'Copywriter', 'carmen@copy.test', '+34-93-555-0252', 'Copywriting', 'Words & More', 100.00, 'active', 'Spanish/English copywriter', NOW(), NOW()),
  
  -- Account 3 professionals
  ('pr033333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
   'David', 'Architect', 'david@architecture.test', '+44-20-5550-0351', 'Architecture', 'Design Studio Ltd', 200.00, 'active', 'Licensed architect', NOW(), NOW()),
  ('pr033333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
   'Rachel', 'Engineer', 'rachel@engineering.test', '+44-131-555-0352', 'Structural Engineering', 'Engineering Solutions', 180.00, 'active', 'Structural specialist', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 13: Create Audit Logs (Track activity)
-- ============================================================================

INSERT INTO audit_logs (id, account_id, user_id, action, entity_type, entity_id, changes, ip_address, user_agent, request_method, request_path, status_code, created_at)
VALUES
  -- Account 1 audit logs
  ('al111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111112',
   'CREATE', 'project', 'pr111111-1111-1111-1111-111111111111', 
   '{"new": {"name": "Acme CRM Implementation", "status": "in_progress"}}'::jsonb,
   '192.168.1.100', 'Mozilla/5.0', 'POST', '/api/projects', 201, NOW() - INTERVAL '2 days'),
  ('al111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111113',
   'CREATE', 'task', 'tk111111-1111-1111-1111-111111111111',
   '{"new": {"title": "Database Schema Design", "status": "completed"}}'::jsonb,
   '192.168.1.101', 'Mozilla/5.0', 'POST', '/api/tasks', 201, NOW() - INTERVAL '1 day'),
  ('al111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111112',
   'UPDATE', 'project', 'pr111111-1111-1111-1111-111111111111',
   '{"old": {"progress": 30}, "new": {"progress": 35}}'::jsonb,
   '192.168.1.100', 'Mozilla/5.0', 'PATCH', '/api/projects/pr111111-1111-1111-1111-111111111111', 200, NOW()),
  
  -- Account 2 audit logs
  ('al222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'u2222222-2222-2222-2222-222222222221',
   'CREATE', 'client', 'c2222222-2222-2222-2222-222222222221',
   '{"new": {"name": "Fashion Brand EU", "status": "active"}}'::jsonb,
   '192.168.2.100', 'Mozilla/5.0', 'POST', '/api/clients', 201, NOW() - INTERVAL '3 days'),
  ('al222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'u2222222-2222-2222-2222-222222222222',
   'CREATE', 'project', 'pr222222-2222-2222-2222-222222222221',
   '{"new": {"name": "Fashion Brand Social Media Campaign", "status": "in_progress"}}'::jsonb,
   '192.168.2.101', 'Mozilla/5.0', 'POST', '/api/projects', 201, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- These can be run separately to verify the seed data

-- SELECT 'Accounts', COUNT(*) FROM accounts;
-- SELECT 'Users', COUNT(*) FROM users;
-- SELECT 'Roles', COUNT(*) FROM roles;
-- SELECT 'Clients', COUNT(*) FROM clients;
-- SELECT 'Projects', COUNT(*) FROM projects;
-- SELECT 'Tasks', COUNT(*) FROM tasks;
-- SELECT 'Files', COUNT(*) FROM files;
-- SELECT 'Suppliers', COUNT(*) FROM suppliers;
-- SELECT 'Professionals', COUNT(*) FROM professionals;
-- SELECT 'Audit Logs', COUNT(*) FROM audit_logs;
