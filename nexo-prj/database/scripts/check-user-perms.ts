#!/usr/bin/env tsx
import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: "postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm?schema=public"
});

async function main() {
  const client = await pool.connect();
  try {
    // Check user attributes
    const userInfo = await client.query(`
      SELECT 
        rolname,
        rolsuper,
        rolinherit,
        rolcreaterole,
        rolcreatedb,
        rolcanlogin,
        rolreplication,
        rolconnlimit,
        rolbypassrls
      FROM pg_roles 
      WHERE rolname = 'nexo_user'
    `);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       User Permissions Check                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    if (userInfo.rows.length === 0) {
      console.log('❌ User nexo_user not found!\n');
    } else {
      const user = userInfo.rows[0];
      console.log(`User: ${user.rolname}`);
      console.log(`  Superuser: ${user.rolsuper ? '✅ YES' : '❌ NO'}`);
      console.log(`  Inherit: ${user.rolinherit}`);
      console.log(`  Can create roles: ${user.rolcreaterole}`);
      console.log(`  Can create databases: ${user.rolcreatedb}`);
      console.log(`  Can login: ${user.rolcanlogin}`);
      console.log(`  Replication: ${user.rolreplication}`);
      console.log(`  Connection limit: ${user.rolconnlimit}`);
      console.log(`  **BYPASS RLS: ${user.rolbypassrls ? '⚠️  YES (THIS IS THE PROBLEM!)' : '✅ NO'}**\n`);
      
      if (user.rolsuper || user.rolbypassrls) {
        console.log('🔴 CRITICAL ISSUE FOUND:');
        if (user.rolsuper) {
          console.log('   - User is a SUPERUSER');
        }
        if (user.rolbypassrls) {
          console.log('   - User has BYPASSRLS attribute');
        }
        console.log('\n💡 SOLUTION:');
        console.log('   ALTER ROLE nexo_user NOSUPERUSER NOBYPASSRLS;');
        console.log('   This will make RLS policies apply to this user.\n');
      } else {
        console.log('✅ User permissions look correct for RLS.\n');
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main();
