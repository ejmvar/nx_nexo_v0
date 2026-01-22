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
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      database: this.configService.get('DB_NAME', 'nexo_crm'),
      user: this.configService.get('DB_USER', 'nexo_admin'),
      password: this.configService.get('DB_PASSWORD', 'nexo_dev_password_2026'),
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

  getClient() {
    return this.pool.connect();
  }
}
