-- ============================================================================
-- Phase 5: Fix and Complete Schema Updates
-- ============================================================================
-- Migration: 20260126_0100_phase5_fix.sql
-- Purpose: Fix professionals table and add projects/tasks tables
-- Author: NEXO Development Team
-- Date: January 26, 2026
-- ============================================================================

BEGIN;

-- =====================================================
-- 1. FIX PROFESSIONALS TABLE
-- =====================================================

-- Add missing columns to existing professionals table
ALTER TABLE professionals 
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS certifications TEXT,
  ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Copy name to full_name if full_name is null
UPDATE professionals SET full_name = name WHERE full_name IS NULL;

-- Make full_name NOT NULL after copying data
ALTER TABLE professionals ALTER COLUMN full_name SET NOT NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_professionals_specialty ON professionals(specialty);
CREATE INDEX IF NOT EXISTS idx_professionals_availability ON professionals(availability_status);

-- =====================================================
-- 2. CREATE PROJECTS TABLE
-- =====================================================

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
-- 3. CREATE TASKS TABLE
-- =====================================================

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
-- 4. VALIDATION
-- =====================================================

DO $$
BEGIN
  -- Check if professionals table has full_name
  IF EXISTS (SELECT FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'professionals' 
             AND column_name = 'full_name') THEN
    RAISE NOTICE 'professionals table updated successfully';
  ELSE
    RAISE EXCEPTION 'professionals table update failed';
  END IF;

  -- Check if projects table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'projects') THEN
    RAISE NOTICE 'projects table created successfully';
  ELSE
    RAISE EXCEPTION 'projects table creation failed';
  END IF;

  -- Check if tasks table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks') THEN
    RAISE NOTICE 'tasks table created successfully';
  ELSE
    RAISE EXCEPTION 'tasks table creation failed';
  END IF;

  -- Check if RLS is enabled
  IF EXISTS (SELECT FROM pg_tables 
             WHERE schemaname = 'public' 
             AND tablename = 'projects' 
             AND rowsecurity = true) THEN
    RAISE NOTICE 'projects RLS enabled';
  ELSE
    RAISE WARNING 'projects RLS not enabled';
  END IF;

  IF EXISTS (SELECT FROM pg_tables 
             WHERE schemaname = 'public' 
             AND tablename = 'tasks' 
             AND rowsecurity = true) THEN
    RAISE NOTICE 'tasks RLS enabled';
  ELSE
    RAISE WARNING 'tasks RLS not enabled';
  END IF;

  RAISE NOTICE 'Phase 5 schema fix completed successfully';
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run after migration:
-- \d professionals;
-- \d projects;
-- \d tasks;
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('professionals', 'projects', 'tasks');
