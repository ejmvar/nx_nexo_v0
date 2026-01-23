#!/usr/bin/env tsx
/**
 * Multi-Tenant RLS Test Script
 * Tests that Row Level Security prevents cross-account data access
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

async function log(message: string) {
  console.log(`  ${message}`);
}

async function testSetup() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       Multi-Tenant RLS Isolation Test                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Create test accounts
  log('📦 Setting up test accounts...');
  
  const accountA = await prisma.account.upsert({
    where: { slug: 'test-account-a' },
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Account A',
      slug: 'test-account-a',
      settings: {},
      active: true,
    },
    update: {},
  });

  const accountB = await prisma.account.upsert({
    where: { slug: 'test-account-b' },
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Test Account B',
      slug: 'test-account-b',
      settings: {},
      active: true,
    },
    update: {},
  });

  log(`✅ Account A: ${accountA.id}`);
  log(`✅ Account B: ${accountB.id}`);

  return { accountA, accountB };
}

async function testWithoutRLS() {
  console.log('\n📋 Test 1: Without RLS Context (Should see all data)');
  
  try {
    const clients = await prisma.client.findMany();
    results.push({
      test: 'Query without RLS context',
      status: 'PASS',
      details: `Retrieved ${clients.length} clients (expected all data)`
    });
    log(`✅ PASS: Retrieved ${clients.length} clients without RLS context`);
  } catch (error) {
    results.push({
      test: 'Query without RLS context',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    });
    log(`❌ FAIL: ${error}`);
  }
}

async function testWithAccountA(accountAId: string) {
  console.log('\n📋 Test 2: With Account A Context (Should see only Account A data)');
  
  try {
    // Use transaction to ensure SET LOCAL persists for the query
    const clients = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_account_id = '${accountAId}'`);
      return await tx.client.findMany();
    });
    
    const accountAClients = clients.filter(c => c.accountId === accountAId);
    const otherClients = clients.filter(c => c.accountId !== accountAId);
    
    if (otherClients.length === 0 && accountAClients.length === clients.length) {
      results.push({
        test: 'Account A isolation',
        status: 'PASS',
        details: `Account A sees only ${clients.length} own clients, 0 other accounts' clients`
      });
      log(`✅ PASS: Account A correctly sees only own data (${clients.length} clients)`);
    } else {
      results.push({
        test: 'Account A isolation',
        status: 'FAIL',
        details: `RLS FAILED: Account A sees ${otherClients.length} clients from other accounts!`
      });
      log(`❌ FAIL: Account A can see ${otherClients.length} clients from other accounts!`);
    }
  } catch (error) {
    results.push({
      test: 'Account A isolation',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    });
    log(`❌ FAIL: ${error}`);
  }
}

async function testWithAccountB(accountBId: string) {
  console.log('\n📋 Test 3: With Account B Context (Should see only Account B data)');
  
  try {
    // Use transaction to ensure SET LOCAL persists for the query
    const clients = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_account_id = '${accountBId}'`);
      return await tx.client.findMany();
    });
    
    const accountBClients = clients.filter(c => c.accountId === accountBId);
    const otherClients = clients.filter(c => c.accountId !== accountBId);
    
    if (otherClients.length === 0 && accountBClients.length === clients.length) {
      results.push({
        test: 'Account B isolation',
        status: 'PASS',
        details: `Account B sees only ${clients.length} own clients, 0 other accounts' clients`
      });
      log(`✅ PASS: Account B correctly sees only own data (${clients.length} clients)`);
    } else {
      results.push({
        test: 'Account B isolation',
        status: 'FAIL',
        details: `RLS FAILED: Account B sees ${otherClients.length} clients from other accounts!`
      });
      log(`❌ FAIL: Account B can see ${otherClients.length} clients from other accounts!`);
    }
  } catch (error) {
    results.push({
      test: 'Account B isolation',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    });
    log(`❌ FAIL: ${error}`);
  }
}

async function testCrossAccountAccess(accountAId: string, accountBId: string) {
  console.log('\n📋 Test 4: Cross-Account Data Verification');
  
  try {
    // Create test clients for both accounts (bypassing RLS temporarily)
    const clientA = await prisma.client.create({
      data: {
        accountId: accountAId,
        name: 'Test Client A',
        email: 'client-a@test.com',
        status: 'active',
      }
    });

    const clientB = await prisma.client.create({
      data: {
        accountId: accountBId,
        name: 'Test Client B',
        email: 'client-b@test.com',
        status: 'active',
      }
    });

    log(`  Created Client A: ${clientA.id}`);
    log(`  Created Client B: ${clientB.id}`);

    // Now test with RLS using a transaction to ensure SET LOCAL persists
    const result = await prisma.$transaction(async (tx) => {
      // Set RLS context for Account A
      await tx.$executeRawUnsafe(`SET LOCAL app.current_account_id = '${accountAId}'`);
      
      // Debug: Check what the function returns
      const debugResult = await tx.$queryRawUnsafe<Array<{current_user_account_id: string | null}>>(
        'SELECT current_user_account_id()'
      );
      console.log(`  DEBUG: current_user_account_id() = ${debugResult[0]?.current_user_account_id || 'NULL'}`);
      
      // Check RLS status on clients table
      const rlsStatus = await tx.$queryRawUnsafe<Array<{relrowsecurity: boolean}>>(
        "SELECT relrowsecurity FROM pg_class WHERE relname = 'clients'"
      );
      console.log(`  DEBUG: RLS enabled on clients = ${rlsStatus[0]?.relrowsecurity}`);
      
      // Account A should NOT be able to find Account B's client
      const foundClientB = await tx.client.findUnique({
        where: { id: clientB.id }
      });
      
      // Also try with raw query
      const rawQuery = await tx.$queryRawUnsafe<Array<any>>(
        `SELECT * FROM clients WHERE id = '${clientB.id}'`
      );
      console.log(`  DEBUG: Raw query found ${rawQuery.length} rows for Client B`);
      
      return foundClientB;
    });

    if (result === null) {
      results.push({
        test: 'Cross-account access prevention',
        status: 'PASS',
        details: 'Account A correctly cannot access Account B\'s client'
      });
      log(`✅ PASS: Account A cannot access Account B's client (RLS working correctly)`);
    } else {
      results.push({
        test: 'Cross-account access prevention',
        status: 'FAIL',
        details: 'SECURITY BREACH: Account A can access Account B\'s client!'
      });
      log(`❌ FAIL: SECURITY BREACH - Account A can access Account B's client!`);
    }

    // Cleanup
    await prisma.client.delete({ where: { id: clientA.id } });
    await prisma.client.delete({ where: { id: clientB.id } });

  } catch (error) {
    results.push({
      test: 'Cross-account access prevention',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    });
    log(`❌ FAIL: ${error}`);
  }
}

async function printSummary() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       Test Results Summary                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}\n`);

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.test}`);
    console.log(`   ${result.details}\n`);
  });

  if (failed === 0) {
    console.log('🎉 All tests passed! Multi-tenant isolation is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the RLS configuration.\n');
  }
}

async function main() {
  try {
    const { accountA, accountB } = await testSetup();
    
    await testWithoutRLS();
    await testWithAccountA(accountA.id);
    await testWithAccountB(accountB.id);
    await testCrossAccountAccess(accountA.id, accountB.id);
    
    await printSummary();

    const exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
    await prisma.$disconnect();
    await pool.end();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }
}

main();
