#!/usr/bin/env tsx
/**
 * Database Backup Tool
 * Creates timestamped backups before migrations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

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
  const backupDir = join(process.cwd(), 'database', 'backups');
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '');
}

function calculateChecksum(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function getDatabaseInfo(): Promise<{ database: string; version: string; tables: string[]; migrations: number }> {
  const dbUrl = process.env.DATABASE_URL || '';
  const dbMatch = dbUrl.match(/\/([^?]+)(\?|$)/);
  const database = dbMatch ? dbMatch[1] : 'nexo_crm';

  try {
    // Get PostgreSQL version
    const { stdout: versionOut } = await execAsync(
      `psql "${process.env.DATABASE_URL}" -t -c "SELECT version()"`
    );
    const versionMatch = versionOut.match(/PostgreSQL ([\d.]+)/);
    const version = versionMatch ? versionMatch[1] : 'unknown';

    // Get table list
    const { stdout: tablesOut } = await execAsync(
      `psql "${process.env.DATABASE_URL}" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"`
    );
    const tables = tablesOut.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    // Get migration count
    const { stdout: migrationsOut } = await execAsync(
      `psql "${process.env.DATABASE_URL}" -t -c "SELECT COUNT(*) FROM migration_history WHERE success = true" 2>/dev/null || echo "0"`
    );
    const migrations = parseInt(migrationsOut.trim()) || 0;

    return { database, version, tables, migrations };
  } catch (error) {
    console.warn('Could not fetch all database info:', error);
    return { database, version: 'unknown', tables: [], migrations: 0 };
  }
}

async function createBackup(description?: string): Promise<string> {
  const timestamp = getTimestamp();
  const backupDir = getBackupDir();
  const backupName = description 
    ? `backup_${timestamp}_${description}.sql`
    : `backup_${timestamp}.sql`;
  const backupPath = join(backupDir, backupName);
  const metadataPath = backupPath.replace('.sql', '.json');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       NEXO CRM - Database Backup Tool                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📦 Creating database backup...\n');

  try {
    // Get database info
    console.log('📊 Gathering database information...');
    const dbInfo = await getDatabaseInfo();
    console.log(`   Database: ${dbInfo.database}`);
    console.log(`   PostgreSQL: ${dbInfo.version}`);
    console.log(`   Tables: ${dbInfo.tables.length}`);
    console.log(`   Migrations: ${dbInfo.migrations}\n`);

    // Create backup using pg_dump
    console.log('💾 Running pg_dump...');
    const startTime = Date.now();
    
    await execAsync(
      `pg_dump "${process.env.DATABASE_URL}" --clean --if-exists --no-owner --no-acl > "${backupPath}"`,
      { maxBuffer: 50 * 1024 * 1024 } // 50MB buffer
    );

    const duration = Date.now() - startTime;
    console.log(`   ✅ Backup created in ${duration}ms\n`);

    // Calculate checksum
    console.log('🔐 Calculating checksum...');
    const backupData = readFileSync(backupPath);
    const checksum = calculateChecksum(backupData);
    const sizeKB = Math.round(backupData.length / 1024);
    console.log(`   Checksum: ${checksum.substring(0, 16)}...`);
    console.log(`   Size: ${sizeKB} KB\n`);

    // Save metadata
    const metadata: BackupMetadata = {
      timestamp: new Date().toISOString(),
      database: dbInfo.database,
      version: dbInfo.version,
      size: backupData.length,
      checksum,
      tables: dbInfo.tables,
      migrations: dbInfo.migrations,
    };

    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('📝 Metadata saved\n');

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                   Backup Complete!                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📁 Backup file: ${backupName}`);
    console.log(`📁 Metadata:    ${backupName.replace('.sql', '.json')}`);
    console.log(`📂 Location:    ${backupDir}\n`);

    return backupPath;
  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    throw error;
  }
}

async function listBackups(): Promise<void> {
  const backupDir = getBackupDir();
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       NEXO CRM - Available Backups                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    const { stdout } = await execAsync(`ls -lh "${backupDir}"/*.sql 2>/dev/null || echo ""`);
    
    if (!stdout.trim()) {
      console.log('📭 No backups found\n');
      console.log(`Create your first backup: pnpm db:backup\n`);
      return;
    }

    // Parse and display backups
    const lines = stdout.trim().split('\n');
    console.log('┌────────────────────────────────────────┬──────────┬─────────────────────┐');
    console.log('│ Backup Name                            │ Size     │ Date                │');
    console.log('├────────────────────────────────────────┼──────────┼─────────────────────┤');

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 9) {
        const size = parts[4];
        const date = `${parts[5]} ${parts[6]} ${parts[7]}`;
        const fullPath = parts[8];
        const name = fullPath.split('/').pop() || '';
        
        if (name.endsWith('.sql')) {
          const displayName = name.substring(0, 38).padEnd(38);
          const displaySize = size.padEnd(8);
          const displayDate = date.substring(0, 19).padEnd(19);
          console.log(`│ ${displayName} │ ${displaySize} │ ${displayDate} │`);
        }
      }
    }

    console.log('└────────────────────────────────────────┴──────────┴─────────────────────┘\n');
    console.log(`📂 Location: ${backupDir}\n`);
    console.log('To restore a backup: pnpm db:restore <backup-name>\n');
  } catch (error) {
    console.error('Error listing backups:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const description = args[1];

  if (command === 'list' || command === '--list' || command === '-l') {
    await listBackups();
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log('\nUsage:');
    console.log('  pnpm db:backup                    # Create backup');
    console.log('  pnpm db:backup pre-migration      # Create backup with description');
    console.log('  pnpm db:backup list               # List all backups');
    console.log('  pnpm db:backup help               # Show this help\n');
    return;
  }

  await createBackup(description);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
