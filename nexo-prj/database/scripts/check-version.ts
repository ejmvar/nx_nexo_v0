#!/usr/bin/env tsx
/**
 * Database Version Checker
 * Displays current versions of database, software, and dependencies
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface VersionInfo {
  component: string;
  version: string;
  status: 'ok' | 'warning' | 'error';
  details?: string;
}

async function getPostgresVersion(): Promise<string> {
  const result = await prisma.$queryRaw<[{ version: string }]>`SELECT version()`;
  const versionMatch = result[0].version.match(/PostgreSQL ([\d.]+)/);
  return versionMatch ? versionMatch[1] : 'unknown';
}

async function getDatabaseSchemaVersion(): Promise<{
  version: string;
  appliedAt: Date;
  migrationsCount: number;
}> {
  try {
    // Check if migration_history table exists
    const tableExists = await prisma.$queryRaw<[{ exists: boolean }]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'migration_history'
      ) as exists
    `;

    if (!tableExists[0].exists) {
      return {
        version: '0.0.0',
        appliedAt: new Date(),
        migrationsCount: 0,
      };
    }

    const latestMigration = await prisma.$queryRaw<
      [
        {
          version: string;
          applied_at: Date;
        }
      ]
    >`
      SELECT version, applied_at 
      FROM migration_history 
      WHERE success = true 
      ORDER BY applied_at DESC 
      LIMIT 1
    `;

    const migrationsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM migration_history WHERE success = true
    `;

    if (latestMigration.length === 0) {
      return {
        version: '0.0.0',
        appliedAt: new Date(),
        migrationsCount: 0,
      };
    }

    return {
      version: latestMigration[0].version,
      appliedAt: latestMigration[0].applied_at,
      migrationsCount: Number(migrationsCount[0].count),
    };
  } catch (error) {
    console.error('Error checking database version:', error);
    return {
      version: 'unknown',
      appliedAt: new Date(),
      migrationsCount: 0,
    };
  }
}

async function getPrismaVersion(): Promise<string> {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    return packageJson.dependencies['@prisma/client'] || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getNodeVersion(): string {
  return process.version.substring(1); // Remove 'v' prefix
}

async function checkRLSEnabled(): Promise<{
  enabled: boolean;
  tables: string[];
}> {
  try {
    const result = await prisma.$queryRaw<
      Array<{ tablename: string; rowsecurity: boolean }>
    >`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('accounts', 'roles', 'users', 'clients', 'suppliers', 'employees', 'professionals')
    `;

    const tablesWithRLS = result
      .filter((t) => t.rowsecurity)
      .map((t) => t.tablename);

    return {
      enabled: tablesWithRLS.length > 0,
      tables: tablesWithRLS,
    };
  } catch {
    return { enabled: false, tables: [] };
  }
}

async function checkRLSPolicies(): Promise<number> {
  try {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
    `;
    return Number(result[0].count);
  } catch {
    return 0;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       NEXO CRM - Database Version Information             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const versions: VersionInfo[] = [];

  try {
    // Get all version information
    const [
      dbSchema,
      postgresVersion,
      prismaVersion,
      nodeVersion,
      rlsInfo,
      policiesCount,
    ] = await Promise.all([
      getDatabaseSchemaVersion(),
      getPostgresVersion(),
      getPrismaVersion(),
      Promise.resolve(getNodeVersion()),
      checkRLSEnabled(),
      checkRLSPolicies(),
    ]);

    // Database Schema Version
    versions.push({
      component: 'Database Schema',
      version: dbSchema.version,
      status: dbSchema.version !== '0.0.0' && dbSchema.version !== 'unknown' ? 'ok' : 'warning',
      details: `${dbSchema.migrationsCount} migrations applied (last: ${dbSchema.appliedAt.toISOString()})`,
    });

    // PostgreSQL Version
    versions.push({
      component: 'PostgreSQL',
      version: postgresVersion,
      status: postgresVersion.startsWith('16') ? 'ok' : 'warning',
      details: postgresVersion.startsWith('16') ? 'Recommended version' : 'Consider upgrading to v16',
    });

    // Prisma Version
    versions.push({
      component: 'Prisma Client',
      version: prismaVersion.replace('^', ''),
      status: 'ok',
    });

    // Node.js Version
    versions.push({
      component: 'Node.js',
      version: nodeVersion,
      status: nodeVersion.startsWith('22') || nodeVersion.startsWith('20') ? 'ok' : 'warning',
      details: nodeVersion.startsWith('22') || nodeVersion.startsWith('20') ? 'Supported version' : 'Consider upgrading to v20+',
    });

    // RLS Status
    versions.push({
      component: 'Row Level Security',
      version: rlsInfo.enabled ? 'Enabled' : 'Disabled',
      status: rlsInfo.enabled ? 'ok' : 'error',
      details: rlsInfo.enabled
        ? `Active on ${rlsInfo.tables.length} tables`
        : 'RLS is required for multi-tenant security!',
    });

    // RLS Policies
    versions.push({
      component: 'RLS Policies',
      version: policiesCount.toString(),
      status: policiesCount >= 7 ? 'ok' : 'warning',
      details: `${policiesCount} policies defined (expected: 7+)`,
    });

    // Print table
    console.log('┌────────────────────────┬──────────────┬────────┬───────────────────────────────┐');
    console.log('│ Component              │ Version      │ Status │ Details                       │');
    console.log('├────────────────────────┼──────────────┼────────┼───────────────────────────────┤');

    versions.forEach((v) => {
      const statusIcon = v.status === 'ok' ? '✅' : v.status === 'warning' ? '⚠️ ' : '❌';
      const component = v.component.padEnd(22);
      const version = v.version.padEnd(12);
      const details = (v.details || '').substring(0, 29).padEnd(29);

      console.log(`│ ${component} │ ${version} │ ${statusIcon} │ ${details} │`);
    });

    console.log('└────────────────────────┴──────────────┴────────┴───────────────────────────────┘\n');

    // Summary
    const errors = versions.filter((v) => v.status === 'error').length;
    const warnings = versions.filter((v) => v.status === 'warning').length;

    if (errors > 0) {
      console.log(`❌ ${errors} critical issue(s) found. Please address before proceeding.`);
    } else if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) found. Review recommended.`);
    } else {
      console.log('✅ All version checks passed!');
    }

    console.log('');

  } catch (error) {
    console.error('Error checking versions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
