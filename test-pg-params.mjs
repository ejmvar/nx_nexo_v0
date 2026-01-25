import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nexo_crm',
  user: 'nexo_app',
  password: 'nexo_app_password'
});

async function test() {
  const client = await pool.connect();
  
  try {
    console.log('Starting transaction...');
    await client.query('BEGIN');
    
    console.log('Setting RLS context...');
    await client.query('SET LOCAL app.current_account_id = $1', ['ff19f345-c655-4893-b932-aaa20b363910']);
    
    console.log('Executing INSERT with parameters...');
    const sql = 'INSERT INTO clients (account_id, name, email, phone, company, address, status, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING id';
    const params = [
      'ff19f345-c655-4893-b932-aaa20b363910',
      'Test Client',
      'test@test.com',
      null,
      'Test Corp',
      null,
      'active'
    ];
    
    console.log('SQL:', sql);
    console.log('Params:', params);
    
    const result = await client.query(sql, params);
    console.log('Success! Inserted ID:', result.rows[0].id);
    
    await client.query('COMMIT');
    console.log('Transaction committed.');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Position:', error.position);
    await client.query('ROLLBACK').catch(() => {});
  } finally {
    client.release();
    await pool.end();
  }
}

test();
