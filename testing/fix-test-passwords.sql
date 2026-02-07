-- Fix test user passwords after loading seed data
-- The seed files contain placeholder hashes that don't match 'test123'
-- Run this script to set correct passwords for all test users

-- Update all test account user passwords
UPDATE users 
SET password_hash = crypt('test123', gen_salt('bf', 10))
WHERE email LIKE '%techflow.test' 
   OR email LIKE '%creativeminds.test'
   OR email LIKE '%buildright.test'
   OR email LIKE '%healthcare.test'
   OR email LIKE '%industrial.test';

-- Verify passwords were updated
SELECT 
  email,
  account_id,
  LEFT(password_hash, 20) as hash_prefix,
  active
FROM users 
WHERE email LIKE '%.test'
ORDER BY account_id, email;

-- Test login for Account 1 admin
SELECT 
  'Password check for admin@techflow.test' as test,
  CASE 
    WHEN password_hash = crypt('test123', password_hash) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as result
FROM users 
WHERE email = 'admin@techflow.test';
