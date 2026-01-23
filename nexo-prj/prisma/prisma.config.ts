import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm?schema=public',
    },
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
  migrate: {
    datasource: {
      url: process.env.DATABASE_URL || 'postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm?schema=public',
    },
  },
});
