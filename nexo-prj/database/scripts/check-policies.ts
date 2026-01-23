#!/usr/bin/env tsx
/**
 * Check and list all RLS policies
 */

import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       RLS Policy Status Check                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Check policies on clients table using correct column names
    const policies = await client.query(`
      SELECT 
        pol.polname as policy_name,
        CASE pol.polpermissive WHEN TRUE THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as type,
        pol.polcmd as command,
        pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
        pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
      FROM pg_policy pol
      JOIN pg_class cls ON pol.polrelid = cls.oid
      WHERE cls.relname = 'clients'
      AND cls.relnamespace = 'public'::regnamespace
    `);

    if (policies.rows.length === 0) {
      console.log('❌ NO POLICIES FOUND ON clients TABLE!\n');
    } else {
      console.log(`Found ${policies.rows.length} policy/policies on clients table:\n`);
      policies.rows.forEach((policy, index) => {
        console.log(`Policy ${index + 1}: ${policy.policy_name}`);
        console.log(`  Type: ${policy.type}`);
        console.log(`  Command: ${policy.command}`);
        console.log(`  USING: ${policy.using_expression || 'N/A'}`);
        console.log(`  WITH CHECK: ${policy.with_check_expression || 'N/A'}\n`);
      });
    }

    // Check RLS status
    const rlsStatus = await client.query(`
      SELECT 
        relname as table_name,
        relrowsecurity as rls_enabled,
        relforcerowsecurity as force_rls
      FROM pg_class
      WHERE relname IN ('clients', 'users', 'roles', 'suppliers', 'employees', 'professionals')
      AND relnamespace = 'public'::regnamespace
    `);

    console.log('Table RLS Status:');
    rlsStatus.rows.forEach(row => {
      console.log(`  ${row.table_name}: RLS=${row.rls_enabled}, FORCE=${row.force_rls}`);
    });
    console.log();

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
