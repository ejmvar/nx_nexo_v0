-- Quick Test Data Seed (Schema-Corrected)
BEGIN;

-- Test accounts
INSERT INTO accounts (id, name, slug, settings, active, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechFlow Solutions Test', 'techflow-test', 
   '{"industry": "technology"}'::jsonb, true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Creative Minds Test', 'creative-test', 
   '{"industry": "marketing"}'::jsonb, true, NOW(), NOW())
ON CONFLICT(id) DO NOTHING;

-- Test users (added created_at and updated_at)
INSERT INTO users (id, account_id, email, username, password_hash, first_name, last_name, active, email_verified, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'admin@techflow.test', 'admin_techflow', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Alex', 'Anderson', true, true, NOW(), NOW()),
  ('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'admin@creative.test', 'admin_creative', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
   'Emma', 'Wilson', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Test clients
INSERT INTO clients (id, account_id, name, email, company, status, created_by, created_at, updated_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'John Doe', 'john@acme.com', 'Acme Corp', 'active', 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'Sophie Martin', 'sophie@fashion.com', 'Fashion EU', 'active', 'a2222222-2222-2222-2222-222222222221', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

\echo '✅ Test data loaded successfully!'
SELECT COUNT(*) as test_accounts FROM accounts WHERE id::text LIKE '11111111%' OR id::text LIKE '22222222%';
SELECT COUNT(*) as test_users FROM users WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%';
SELECT COUNT(*) as test_clients FROM clients WHERE account_id::text LIKE '11111111%' OR account_id::text LIKE '22222222%';
