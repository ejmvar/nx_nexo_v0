#!/usr/bin/env tsx
/**
 * Check RLS Configuration
 * Verifies RLS setup and identifies potential issues
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       RLS Configuration Check                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check current user
  const currentUser = await prisma.$queryRawUnsafe<Array<{current_user: string}>>(
    'SELECT current_user'
  );
  console.log(`Current database user: ${currentUser[0]?.current_user}`);

  // Check table ownership
  const tableOwner = await prisma.$queryRawUnsafe<Array<{tableowner: string}>>(
    "SELECT tableowner FROM pg_tables WHERE tablename = 'clients' AND schemaname = 'public'"
  );
  console.log(`Clients table owner: ${tableOwner[0]?.tableowner}`);

  // Check if current user is superuser
  const isSuperuser = await prisma.$queryRawUnsafe<Array<{rolsuper: boolean}>>(
    `SELECT rolsuper FROM pg_roles WHERE rolname = '${currentUser[0]?.current_user}'`
  );
  console.log(`Is superuser: ${isSuperuser[0]?.rolsuper}`);

  // Check RLS configuration
  const rlsConfig = await prisma.$queryRawUnsafe<Array<{
    relname: string;
    relrowsecurity: boolean;
    relforcerowsecurity: boolean;
  }>>(
    "SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'clients'"
  );
  console.log(`\nRLS on clients table:`);
  console.log(`  - Row security enabled: ${rlsConfig[0]?.relrowsecurity}`);
  console.log(`  - Force row security: ${rlsConfig[0]?.relforcerowsecurity}`);

  // Check policies
  const policies = await prisma.$queryRawUnsafe<Array<{
    policyname: string;
    permissive: string;
    roles: string[];
    cmd: string;
    qual: string;
  }>>(
    `SELECT 
      policyname, 
      permissive,
      ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(polroles)) as roles,
      cmd,
      pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy 
    WHERE polrelid = 'public.clients'::regclass`
  );
  
  console.log(`\nPolicies on clients table:`);
  policies.forEach(policy => {
    console.log(`  - ${policy.policyname}`);
    console.log(`    Permissive: ${policy.permissive}`);
    console.log(`    Roles: ${policy.roles.join(', ') || 'ALL'}`);
    console.log(`    Command: ${policy.cmd}`);
    console.log(`    Condition: ${policy.qual || 'None'}`);
  });

  console.log(`\n⚠️  IMPORTANT: RLS policies do NOT apply to:`);
  console.log(`   - Table owners`);
  console.log(`   - Superusers`);
  console.log(`   - Users with BYPASSRLS attribute`);
  console.log(`\n💡 Solution: Use "ALTER TABLE ... FORCE ROW LEVEL SECURITY;"`);
  console.log(`   This forces RLS even for table owners.\n`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
