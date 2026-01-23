#!/usr/bin/env tsx
/**
 * Direct SQL RLS Test
 * Tests RLS using raw SQL queries to eliminate Prisma variables
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
    console.log('║       Direct SQL RLS Test                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Insert test data for Account A
    console.log('📦 Step 1: Insert client for Account A');
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111'`);
    const insertA = await client.query(`
      INSERT INTO clients (account_id, name, email, status, created_at, updated_at)
      VALUES ('11111111-1111-1111-1111-111111111111', 'SQL Client A', 'sqla@test.com', 'active', NOW(), NOW())
      RETURNING id
    `);
    await client.query('COMMIT');
    console.log(`   ✅ Created client A: ${insertA.rows[0].id}`);

    // Step 2: Insert test data for Account B
    console.log('\n📦 Step 2: Insert client for Account B');
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_account_id = '22222222-2222-2222-2222-222222222222'`);
    const insertB = await client.query(`
      INSERT INTO clients (account_id, name, email, status, created_at, updated_at)
      VALUES ('22222222-2222-2222-2222-222222222222', 'SQL Client B', 'sqlb@test.com', 'active', NOW(), NOW())
      RETURNING id
    `);
    await client.query('COMMIT');
    console.log(`   ✅ Created client B: ${insertB.rows[0].id}`);

    // Step 3: Query as Account A
    console.log('\n📋 Step 3: Query as Account A (should see only Account A data)');
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_account_id = '11111111-1111-1111-1111-111111111111'`);
    
    // Debug: Check what the function returns
    const debugQuery = await client.query('SELECT current_user_account_id()');
    console.log(`   DEBUG: current_user_account_id() = ${debugQuery.rows[0].current_user_account_id}`);
    
    const queryAll = await client.query(`SELECT id, name, account_id FROM clients ORDER BY name`);
    console.log(`   Found ${queryAll.rows.length} total client(s)`);
    queryAll.rows.forEach(row => {
      const accountMatch = row.account_id === '11111111-1111-1111-1111-111111111111';
      console.log(`   - ${row.name}: ${row.account_id} ${accountMatch ? '✅' : '❌ LEAK!'}`);
    });
    
    const queryB = await client.query(`SELECT * FROM clients WHERE id = '${insertB.rows[0].id}'`);
    console.log(`\n   Direct query for Client B: ${queryB.rows.length} rows`);
    
    await client.query('COMMIT');

    if (queryAll.rows.length === 1 && queryB.rows.length === 0) {
      console.log('\n🎉 ✅ RLS IS WORKING CORRECTLY!');
      console.log('   Account A can only see Account A data\n');
    } else {
      console.log('\n❌ RLS IS NOT WORKING!');
      console.log('   Account A can see other accounts\' data\n');
    }

    // Cleanup
    await client.query(`DELETE FROM clients WHERE id IN ('${insertA.rows[0].id}', '${insertB.rows[0].id}')`);

  } catch (error) {
    console.error('❌ Error:', error);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
