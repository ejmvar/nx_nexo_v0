-- ============================================================================
-- NEXO CRM - Test Data Seed Script Part 2 (Schema-Aligned Version)
-- ============================================================================
-- Purpose: Projects, Tasks, Employees, Professionals, Suppliers, Files
-- Aligned with: Phase 6 schema (RBAC, File Storage, RLS)
-- Version: 2.0 (Schema-corrected)
-- Date: February 5, 2026
-- Run this AFTER seed-test-data-v2.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- EMPLOYEES (Link users to employee records)
-- ============================================================================

INSERT INTO employees (id, account_id, user_id, name, email, phone, position, department, hire_date, status, employee_code, salary_level, created_at, updated_at)
VALUES
  -- Account 1 Employees
  ('e1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'a1111111-1111-1111-1111-111111111112', 'Maria Garcia', 'manager@techflow.test', 
   '+1-555-1001', 'Product Manager', 'Product', '2024-01-15', 'active', 'EMP001', 'L3', NOW(), NOW()),
  
  ('e1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'a1111111-1111-1111-1111-111111111113', 'John Smith', 'employee@techflow.test', 
   '+1-555-1002', 'Senior Developer', 'Engineering', '2024-03-01', 'active', 'EMP002', 'L2', NOW(), NOW()),
  
  ('e1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 
   'a1111111-1111-1111-1111-111111111115', 'Robert Davis', 'robert@techflow.test', 
   '+1-555-1003', 'Junior Developer', 'Engineering', '2025-01-10', 'active', 'EMP003', 'L1', NOW(), NOW()),

  -- Account 2 Employees
  ('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'a2222222-2222-2222-2222-222222222222', 'Oliver Brown', 'designer@creative.test', 
   '+44-20-7946-1001', 'Senior Designer', 'Creative', '2023-06-01', 'active', 'DES001', 'L2', NOW(), NOW()),
  
  ('e2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'a2222222-2222-2222-2222-222222222223', 'Sophia Martinez', 'copywriter@creative.test', 
   '+44-20-7946-1002', 'Copywriter', 'Content', '2024-02-15', 'active', 'CPY001', 'L2', NOW(), NOW()),

  -- Account 3 Employees
  ('e3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'a3333333-3333-3333-3333-333333333332', 'Ava Rodriguez', 'engineer@buildright.test', 
   '+1-310-555-2001', 'Civil Engineer', 'Engineering', '2022-09-01', 'active', 'ENG001', 'L3', NOW(), NOW()),
  
  ('e3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'a3333333-3333-3333-3333-333333333333', 'William Harris', 'foreman@buildright.test', 
   '+1-310-555-2002', 'Site Foreman', 'Operations', '2023-05-15', 'active', 'FOR001', 'L2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PROFESSIONALS (Freelancers/Contractors)
-- ============================================================================

INSERT INTO professionals (id, account_id, name, full_name, email, phone, specialty, hourly_rate, certifications, availability_status, portfolio_url, rating, notes, created_at, updated_at)
VALUES
  -- Account 1 Professionals
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'Alice Johnson', 'Alice Johnson', 'alice@consulting.com', '+1-555-9001', 'Business Consultant', 150.00, 
   'MBA, PMP, Six Sigma Black Belt', 'available', 'https://alicejohnson.com', 4.8, 
   'Experienced in digital transformation projects', NOW(), NOW()),
  
  ('b1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'Bob Martinez', 'Bob Martinez', 'bob@uxdesign.com', '+1-555-9002', 'UX/UI Designer', 120.00, 
   'Adobe Certified Expert, Google UX Certificate', 'busy', 'https://bobmartinez.design', 4.9, 
   'Specialist in SaaS applications', NOW(), NOW()),

  -- Account 2 Professionals
  ('b2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'Claire Dubois', 'Claire Dubois', 'claire@photography.fr', '+33-6-12-34-56-78', 'Commercial Photographer', 180.00, 
   'Professional Photographers of France Member', 'available', 'https://clairedubois.photo', 4.7, 
   'Fashion and product photography specialist', NOW(), NOW()),

  -- Account 3 Professionals
  ('b3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'Daniel Kim', 'Daniel Kim', 'daniel@architecture.com', '+1-858-555-5001', 'Licensed Architect', 200.00, 
   'AIA, LEED AP BD+C', 'available', 'https://danielkim.arch', 5.0, 
   'Sustainable building design expert', NOW(), NOW()),
  
  ('b3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'Elena Popescu', 'Elena Popescu', 'elena@structural.com', '+1-858-555-5002', 'Structural Engineer', 175.00, 
   'PE, SE, California Licensed', 'busy', 'https://elenapopescu.eng', 4.9, 
   'High-rise and commercial structures', NOW(), NOW()),

  -- Account 5 Professionals
  ('b5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'Franz Becker', 'Franz Becker', 'franz@automation.de', '+49-89-33445566', 'Automation Engineer', 130.00, 
   'Siemens Certified, TÜV Qualified', 'available', NULL, 4.6, 
   'Industrial automation and robotics', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

INSERT INTO suppliers (id, account_id, name, email, phone, company, address, status, created_at, updated_at)
VALUES
  -- Account 1 Suppliers
  ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'James Wilson', 'sales@cloudsaas.com', '+1-800-555-0001', 'Cloud SaaS Solutions', 
   '100 Cloud Dr, Redmond, WA 98052', 'active', NOW(), NOW()),
  
  ('d1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'Sarah Chen', 'info@devtools.com', '+1-888-555-0002', 'DevTools Supply Co', 
   '200 Developer Way, Austin, TX 78701', 'active', NOW(), NOW()),

  -- Account 3 Suppliers
  ('d3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'Tom Anderson', 'orders@buildingsupply.com', '+1-800-555-3001', 'Building Supply Depot', 
   '5000 Construction Blvd, Phoenix, AZ 85001', 'active', NOW(), NOW()),
  
  ('d3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'Rachel Green', 'sales@lumber.com', '+1-888-555-3002', 'Premium Lumber Inc', 
   '1500 Timber Road, Eugene, OR 97401', 'active', NOW(), NOW()),

  -- Account 5 Suppliers
  ('d5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'Hermann Schneider', 'info@rawmaterials.de', '+49-211-9988-0', 'Raw Materials GmbH', 
   'Industriestraße 75, 40210 Düsseldorf, Germany', 'active', NOW(), NOW()),
  
  ('d5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 
   'Petra Hoffmann', 'bestellung@chemie.de', '+49-69-7766-0', 'Industrial Chemicals AG', 
   'Chemieweg 15, 60308 Frankfurt, Germany', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PROJECTS (14 projects across accounts)
-- ============================================================================

INSERT INTO projects (id, account_id, name, description, client_id, start_date, end_date, status, budget, actual_cost, progress, notes, created_at, updated_at)
VALUES
  -- Account 1 Projects
  ('01111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'Acme CRM Implementation', 'Full CRM system deployment for Acme Corporation', 
   'c1111111-1111-1111-1111-111111111111', '2026-01-01', '2026-06-30', 'in_progress', 
   150000.00, 45000.00, 30, 'Phase 1 completed, Phase 2 in progress', NOW(), NOW()),
  
  ('01111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'Global Tech Integration', 'API integration and data migration project', 
   'c1111111-1111-1111-1111-111111111112', '2026-02-15', '2026-05-15', 'in_progress', 
   80000.00, 20000.00, 25, 'Data mapping phase', NOW(), NOW()),
  
  ('01111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'StartupXYZ MVP Development', 'Rapid MVP development for startup client', 
   'c1111111-1111-1111-1111-111111111113', '2026-01-20', '2026-04-20', 'in_progress', 
   50000.00, 30000.00, 60, 'Beta testing phase', NOW(), NOW()),
  
  ('01111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 
   'Retail Pro POS System', 'Custom POS system for retail chain', 
   'c1111111-1111-1111-1111-111111111115', '2025-11-01', '2026-03-31', 'in_progress', 
   120000.00, 90000.00, 75, 'Pilot rollout in 5 stores', NOW(), NOW()),

  -- Account 2 Projects
  ('02222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'Fashion Brand Spring Campaign', 'Complete branding campaign for spring collection', 
   'c2222222-2222-2222-2222-222222222221', '2026-01-10', '2026-03-31', 'in_progress', 
   45000.00, 35000.00, 70, 'Photography completed, final edits pending', NOW(), NOW()),
  
  ('02222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'Restaurant Chain Rebrand', 'Logo redesign and menu updates', 
   'c2222222-2222-2222-2222-222222222222', '2026-02-01', '2026-04-30', 'planning', 
   30000.00, 5000.00, 10, 'Initial concept development', NOW(), NOW()),
  
  ('02222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'E-Commerce Platform Design', 'UX/UI redesign for e-commerce site', 
   'c2222222-2222-2222-2222-222222222223', '2026-03-01', '2026-06-30', 'planning', 
   60000.00, 0.00, 5, 'Discovery phase', NOW(), NOW()),

  -- Account 3 Projects
  ('03333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'Riverside Development Phase 1', 'Mixed-use development construction', 
   'c3333333-3333-3333-3333-333333333331', '2025-09-01', '2027-09-01', 'in_progress', 
   5000000.00, 1500000.00, 30, 'Foundation work completed', NOW(), NOW()),
  
  ('03333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'City Municipal Building', 'Public facility construction', 
   'c3333333-3333-3333-3333-333333333332', '2026-01-01', '2026-12-31', 'in_progress', 
   2500000.00, 400000.00, 15, 'Permit approval received', NOW(), NOW()),
  
  ('03333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'Real Estate Office Complex', 'Commercial office renovation', 
   'c3333333-3333-3333-3333-333333333333', '2026-03-15', '2026-08-15', 'planning', 
   750000.00, 50000.00, 5, 'Architectural plans in review', NOW(), NOW()),

  -- Account 4 Projects
  ('04444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 
   'Insurance Provider Portal', 'Customer portal development', 
   'c4444444-4444-4444-4444-444444444441', '2026-01-15', '2026-07-15', 'in_progress', 
   200000.00, 80000.00, 40, 'Backend development phase', NOW(), NOW()),

  -- Account 5 Projects
  ('05555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'Automotive Factory Automation', 'Production line automation upgrade', 
   'c5555555-5555-5555-5555-555555555551', '2025-12-01', '2026-06-30', 'in_progress', 
   850000.00, 300000.00, 35, 'Installation phase 1 complete', NOW(), NOW()),
  
  ('05555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 
   'Electronics Quality Control System', 'QC automation and tracking', 
   'c5555555-5555-5555-5555-555555555552', '2026-02-01', '2026-05-31', 'in_progress', 
   120000.00, 30000.00, 25, 'Requirements gathering complete', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TASKS (33 tasks across projects)
-- ============================================================================

INSERT INTO tasks (id, account_id, title, description, project_id, assigned_to, status, priority, due_date, estimated_hours, actual_hours, created_at, updated_at)
VALUES
  -- Account 1 Tasks (Project: Acme CRM)
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'Database Schema Design', 'Design and document database schema', 
   '01111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111113', 
   'completed', 'high', '2026-01-15', 40.0, 38.0, NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'API Development', 'Build RESTful API endpoints', 
   '01111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111113', 
   'in_progress', 'high', '2026-02-28', 80.0, 45.0, NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'Frontend Dashboard', 'Create React dashboard with charts', 
   '01111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111115', 
   'in_progress', 'medium', '2026-03-15', 60.0, 20.0, NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 
   'User Authentication', 'Implement JWT-based auth', 
   '01111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111113', 
   'completed', 'high', '2026-01-30', 24.0, 26.0, NOW(), NOW()),

  -- Account 1 Tasks (Project: Global Tech)
  ('c1111111-1111-1111-1111-111111111121', '11111111-1111-1111-1111-111111111111', 
   'API Integration Setup', 'Configure third-party API connections', 
   '01111111-1111-1111-1111-111111111112', 'e1111111-1111-1111-1111-111111111113', 
   'in_progress', 'high', '2026-03-01', 32.0, 15.0, NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111122', '11111111-1111-1111-1111-111111111111', 
   'Data Migration Scripts', 'Write ETL scripts for data migration', 
   '01111111-1111-1111-1111-111111111112', 'e1111111-1111-1111-1111-111111111115', 
   'pending', 'medium', '2026-04-01', 40.0, 0.0, NOW(), NOW()),

  -- Account 1 Tasks (Project: StartupXYZ MVP)
  ('c1111111-1111-1111-1111-111111111131', '11111111-1111-1111-1111-111111111111', 
   'MVP Feature Scoping', 'Define MVP scope with product manager', 
   '01111111-1111-1111-1111-111111111113', 'e1111111-1111-1111-1111-111111111112', 
   'completed', 'high', '2026-01-25', 16.0, 14.0, NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111132', '11111111-1111-1111-1111-111111111111', 
   'Core Feature Development', 'Build main application features', 
   '01111111-1111-1111-1111-111111111113', 'e1111111-1111-1111-1111-111111111113', 
   'in_progress', 'high', '2026-03-30', 120.0, 75.0, NOW(), NOW()),
  
  ('c1111111-1111-1111-1111-111111111133', '11111111-1111-1111-1111-111111111111', 
   'Beta Testing Coordination', 'Organize and manage beta testers', 
   '01111111-1111-1111-1111-111111111113', 'e1111111-1111-1111-1111-111111111112', 
   'pending', 'medium', '2026-04-10', 24.0, 0.0, NOW(), NOW()),

  -- Account 2 Tasks (Project: Fashion Campaign)
  ('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'Product Photography', 'Shoot spring collection products', 
   '02222222-2222-2222-2222-222222222221', 'e2222222-2222-2222-2222-222222222222', 
   'completed', 'high', '2026-02-15', 40.0, 42.0, NOW(), NOW()),
  
  ('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'Campaign Copy Writing', 'Write marketing copy for campaign', 
   '02222222-2222-2222-2222-222222222221', 'e2222222-2222-2222-2222-222222222223', 
   'in_progress', 'medium', '2026-03-01', 20.0, 15.0, NOW(), NOW()),
  
  ('c2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'Social Media Graphics', 'Design social media assets', 
   '02222222-2222-2222-2222-222222222221', 'e2222222-2222-2222-2222-222222222222', 
   'in_progress', 'high', '2026-03-20', 32.0, 28.0, NOW(), NOW()),

  -- Account 2 Tasks (Project: Restaurant Rebrand)
  ('c2222222-2222-2222-2222-222222222231', '22222222-2222-2222-2222-222222222222', 
   'Logo Concept Development', 'Create 3 logo concepts', 
   '02222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 
   'pending', 'high', '2026-02-20', 24.0, 0.0, NOW(), NOW()),
  
  ('c2222222-2222-2222-2222-222222222232', '22222222-2222-2222-2222-222222222222', 
   'Menu Design Update', 'Redesign menu layout and typography', 
   '02222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 
   'pending', 'medium', '2026-03-15', 16.0, 0.0, NOW(), NOW()),

  -- Account 3 Tasks (Project: Riverside Development)
  ('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'Site Survey and Assessment', 'Complete topographical survey', 
   '03333333-3333-3333-3333-333333333331', 'e3333333-3333-3333-3333-333333333332', 
   'completed', 'high', '2025-10-01', 80.0, 85.0, NOW(), NOW()),
  
  ('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'Foundation Excavation', 'Excavate and prepare foundation', 
   '03333333-3333-3333-3333-333333333331', 'e3333333-3333-3333-3333-333333333333', 
   'completed', 'high', '2025-12-15', 200.0, 210.0, NOW(), NOW()),
  
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'Steel Framework Installation', 'Install structural steel', 
   '03333333-3333-3333-3333-333333333331', 'e3333333-3333-3333-3333-333333333333', 
   'in_progress', 'high', '2026-04-30', 300.0, 120.0, NOW(), NOW()),

  -- Account 3 Tasks (Project: Municipal Building)
  ('c3333333-3333-3333-3333-333333333341', '33333333-3333-3333-3333-333333333333', 
   'Permit Application', 'Submit building permits to city', 
   '03333333-3333-3333-3333-333333333332', 'e3333333-3333-3333-3333-333333333332', 
   'completed', 'high', '2026-01-15', 40.0, 38.0, NOW(), NOW()),
  
  ('c3333333-3333-3333-3333-333333333342', '33333333-3333-3333-3333-333333333333', 
   'Architectural Plans Review', 'Review and finalize plans', 
   '03333333-3333-3333-3333-333333333332', 'e3333333-3333-3333-3333-333333333332', 
   'in_progress', 'high', '2026-03-01', 60.0, 35.0, NOW(), NOW()),

  -- Account 4 Tasks (Project: Insurance Portal)
  ('c4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 
   'Requirements Gathering', 'Document portal requirements', 
   '04444444-4444-4444-4444-444444444441', NULL, 
   'completed', 'high', '2026-02-01', 32.0, 30.0, NOW(), NOW()),
  
  ('c4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 
   'Backend API Development', 'Build customer portal API', 
   '04444444-4444-4444-4444-444444444441', NULL, 
   'in_progress', 'high', '2026-04-30', 120.0, 50.0, NOW(), NOW()),
  
  ('c4444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 
   'Frontend Dashboard Design', 'Design customer dashboard UI', 
   '04444444-4444-4444-4444-444444444441', NULL, 
   'pending', 'medium', '2026-05-15', 80.0, 0.0, NOW(), NOW()),

  -- Account 5 Tasks (Project: Factory Automation)
  ('c5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'Production Line Assessment', 'Assess current automation needs', 
   '05555555-5555-5555-5555-555555555551', NULL, 
   'completed', 'high', '2025-12-31', 60.0, 62.0, NOW(), NOW()),
  
  ('c5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 
   'Robotic Arm Installation', 'Install automated assembly arms', 
   '05555555-5555-5555-5555-555555555551', NULL, 
   'in_progress', 'high', '2026-03-31', 160.0, 90.0, NOW(), NOW()),
  
  ('c5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 
   'Control System Programming', 'Program PLC control systems', 
   '05555555-5555-5555-5555-555555555551', NULL, 
   'in_progress', 'high', '2026-05-15', 120.0, 40.0, NOW(), NOW()),

  -- Account 5 Tasks (Project: QC System)
  ('c5555555-5555-5555-5555-555555555561', '55555555-5555-5555-5555-555555555555', 
   'QC Process Documentation', 'Document current QC processes', 
   '05555555-5555-5555-5555-555555555552', NULL, 
   'completed', 'medium', '2026-02-15', 24.0, 22.0, NOW(), NOW()),
  
  ('c5555555-5555-5555-5555-555555555562', '55555555-5555-5555-5555-555555555555', 
   'Sensor Integration', 'Integrate quality sensors', 
   '05555555-5555-5555-5555-555555555552', NULL, 
   'in_progress', 'high', '2026-04-30', 80.0, 25.0, NOW(), NOW()),
  
  ('c5555555-5555-5555-5555-555555555563', '55555555-5555-5555-5555-555555555555', 
   'Tracking Software Development', 'Build quality tracking dashboard', 
   '05555555-5555-5555-5555-555555555552', NULL, 
   'pending', 'medium', '2026-05-20', 60.0, 0.0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FILES (16 files with Phase 6.5 storage metadata)
-- ============================================================================

INSERT INTO files (id, account_id, filename, stored_filename, mime_type, size_bytes, 
                   file_service_type, file_service_name, file_path, 
                   entity_type, entity_id, file_category, uploaded_by, 
                   description, is_public, status, created_at, updated_at)
VALUES
  -- Account 1 Files
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'acme_proposal_v2.pdf', '2026/02/11111111-1111-1111-1111-111111111111/projects/acme_proposal_v2_abc123.pdf', 
   'application/pdf', 2458624, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/11111111-1111-1111-1111-111111111111/projects/acme_proposal_v2_abc123.pdf', 
   'project', '01111111-1111-1111-1111-111111111111', 'document', 
   'a1111111-1111-1111-1111-111111111111', 'Project proposal document for Acme CRM', 
   false, 'active', NOW(), NOW()),
  
  ('f1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'api_documentation.pdf', '2026/02/11111111-1111-1111-1111-111111111111/projects/api_docs_def456.pdf', 
   'application/pdf', 8945123, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/11111111-1111-1111-1111-111111111111/projects/api_docs_def456.pdf', 
   'project', '01111111-1111-1111-1111-111111111111', 'document', 
   'a1111111-1111-1111-1111-111111111113', 'Technical API documentation', 
   false, 'active', NOW(), NOW()),
  
  ('f1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'dashboard_mockup.png', '2026/02/11111111-1111-1111-1111-111111111111/projects/mockup_ghi789.png', 
   'image/png', 1245678, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/11111111-1111-1111-1111-111111111111/projects/mockup_ghi789.png', 
   'project', '01111111-1111-1111-1111-111111111111', 'image', 
   'a1111111-1111-1111-1111-111111111115', 'Dashboard design mockup', 
   false, 'active', NOW(), NOW()),
  
  ('f1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 
   'company_logo.svg', '2026/02/11111111-1111-1111-1111-111111111111/company/logo_jkl012.svg', 
   'image/svg+xml', 45632, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/11111111-1111-1111-1111-111111111111/company/logo_jkl012.svg', 
   NULL, NULL, 'avatar', 
   'a1111111-1111-1111-1111-111111111111', 'Company logo', 
   true, 'active', NOW(), NOW()),

  -- Account 2 Files
  ('f2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'spring_catalog_2026.pdf', '2026/02/22222222-2222-2222-2222-222222222222/clients/catalog_mno345.pdf', 
   'application/pdf', 12458960, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/22222222-2222-2222-2222-222222222222/clients/catalog_mno345.pdf', 
   'client', 'c2222222-2222-2222-2222-222222222221', 'document', 
   'a2222222-2222-2222-2222-222222222221', 'Spring collection catalog', 
   false, 'active', NOW(), NOW()),
  
  ('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'campaign_photos.zip', '2026/02/22222222-2222-2222-2222-222222222222/projects/photos_pqr678.zip', 
   'application/zip', 145623890, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/22222222-2222-2222-2222-222222222222/projects/photos_pqr678.zip', 
   'project', '02222222-2222-2222-2222-222222222221', 'attachment', 
   'a2222222-2222-2222-2222-222222222222', 'Campaign photography archive', 
   false, 'active', NOW(), NOW()),
  
  ('f2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'social_media_post.jpg', '2026/02/22222222-2222-2222-2222-222222222222/projects/post_stu901.jpg', 
   'image/jpeg', 856234, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/22222222-2222-2222-2222-222222222222/projects/post_stu901.jpg', 
   'project', '02222222-2222-2222-2222-222222222221', 'image', 
   'a2222222-2222-2222-2222-222222222222', 'Social media campaign image', 
   true, 'active', NOW(), NOW()),

  -- Account 3 Files
  ('f3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'riverside_blueprints.dwg', '2026/02/33333333-3333-3333-3333-333333333333/projects/blueprints_vwx234.dwg', 
   'application/acad', 45896234, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/33333333-3333-3333-3333-333333333333/projects/blueprints_vwx234.dwg', 
   'project', '03333333-3333-3333-3333-333333333331', 'document', 
   'a3333333-3333-3333-3333-333333333332', 'Architectural blueprints', 
   false, 'active', NOW(), NOW()),
  
  ('f3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'site_survey_report.pdf', '2026/02/33333333-3333-3333-3333-333333333333/projects/survey_yza567.pdf', 
   'application/pdf', 8562345, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/33333333-3333-3333-3333-333333333333/projects/survey_yza567.pdf', 
   'project', '03333333-3333-3333-3333-333333333331', 'document', 
   'a3333333-3333-3333-3333-333333333332', 'Topographical survey report', 
   false, 'active', NOW(), NOW()),
  
  ('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'construction_photos_week1.zip', '2026/02/33333333-3333-3333-3333-333333333333/projects/photos_bcd890.zip', 
   'application/zip', 95623456, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/33333333-3333-3333-3333-333333333333/projects/photos_bcd890.zip', 
   'project', '03333333-3333-3333-3333-333333333331', 'attachment', 
   'a3333333-3333-3333-3333-333333333333', 'Weekly construction progress photos', 
   false, 'active', NOW(), NOW()),

  -- Account 4 Files
  ('f4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 
   'portal_requirements.docx', '2026/02/44444444-4444-4444-4444-444444444444/projects/requirements_efg123.docx', 
   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2356789, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/44444444-4444-4444-4444-444444444444/projects/requirements_efg123.docx', 
   'project', '04444444-4444-4444-4444-444444444441', 'document', 
   'a4444444-4444-4444-4444-444444444441', 'Customer portal requirements document', 
   false, 'active', NOW(), NOW()),
  
  ('f4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 
   'user_flow_diagram.png', '2026/02/44444444-4444-4444-4444-444444444444/projects/userflow_hij456.png', 
   'image/png', 1456789, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/44444444-4444-4444-4444-444444444444/projects/userflow_hij456.png', 
   'project', '04444444-4444-4444-4444-444444444441', 'image', 
   'a4444444-4444-4444-4444-444444444441', 'User flow diagram', 
   false, 'active', NOW(), NOW()),

  -- Account 5 Files
  ('f5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 
   'automation_specs.xlsx', '2026/02/55555555-5555-5555-5555-555555555555/projects/specs_klm789.xlsx', 
   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 4562345, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/55555555-5555-5555-5555-555555555555/projects/specs_klm789.xlsx', 
   'project', '05555555-5555-5555-5555-555555555551', 'document', 
   'a5555555-5555-5555-5555-555555555551', 'Automation technical specifications', 
   false, 'active', NOW(), NOW()),
  
  ('f5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 
   'factory_layout.pdf', '2026/02/55555555-5555-5555-5555-555555555555/projects/layout_nop012.pdf', 
   'application/pdf', 8956234, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/55555555-5555-5555-5555-555555555555/projects/layout_nop012.pdf', 
   'project', '05555555-5555-5555-5555-555555555551', 'document', 
   'a5555555-5555-5555-5555-555555555551', 'Factory floor layout plan', 
   false, 'active', NOW(), NOW()),
  
  ('f5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 
   'qc_process_flowchart.pdf', '2026/02/55555555-5555-5555-5555-555555555555/projects/flowchart_qrs345.pdf', 
   'application/pdf', 1856234, 'local', 'nexo-local-storage', 
   './media/uploads/2026/02/55555555-5555-5555-5555-555555555555/projects/flowchart_qrs345.pdf', 
   'project', '05555555-5555-5555-5555-555555555552', 'document', 
   'a5555555-5555-5555-5555-555555555552', 'Quality control process flowchart', 
   false, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
  project_count INT;
  task_count INT;
  file_count INT;
  employee_count INT;
  professional_count INT;
  supplier_count INT;
BEGIN
  SELECT COUNT(*) INTO project_count FROM projects WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '44444444%' OR account_id::text LIKE '55555555%';
  SELECT COUNT(*) INTO task_count FROM tasks WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '44444444%' OR account_id::text LIKE '55555555%';
  SELECT COUNT(*) INTO file_count FROM files WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '44444444%' OR account_id::text LIKE '55555555%';
  SELECT COUNT(*) INTO employee_count FROM employees WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%';
  SELECT COUNT(*) INTO professional_count FROM professionals WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '55555555%';
  SELECT COUNT(*) INTO supplier_count FROM suppliers WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '33333333%' OR account_id::text LIKE '55555555%';
  
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════╗';
  RAISE NOTICE '║   Test Data Seeded Successfully (Complete)       ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Projects: %', project_count;
  RAISE NOTICE 'Test Tasks: %', task_count;
  RAISE NOTICE 'Test Files: %', file_count;
  RAISE NOTICE 'Test Employees: %', employee_count;
  RAISE NOTICE 'Test Professionals: %', professional_count;
  RAISE NOTICE 'Test Suppliers: %', supplier_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ All test data loaded. Ready for RLS and API testing!';
  RAISE NOTICE '';
END $$;
