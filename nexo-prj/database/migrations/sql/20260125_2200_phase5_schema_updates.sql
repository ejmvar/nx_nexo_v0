-- ============================================================================
-- Phase 5: Additional CRM Entities Schema Updates
-- ============================================================================
-- Migration: 20260125_2200_phase5_schema_updates.sql
-- Purpose: Add support for Employees, Professionals, Projects, and Tasks
-- Author: NEXO Development Team
-- Date: January 25, 2026
-- ============================================================================

BEGIN;

-- =====================================================
-- 1. UPDATE EMPLOYEES TABLE
-- =====================================================
-- The employees table exists but needs additional fields
-- to support the full employee management functionality

-- Add missing columns
ALTER TABLE employees 
  ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS salary_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS manager_id UUID;

-- Add foreign key for manager relationship
ALTER TABLE employees 
  ADD CONSTRAINT fk_employees_manager 
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET  NULL;

-- Create index for manager relationship
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);

-- Make employee_code unique per account
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_account_code 
  ON employees(account_id, employee_code) WHERE employee_code IS NOT NULL;

-- =====================================================
-- 2. CREATE PROFESSIONALS TABLE
-- =====================================================
-- Freelancers/contractors who work on projects

CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(100),
  hourly_rate DECIMAL(10,2),
  certifications TEXT,
  availability_status VARCHAR(50) DEFAULT 'available',
  portfolio_url VARCHAR(500),
  rating DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security for professionals
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS professionals_isolation_policy ON professionals;
CREATE POLICY professionals_isolation_policy ON professionals
  FOR ALL
  USING (account_id = current_user_account_id())
  WITH CHECK (account_id = current_user_account_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_professionals_account ON professionals(account_id);
CREATE INDEX IF NOT EXISTS idx_professionals_specialty ON professionals(specialty);
CREATE INDEX IF NOT EXISTS idx_professionals_availability ON professionals(availability_status);

-- Updated timestamp trigger
DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;
CREATE TRIGGER update_professionals_updated_at 
  BEFORE UPDATE ON professionals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CREATE PROJECTS TABLE
-- =====================================================
-- Projects are work items for clients

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planning',
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS projects_isolation_policy ON projects;
CREATE POLICY projects_isolation_policy ON projects
  FOR ALL
  USING (account_id = current_user_account_id())
  WITH CHECK (account_id = current_user_account_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_account ON projects(account_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- Updated timestamp trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CREATE TASKS TABLE
-- =====================================================
-- Tasks belong to projects and can be assigned to employees

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(50) DEFAULT 'medium',
  due_date DATE,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_isolation_policy ON tasks;
CREATE POLICY tasks_isolation_policy ON tasks
  FOR ALL
  USING (account_id = current_user_account_id())
  WITH CHECK (account_id = current_user_account_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_account ON tasks(account_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Updated timestamp trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. VALIDATION QUERIES
-- =====================================================
-- Verify tables were created successfully

DO $$
BEGIN
  -- Check if professionals table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'professionals') THEN
    RAISE NOTICE 'professionals table created successfully';
  ELSE
    RAISE EXCEPTION 'professionals table creation failed';
  END IF;

  -- Check if projects table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    RAISE NOTICE 'projects table created successfully';
  ELSE
    RAISE EXCEPTION 'projects table creation failed';
  END IF;

  -- Check if tasks table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
    RAISE NOTICE 'tasks table created successfully';
  ELSE
    RAISE EXCEPTION 'tasks table creation failed';
  END IF;

  -- Check if RLS is enabled
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'professionals' AND rowsecurity = true) THEN
    RAISE NOTICE 'professionals RLS enabled';
  ELSE
    RAISE WARNING 'professionals RLS not enabled';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects' AND rowsecurity = true) THEN
    RAISE NOTICE 'projects RLS enabled';
  ELSE
    RAISE WARNING 'projects RLS not enabled';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks' AND rowsecurity = true) THEN
    RAISE NOTICE 'tasks RLS enabled';
  ELSE
    RAISE WARNING 'tasks RLS not enabled';
  END IF;

  RAISE NOTICE 'Phase 5 schema migration completed successfully';
END $$;

COMMIT;

-- =====================================================
-- 6. POST-MIGRATION VERIFICATION
-- =====================================================
-- Run these queries after migration to verify:
--
-- \d employees;
-- \d professionals;
-- \d projects;
-- \d tasks;
--
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname='public' 
-- AND tablename IN ('employees', 'professionals', 'projects', 'tasks');
--
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('employees', 'professionals', 'projects', 'tasks');
