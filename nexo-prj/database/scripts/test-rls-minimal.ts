#!/usr/bin/env tsx
/**
 * Minimal RLS Test - Debug why RLS isn't working
 */

import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: "postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm?schema=public"
});

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== RLS DEBUG TEST ===\n');

    // Test 1: Check if the function works
    const funcTest = await client.query(`SELECT current_setting('app.current_account_id', true)`);
    console.log(`1. Before SET: current_setting = ${funcTest.rows[0].current_setting || 'NULL'}`);

    // Test 2: Set the value
    await client.query(`SET app.current_account_id = '11111111-1111-1111-1111-111111111111'`);
    const funcTest2 = await client.query(`SELECT current_setting('app.current_account_id', true)`);
    console.log(`2. After SET: current_setting = ${funcTest2.rows[0].current_setting}`);

    // Test 3: Check what the function returns
    const funcTest3 = await client.query(`SELECT current_user_account_id()`);
    console.log(`3. Function returns: ${funcTest3.rows[0].current_user_account_id}`);

    // Test 4: Test the WHERE clause directly
    const whereTest = await client.query(`
      SELECT 
        '22222222-2222-2222-2222-222222222222'::uuid AS account_id,
        current_user_account_id() AS current_id,
        ('22222222-2222-2222-2222-222222222222'::uuid = current_user_account_id()) AS matches
    `);
    console.log(`4. WHERE clause test:`);
    console.log(`   account_id = ${whereTest.rows[0].account_id}`);
    console.log(`   current_id = ${whereTest.rows[0].current_id}`);
    console.log(`   matches = ${whereTest.rows[0].matches}`);

    console.log('\n5. Theory: The comparison should be FALSE, so RLS should filter the row.');
    console.log('   If RLS is working, we should NOT see Account B\'s data.\n');

    // Test 5: Actual query
    await client.query(`DELETE FROM clients WHERE email LIKE 'debug%'`);
    await client.query(`
      INSERT INTO clients (account_id, name, email, status, created_at, updated_at)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Debug A', 'debug-a@test.com', 'active', NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'Debug B', 'debug-b@test.com', 'active', NOW(), NOW())
    `);

    const query = await client.query(`SELECT name, account_id FROM clients WHERE email LIKE 'debug%' ORDER BY name`);
    console.log(`6. Query result (should only show Debug A):`);
    query.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.account_id}`);
    });

    if (query.rows.length === 1 && query.rows[0].name === 'Debug A') {
      console.log('\n✅ RLS IS WORKING!\n');
    } else {
      console.log('\n❌ RLS IS NOT WORKING!\n');
      console.log('Possible causes:');
      console.log('  1. Policy expression isn\'t being evaluated');
      console.log('  2. FORCE RLS not actually enforced for this user');
      console.log('  3. There\'s a PERMISSIVE policy conflict');
      console.log('  4. The function is returning wrong value in policy context\n');
    }

    await client.query(`DELETE FROM clients WHERE email LIKE 'debug%'`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
