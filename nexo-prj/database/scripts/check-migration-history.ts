#!/usr/bin/env tsx
import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: "postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm?schema=public"
});

async function main() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM migration_history ORDER BY applied_at');
    console.log(`\nMigration History (${result.rows.length} rows):\n`);
    result.rows.forEach(row => {
      console.log(`${row.version} - ${row.name}`);
      console.log(`  Applied: ${row.applied_at}`);
      console.log(`  Checksum: ${row.checksum.substring(0, 16)}...`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

main();
