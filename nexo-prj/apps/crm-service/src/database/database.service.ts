import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg from 'pg';

// Handle both ESM and CommonJS imports
const Pool = pg?.Pool || (pg as any)?.default?.Pool || pg;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: any;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get('DB_HOST', this.configService.get('POSTGRES_HOST', 'localhost')),
      port: this.configService.get('DB_PORT', this.configService.get('POSTGRES_PORT', 5432)),
      database: this.configService.get('DB_NAME', this.configService.get('POSTGRES_DB', 'nexo')),
      user: this.configService.get('DB_USER', this.configService.get('POSTGRES_USER', 'nexo_user')),
      password: this.configService.get('DB_PASSWORD', this.configService.get('POSTGRES_PASSWORD', 'nexo_password')),
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
      // Set the account context for RLS
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);
      
      // Execute the actual query
      const result = await client.query(text, params);
      
      return result;
    } finally {
      // Reset the context and release client
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  getClient() {
    return this.pool.connect();
  }
}
