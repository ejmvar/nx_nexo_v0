#!/usr/bin/env tsx
/**
 * Database Restore Tool
 * Restores database from backup with safety checks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import * as readline from 'readline';

const execAsync = promisify(exec);

interface BackupMetadata {
  timestamp: string;
  database: string;
  version: string;
  size: number;
  checksum: string;
  tables: string[];
  migrations: number;
}

function getBackupDir(): string {
  return join(process.cwd(), 'database', 'backups');
}

function calculateChecksum(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function findBackup(nameOrPattern: string): Promise<string | null> {
  const backupDir = getBackupDir();
  
  if (!existsSync(backupDir)) {
    return null;
  }

  // Try exact match first
  const exactPath = join(backupDir, nameOrPattern);
  if (existsSync(exactPath)) {
    return exactPath;
  }

  // Try with .sql extension
  const sqlPath = nameOrPattern.endsWith('.sql') ? exactPath : `${exactPath}.sql`;
  if (existsSync(sqlPath)) {
    return sqlPath;
  }

  // Try pattern match
  const files = readdirSync(backupDir).filter(f => f.endsWith('.sql'));
  const matches = files.filter(f => f.includes(nameOrPattern));

  if (matches.length === 1) {
    return join(backupDir, matches[0]);
  }

  if (matches.length > 1) {
    console.log('\n⚠️  Multiple backups match your pattern:');
    matches.forEach((m, i) => console.log(`   ${i + 1}. ${m}`));
    console.log('\nPlease be more specific.\n');
    return null;
  }

  return null;
}

async function verifyBackup(backupPath: string): Promise<BackupMetadata | null> {
  const metadataPath = backupPath.replace('.sql', '.json');

  if (!existsSync(metadataPath)) {
    console.log('⚠️  No metadata file found. Backup may be incomplete.');
    return null;
  }

  try {
    const metadata: BackupMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    const backupData = readFileSync(backupPath);
    const actualChecksum = calculateChecksum(backupData);

    if (actualChecksum !== metadata.checksum) {
      console.log('❌ Checksum mismatch! Backup file may be corrupted.');
      console.log(`   Expected: ${metadata.checksum.substring(0, 16)}...`);
      console.log(`   Actual:   ${actualChecksum.substring(0, 16)}...`);
      return null;
    }

    return metadata;
  } catch (error) {
    console.error('Error reading metadata:', error);
    return null;
  }
}

async function restoreBackup(backupPath: string, force: boolean = false): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       NEXO CRM - Database Restore Tool                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Verify backup
  console.log('🔍 Verifying backup file...');
  const metadata = await verifyBackup(backupPath);
  
  if (metadata) {
    console.log('   ✅ Checksum valid');
    console.log(`   📊 Database: ${metadata.database}`);
    console.log(`   📅 Created: ${metadata.timestamp}`);
    console.log(`   📋 Tables: ${metadata.tables.length}`);
    console.log(`   🔄 Migrations: ${metadata.migrations}\n`);
  } else {
    console.log('   ⚠️  Backup verification failed\n');
    if (!force) {
      console.log('Use --force to restore anyway (not recommended)\n');
      process.exit(1);
    }
  }

  // Warning
  console.log('⚠️  WARNING: This will completely replace your current database!\n');
  console.log('   • All current data will be LOST');
  console.log('   • This action cannot be undone');
  console.log('   • Make sure you have a recent backup of current data\n');

  // Confirmation
  if (!force) {
    const confirmed = await askConfirmation('Type "yes" to continue with restore: ');
    if (!confirmed) {
      console.log('\n❌ Restore cancelled\n');
      process.exit(0);
    }
  }

  console.log('\n🚀 Starting restore process...\n');

  try {
    // Drop existing connections
    console.log('🔌 Closing existing database connections...');
    await execAsync(
      `psql "${process.env.DATABASE_URL}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()"`
    ).catch(() => {
      console.log('   (Some connections could not be closed - this is normal)');
    });

    // Restore backup
    console.log('📥 Restoring from backup...');
    const startTime = Date.now();

    await execAsync(
      `psql "${process.env.DATABASE_URL}" < "${backupPath}"`,
      { maxBuffer: 50 * 1024 * 1024 } // 50MB buffer
    );

    const duration = Date.now() - startTime;
    console.log(`   ✅ Restore completed in ${duration}ms\n`);

    // Verify restore
    console.log('🔍 Verifying restored database...');
    const { stdout } = await execAsync(
      `psql "${process.env.DATABASE_URL}" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'"`
    );
    const tableCount = parseInt(stdout.trim());
    console.log(`   ✅ Found ${tableCount} tables\n`);

    // Success
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                   Restore Complete!                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('✅ Database has been restored successfully\n');
    console.log('Next steps:');
    console.log('  1. Verify data: pnpm db:version');
    console.log('  2. Generate Prisma Client: pnpm db:generate');
    console.log('  3. Test your application\n');

  } catch (error) {
    console.error('\n❌ Restore failed:', error);
    console.log('\nThe database may be in an inconsistent state.');
    console.log('You may need to restore from another backup or rebuild.\n');
    process.exit(1);
  }
}

async function listBackups(): Promise<void> {
  const backupDir = getBackupDir();
  
  if (!existsSync(backupDir)) {
    console.log('\n📭 No backups directory found\n');
    return;
  }

  const files = readdirSync(backupDir).filter(f => f.endsWith('.sql'));
  
  if (files.length === 0) {
    console.log('\n📭 No backups found\n');
    return;
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       Available Backups                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  files.forEach((file, i) => {
    console.log(`${i + 1}. ${file}`);
  });
  console.log('');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    console.log('\nUsage:');
    console.log('  pnpm db:restore <backup-name>        # Restore from backup');
    console.log('  pnpm db:restore list                 # List available backups');
    console.log('  pnpm db:restore latest               # Restore most recent backup');
    console.log('  pnpm db:restore <backup> --force     # Skip confirmations\n');
    console.log('Examples:');
    console.log('  pnpm db:restore backup_2026-01-23_120000.sql');
    console.log('  pnpm db:restore 2026-01-23           # Partial match');
    console.log('  pnpm db:restore latest --force\n');
    return;
  }

  const command = args[0];
  const force = args.includes('--force') || args.includes('-f');

  if (command === 'list' || command === '--list' || command === '-l') {
    await listBackups();
    return;
  }

  let backupPath: string | null = null;

  if (command === 'latest') {
    // Find most recent backup
    const backupDir = getBackupDir();
    if (!existsSync(backupDir)) {
      console.log('\n❌ No backups found\n');
      process.exit(1);
    }

    const files = readdirSync(backupDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('\n❌ No backups found\n');
      process.exit(1);
    }

    backupPath = join(backupDir, files[0]);
    console.log(`\nUsing latest backup: ${files[0]}\n`);
  } else {
    backupPath = await findBackup(command);
  }

  if (!backupPath) {
    console.log(`\n❌ Backup not found: ${command}\n`);
    console.log('List available backups: pnpm db:restore list\n');
    process.exit(1);
  }

  await restoreBackup(backupPath, force);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
