import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: pg.Pool;
  
  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const adapter = new PrismaPg(pool);
    
    super({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    console.log('👋 Prisma disconnected');
  }

  /**
   * Set RLS context for the current database session
   * This must be called at the start of each request to enforce multi-tenant isolation
   */
  async setRLSContext(accountId: string): Promise<void> {
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_account_id = '${accountId}'`
    );
  }

  /**
   * Execute a database operation with RLS context
   * Automatically sets the account context and executes within a transaction
   */
  async withRLS<T>(accountId: string, operation: (prisma: any) => Promise<T>): Promise<T> {
    return await this.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_account_id = '${accountId}'`);
      return await operation(tx);
    });
  }
}
