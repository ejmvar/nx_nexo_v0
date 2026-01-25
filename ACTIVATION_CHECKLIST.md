# Multi-Tenant Activation Checklist

## ✅ CODE IMPLEMENTATION - COMPLETE

All application code is implemented and ready. No further code changes needed.

---

## 🗄️ DATABASE SETUP - REQUIRED

These SQL scripts must be executed on your PostgreSQL database to enable Row Level Security.

### Step 1: Verify Account Table Exists
```sql
-- Check if accounts table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'accounts'
);

-- If not, create it:
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Add account_id to Users Table (if not exists)
```sql
-- Add account_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);
```

### Step 3: Enable RLS on All CRM Tables
```sql
-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

### Step 4: Create RLS Policies

#### Clients Table
```sql
-- Drop existing policies if any
DROP POLICY IF EXISTS clients_isolation ON clients;

-- Create isolation policy
CREATE POLICY clients_isolation ON clients
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  );
```

#### Employees Table
```sql
DROP POLICY IF EXISTS employees_isolation ON employees;

CREATE POLICY employees_isolation ON employees
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  );
```

#### Suppliers Table
```sql
DROP POLICY IF EXISTS suppliers_isolation ON suppliers;

CREATE POLICY suppliers_isolation ON suppliers
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  );
```

#### Professionals Table
```sql
DROP POLICY IF EXISTS professionals_isolation ON professionals;

CREATE POLICY professionals_isolation ON professionals
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  );
```

#### Projects Table
```sql
DROP POLICY IF EXISTS projects_isolation ON projects;

-- Projects may need a different approach if they have account_id directly
-- Option 1: If projects has account_id column
CREATE POLICY projects_isolation ON projects
  FOR ALL
  USING (account_id = current_setting('app.current_account_id')::uuid)
  WITH CHECK (account_id = current_setting('app.current_account_id')::uuid);

-- Option 2: If projects links via client_id
CREATE POLICY projects_isolation ON projects
  FOR ALL
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.account_id = current_setting('app.current_account_id')::uuid
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.account_id = current_setting('app.current_account_id')::uuid
    )
  );
```

#### Tasks Table
```sql
DROP POLICY IF EXISTS tasks_isolation ON tasks;

-- Similar to projects - choose based on your schema
-- Option 1: If tasks has account_id
CREATE POLICY tasks_isolation ON tasks
  FOR ALL
  USING (account_id = current_setting('app.current_account_id')::uuid)
  WITH CHECK (account_id = current_setting('app.current_account_id')::uuid);

-- Option 2: If tasks links via project_id
CREATE POLICY tasks_isolation ON tasks
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE account_id = current_setting('app.current_account_id')::uuid
    )
  );
```

### Step 5: Add account_id to Projects/Tasks if Needed
```sql
-- If projects doesn't have account_id yet
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);

CREATE INDEX IF NOT EXISTS idx_projects_account_id ON projects(account_id);

-- If tasks doesn't have account_id yet
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);

CREATE INDEX IF NOT EXISTS idx_tasks_account_id ON tasks(account_id);
```

---

## 🧪 TESTING - READY

Test file created: `apps/crm-service/test-multi-tenant.http`

### How to Test:

1. **Start all services:**
   ```bash
   cd nexo-prj
   pnpm nx serve auth-service &
   pnpm nx serve crm-service &
   pnpm nx serve api-gateway &
   ```

2. **Get service URLs** (check console output for ports)
   - auth-service: Usually http://localhost:3000
   - crm-service: Usually http://localhost:3001
   - api-gateway: Usually http://localhost:3002

3. **Update test-multi-tenant.http** with correct URLs

4. **Run tests in sequence:**
   - Register Account A
   - Register Account B
   - Login as Account A (copy token)
   - Login as Account B (copy token)
   - Create client in Account A
   - Create client in Account B
   - List clients as Account A (should see only Account A's client)
   - List clients as Account B (should see only Account B's client)
   - Try to access Account B's client as Account A (should fail)

---

## ✅ VERIFICATION CHECKLIST

After database setup and testing:

- [ ] RLS enabled on all 6 CRM tables
- [ ] RLS policies created and active
- [ ] Test shows Account A cannot see Account B's data
- [ ] Test shows Account B cannot see Account A's data
- [ ] Creating records includes account_id automatically
- [ ] Database logs show `SET LOCAL app.current_account_id` calls
- [ ] No TypeScript compilation errors
- [ ] Services start without errors

---

## 🚨 IMPORTANT NOTES

### Security:
- ✅ RLS is enforced at the **database level** - cannot be bypassed by application code
- ✅ Even if a bug occurs in application logic, database will still enforce isolation
- ✅ PostgreSQL connection must have `SET LOCAL` permissions

### Performance:
- ✅ RLS policies use indexes (ensure account_id columns are indexed)
- ✅ No significant performance impact for properly indexed tables
- ✅ Consider creating partial indexes if needed for specific queries

### Monitoring:
- ✅ Log all `queryWithAccount` calls for audit trail
- ✅ Monitor for queries without account_id context (security issue)
- ✅ Track per-account resource usage

---

## 📝 NEXT STEPS AFTER ACTIVATION

1. **Monitoring & Logging**
   - Add account_id to all log entries
   - Create dashboards for per-account metrics
   - Set up alerts for cross-account access attempts

2. **Documentation**
   - Update API documentation with account context
   - Document RLS policies for future developers
   - Create runbook for common multi-tenant operations

3. **Testing**
   - Add automated integration tests
   - Load test with multiple accounts
   - Security penetration testing

4. **Features**
   - Add account management endpoints
   - Implement account switching (if needed)
   - Add admin super-user role (can view all accounts)

---

## 🎯 STATUS

**Code:** ✅ Complete  
**Database:** ⚠️ Awaiting SQL execution  
**Testing:** ✅ Test file ready  
**Documentation:** ✅ Complete  

**Action Required:** Execute database setup scripts, then run tests.
