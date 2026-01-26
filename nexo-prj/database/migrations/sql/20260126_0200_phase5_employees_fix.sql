-- ============================================================================
-- Phase 5.1: Add Missing Employees Columns
-- ============================================================================
-- Migration: 20260126_0200_phase5_employees_fix.sql
-- Purpose: Add employee_code, salary_level, and manager_id to employees table
-- Author: NEXO Development Team
-- Date: January 26, 2026
-- ============================================================================

BEGIN;

-- =====================================================
-- ADD MISSING COLUMNS TO EMPLOYEES TABLE
-- =====================================================

-- Add employee_code column
ALTER TABLE employees 
  ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50);

-- Add salary_level column
ALTER TABLE employees 
  ADD COLUMN IF NOT EXISTS salary_level VARCHAR(50);

-- Add manager_id column (self-referencing foreign key)
ALTER TABLE employees 
  ADD COLUMN IF NOT EXISTS manager_id UUID;

-- Add foreign key constraint for manager_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'employees_manager_id_fkey'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT employees_manager_id_fkey
      FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(account_id, employee_code) 
  WHERE employee_code IS NOT NULL;

-- =====================================================
-- VALIDATION
-- =====================================================

DO $$
BEGIN
  -- Verify employee_code column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'employee_code'
  ) THEN
    RAISE NOTICE 'employee_code column added successfully';
  ELSE
    RAISE EXCEPTION 'Failed to add employee_code column';
  END IF;

  -- Verify salary_level column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'salary_level'
  ) THEN
    RAISE NOTICE 'salary_level column added successfully';
  ELSE
    RAISE EXCEPTION 'Failed to add salary_level column';
  END IF;

  -- Verify manager_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'manager_id'
  ) THEN
    RAISE NOTICE 'manager_id column added successfully';
  ELSE
    RAISE EXCEPTION 'Failed to add manager_id column';
  END IF;

  RAISE NOTICE 'Phase 5.1 employees table fix completed successfully';
END $$;

COMMIT;
