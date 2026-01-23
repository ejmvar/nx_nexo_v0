# Database Migration Strategy

## Overview

This project uses a **hybrid migration approach** combining:
- **Prisma** for TypeScript-based schema management and type safety
- **SQL-based migrations** for complex operations (RLS, triggers, extensions)
- **Version tracking** for database schema versioning
- **Multi-step migration** support for safe production deployments

## Migration Types

### 1. Prisma Migrations (Schema Changes)
For standard schema changes like adding tables, columns, or relations:
```bash
# Create a new migration
pnpm prisma migrate dev --name add_projects_table

# Apply migrations to production
pnpm prisma migrate deploy
```

### 2. SQL Migrations (Advanced Features)
For PostgreSQL-specific features (RLS, triggers, extensions):
- Located in: `database/migrations/sql/`
- Naming: `YYYYMMDD_HHMM_descriptive_name.sql`
- Applied via: Custom migration runner

### 3. Data Migrations
For data transformations or seeding:
- Located in: `database/migrations/data/`
- Can be TypeScript scripts using Prisma Client

## Version Tracking

### Database Structure Version
Current: **v1.0.0** (Initial Multi-Tenant Setup)

Track version in:
1. `migration_history` table (automated)
2. `DATABASE_VERSION.md` file (manual documentation)
3. Git tags for releases

### Software Version Compatibility Matrix

| Database Version | Backend Version | Frontend Version | Compatible |
|-----------------|----------------|------------------|------------|
| 1.0.0           | 1.0.x          | 1.0.x            | ✅         |
| 1.1.0           | 1.1.x          | 1.0.x-1.1.x      | ✅         |

## Multi-Step Migration Process

### For Production Deployments

1. **Pre-Migration Check**
   ```bash
   pnpm run db:check-version
   pnpm run db:validate
   ```

2. **Backup Database**
   ```bash
   pnpm run db:backup
   ```

3. **Run Migrations (Sequential)**
   ```bash
   # Step 1: Schema changes (additive only)
   pnpm prisma migrate deploy
   
   # Step 2: Apply SQL migrations
   pnpm run db:migrate:sql
   
   # Step 3: Data migrations
   pnpm run db:migrate:data
   
   # Step 4: Verify
   pnpm run db:verify
   ```

4. **Rollback Plan** (if needed)
   ```bash
   pnpm run db:rollback --to-version 1.0.0
   ```

## Migration Scripts

All scripts located in `database/scripts/`:

- `migrate.ts` - Main migration runner
- `rollback.ts` - Rollback migrations
- `verify.ts` - Verify database state
- `version.ts` - Check/update versions
- `backup.ts` - Create backups

## Best Practices

### Writing Migrations

1. **Always additive in production** (add, never remove)
2. **Use transactions** for atomic operations
3. **Include rollback script** for each migration
4. **Test on copy of production data**
5. **Document breaking changes**

### Example Migration Structure

```typescript
// migrations/20260123_1200_add_projects.ts
export const migration = {
  version: '1.1.0',
  name: 'Add Projects Module',
  description: 'Adds projects table with account isolation',
  
  up: async (prisma: PrismaClient) => {
    // Apply changes
  },
  
  down: async (prisma: PrismaClient) => {
    // Rollback changes
  },
  
  validate: async (prisma: PrismaClient) => {
    // Verify migration success
  }
};
```

## Checking Versions

### Current Database Version
```bash
pnpm run db:version
```

### Software Versions
```bash
pnpm run version:check
```

This will show:
- Database schema version
- Prisma version
- Node.js version
- PostgreSQL version
- Applied migrations count

## Migration History

View all applied migrations:
```sql
SELECT * FROM migration_history ORDER BY applied_at DESC;
```

## Emergency Procedures

### If Migration Fails

1. **Don't panic** - Database should be in transaction (no partial state)
2. **Check logs** - `database/logs/migration_YYYYMMDD_HHMM.log`
3. **Verify state** - `pnpm run db:verify`
4. **Rollback if needed** - `pnpm run db:rollback --to-version X.Y.Z`
5. **Restore from backup** - Last resort

### If Database Version Mismatch

```bash
# Check what's wrong
pnpm run db:version:diff

# Force version update (use carefully)
pnpm run db:version:set --version 1.0.0
```

## Development Workflow

1. Make schema changes in `schema.prisma`
2. Generate migration: `pnpm prisma migrate dev`
3. For SQL features, create SQL migration file
4. Update `DATABASE_VERSION.md`
5. Test locally
6. Commit all migration files
7. Deploy to staging
8. Verify on staging
9. Deploy to production

## Tools Integration

### With TanStack Query
```typescript
// Invalidate queries after migration
queryClient.invalidateQueries({ queryKey: ['schema-version'] });
```

### With Prisma Studio
```bash
pnpm prisma studio
# Opens GUI at http://localhost:5555
```

## References

- [Prisma Migrations Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Versioning](https://www.postgresql.org/docs/current/sql-createextension.html)
- Project specific: See `ARCHITECTURE.md` for schema design decisions
