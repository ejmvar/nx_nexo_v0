import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg from 'pg';

// Handle both ESM and CommonJS imports
const Pool = pg?.Pool || (pg as any)?.default?.Pool || pg;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: any;
  private readonly debugRLS: boolean;

  constructor(private configService: ConfigService) {
    // #TODO: ensure 'DEBUG_RLS' is documented as a config option
    this.debugRLS = this.configService.get('DEBUG_RLS') === 'true' || process.env.DEBUG_RLS === 'true';
    this.pool = new Pool({
      host: this.configService.get('DB_HOST') || this.configService.get('POSTGRES_HOST') || 'localhost',
      port: parseInt(this.configService.get('DB_PORT') || this.configService.get('POSTGRES_PORT') || '5432'),
      database: this.configService.get('DB_NAME') || this.configService.get('POSTGRES_DB') || 'nexo_crm',
      user: this.configService.get('DB_USER') || this.configService.get('POSTGRES_USER') || 'nexo_app',
      password: this.configService.get('DB_PASSWORD') || this.configService.get('POSTGRES_PASSWORD') || 'nexo_app_password',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ CRM Database connected successfully');
    } catch (error) {
      console.error('❌ CRM Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('CRM Database connection closed');
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query error:', { text: text.substring(0, 50), error });
      throw error;
    }
  }

  /**
   * Execute a query with RLS context set for multi-tenancy
   * @param accountId - The account ID to set in the session
   * @param text - SQL query text
   * @param params - Query parameters
   */
  async queryWithAccount(accountId: string, text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      if (this.debugRLS) {
        // DEBUG: Check database user
        const userCheck = await client.query('SELECT current_user, session_user');
        console.log('🔍 [RLS DEBUG] Database User:', {
          current_user: userCheck.rows[0].current_user,
          session_user: userCheck.rows[0].session_user
        });
      }

      await client.query('BEGIN');
      
      if (this.debugRLS) {
        // DEBUG: Log account ID being set
        console.log('🔍 [RLS DEBUG] Setting account context:', { accountId });
      }
      
      // Using literal string interpolation instead of parameter binding for SET LOCAL
      // This avoids interference with subsequent parameterized queries
      await client.query(`SET LOCAL app.current_account_id = '${accountId}'`);
      
      if (this.debugRLS) {
        // DEBUG: Verify session variable was set
        const varCheck = await client.query(`SELECT current_setting('app.current_account_id', true) as account_id`);
        console.log('🔍 [RLS DEBUG] Session variable value:', varCheck.rows[0]);
        
        // DEBUG: Log query being executed
        console.log('🔍 [RLS DEBUG] Executing query:', {
          query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          paramCount: params?.length || 0
        });
      }
      
      const result = await client.query(text, params);
      
      if (this.debugRLS) {
        // DEBUG: Log result
        console.log('🔍 [RLS DEBUG] Query result:', {
          rowCount: result.rowCount,
          rows: result.rows.length
        });
      }
      
      await client.query('COMMIT');
      
      return result;
    } catch (error) {
      if (this.debugRLS) {
        console.error('🔍 [RLS DEBUG] Query error:', error);
      }
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  getClient() {
    return this.pool.connect();
  }
}
