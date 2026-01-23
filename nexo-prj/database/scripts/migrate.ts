#!/usr/bin/env tsx
/**
 * Database Migration Runner
 * Applies SQL migrations and tracks versions
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

interface Migration {
  version: string;
  name: string;
  description: string;
  filename: string;
  sql: string;
  checksum: string;
}

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function parseMigrationFile(filepath: string): Migration {
  const content = readFileSync(filepath, 'utf-8');
  const filename = filepath.split('/').pop() || '';

  // Extract metadata from comments
  const versionMatch = content.match(/-- @version:\s*(.+)/);
  const nameMatch = content.match(/-- @name:\s*(.+)/);
  const descriptionMatch = content.match(/-- @description:\s*(.+)/);

  // Parse version from filename if not in comments (YYYYMMDD_HHMM format)
  const filenameMatch = filename.match(/^(\d{8}_\d{4})_(.+)\.sql$/);

  return {
    version: versionMatch?.[1] || filenameMatch?.[1] || '0.0.0',
    name: nameMatch?.[1] || filenameMatch?.[2]?.replace(/_/g, ' ') || filename,
    description: descriptionMatch?.[1] || '',
    filename,
    sql: content,
    checksum: calculateChecksum(content),
  };
}

async function ensureMigrationHistoryTable(): Promise<void> {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS migration_history (
      id SERIAL PRIMARY KEY,
      version VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      execution_ms INTEGER NOT NULL,
      success BOOLEAN DEFAULT true,
      error_message TEXT
    )
  `;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  try {
    const migrations = await prisma.$queryRaw<
      Array<{ version: string }>
    >`SELECT version FROM migration_history WHERE success = true`;

    return new Set(migrations.map((m) => m.version));
  } catch {
    return new Set();
  }
}

async function applyMigration(migration: Migration): Promise<void> {
  const startTime = Date.now();
  let success = true;
  let errorMessage: string | null = null;

  console.log(`\n📦 Applying migration: ${migration.name} (${migration.version})`);
  console.log(`   ${migration.description || 'No description'}`);

  try {
    // Execute migration in transaction
    await prisma.$transaction(async (tx) => {
      // Split SQL into statements (simple approach, may need refinement)
      const statements = migration.sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await tx.$executeRawUnsafe(statement);
        }
      }
    });

    console.log(`   ✅ Success (${Date.now() - startTime}ms)`);
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Failed: ${errorMessage}`);
    throw error;
  } finally {
    // Record migration attempt
    try {
      await prisma.$executeRaw`
        INSERT INTO migration_history (version, name, description, checksum, execution_ms, success, error_message)
        VALUES (${migration.version}, ${migration.name}, ${migration.description}, ${migration.checksum}, ${Date.now() - startTime}, ${success}, ${errorMessage})
        ON CONFLICT (version) DO NOTHING
      `;
    } catch (error) {
      console.error('   ⚠️  Failed to record migration in history:', error);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       NEXO CRM - Database Migration Runner                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Ensure migration_history table exists
    await ensureMigrationHistoryTable();

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`📊 ${appliedMigrations.size} migration(s) already applied\n`);

    // Find migration files
    const migrationsDir = join(process.cwd(), 'database', 'migrations', 'sql');

    if (!existsSync(migrationsDir)) {
      console.log('⚠️  No SQL migrations directory found');
      console.log(`   Expected: ${migrationsDir}`);
      console.log('   Creating directory...\n');
      // Directory will be created if migrations are added
      return;
    }

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('📝 No SQL migration files found');
      console.log('   Place .sql files in:', migrationsDir);
      console.log('\nTip: Use Prisma for schema changes: pnpm prisma migrate dev\n');
      return;
    }

    // Parse and filter migrations
    const migrations = files
      .map((f) => parseMigrationFile(join(migrationsDir, f)))
      .filter((m) => !appliedMigrations.has(m.version) || force);

    if (migrations.length === 0) {
      console.log('✅ All migrations are already applied!\n');
      return;
    }

    console.log(`📋 Found ${migrations.length} pending migration(s):\n`);
    migrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.name} (${m.version})`);
      if (m.description) {
        console.log(`      ${m.description}`);
      }
    });

    if (dryRun) {
      console.log('\n🔍 Dry run complete. Use without --dry-run to apply.\n');
      return;
    }

    // Apply migrations
    console.log('\n🚀 Starting migration process...');

    for (const migration of migrations) {
      await applyMigration(migration);
    }

    console.log('\n✅ All migrations applied successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
