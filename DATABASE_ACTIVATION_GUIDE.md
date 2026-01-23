# Database Migration Setup - Complete Guide

## ✅ What Has Been Implemented

### 1. Migration Infrastructure
- ✅ **Prisma ORM** installed (v7.3.0) for TypeScript-based schema management
- ✅ **Prisma Schema** defined with multi-tenant architecture
- ✅ **Version Tracking System** with `migration_history` table
- ✅ **SQL Migration Runner** (`database/scripts/migrate.ts`)
- ✅ **Version Checker** (`database/scripts/check-version.ts`)
- ✅ **Package Scripts** added for migration management

### 2. Database Schema (Prisma)
Complete multi-tenant schema with:
- Accounts (tenant isolation)
- Roles & Users (authentication & authorization)
- CRM entities (clients, suppliers, employees, professionals)
- Migration history tracking

### 3. RLS Setup (SQL Migration)
SQL migration file created: `20260123_1800_initial_rls_setup.sql`
- PostgreSQL extensions (uuid-ossp, pgcrypto)
- Row Level Security policies for all tables
- Helper functions for account isolation
- Automatic triggers for updated_at

### 4. Documentation
- ✅ Migration strategy guide: `database/migrations/README.md`
- ✅ Version documentation: `database/DATABASE_VERSION.md`
- ✅ This activation guide: `DATABASE_ACTIVATION_GUIDE.md`

---

## 📋 Prerequisites

Before running migrations, ensure:

1. **PostgreSQL 16** is running
   - Via Docker: `docker-compose up -d postgres`
   - Or local installation

2. **Database credentials** are configured
   - File: `.env` (already created)
   - Variable: `DATABASE_URL`

3. **Node.js & pnpm** are installed
   - Node.js 20.x or 22.x
   - pnpm 9.13.2+

---

## 🚀 Activation Steps

### Step 1: Start PostgreSQL (if using Docker)

```bash
cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend
docker-compose up -d postgres
```

Or if docker-compose file is elsewhere:
```bash
# Check for docker-compose files
find . -name "docker-compose*.yml"
```

### Step 2: Verify Database Connection

```bash
cd nexo-prj

# Test connection
pnpm prisma db execute --stdin < /dev/null
```

### Step 3: Create Prisma Migration (Schema)

```bash
# This creates the migration file from schema.prisma
pnpm db:migrate:dev --name initial_multi_tenant_setup
```

This will:
- Create all tables (accounts, roles, users, clients, etc.)
- Set up indexes
- Create migration history

### Step 4: Apply SQL Migration (RLS Policies)

```bash
# Apply RLS policies and triggers
pnpm db:migrate
```

This will:
- Enable Row Level Security
- Create isolation policies
- Add triggers for timestamps
- Seed default data

### Step 5: Verify Installation

```bash
# Check all versions and RLS status
pnpm db:version
```

Expected output should show:
- ✅ Database Schema: 1.0.0
- ✅ PostgreSQL: 16.x
- ✅ Row Level Security: Enabled
- ✅ RLS Policies: 7+

### Step 6: Generate Prisma Client

```bash
pnpm db:generate
```

---

## 🧪 Testing Multi-Tenant Isolation

### Start Services

```bash
cd nexo-prj

# Start all backend services
pnpm nx serve auth-service &
pnpm nx serve crm-service &
pnpm nx serve api-gateway &
```

### Run HTTP Tests

Open `apps/crm-service/test-multi-tenant.http` in VS Code with REST Client extension:

1. Register Account A
2. Register Account B
3. Login as both accounts (save tokens)
4. Create data in both accounts
5. Verify isolation (Account A can't see Account B's data)

---

## 📦 Available Commands

### Migration Management
```bash
pnpm db:version           # Check database version and status
pnpm db:migrate           # Apply SQL migrations
pnpm db:migrate:dev       # Create and apply Prisma migration (dev)
pnpm db:migrate:deploy    # Apply Prisma migrations (production)
pnpm db:migrate:dry       # Preview migrations without applying
```

### Prisma Tools
```bash
pnpm db:studio            # Open Prisma Studio GUI
pnpm db:generate          # Generate Prisma Client
pnpm db:push              # Push schema without migration
pnpm db:reset             # Reset database (development only!)
```

### Development
```bash
pnpm prisma                # Run any Prisma command
```

---

## 🔄 Migration Workflow

### For Schema Changes

1. **Edit** `prisma/schema.prisma`
2. **Create migration**: `pnpm db:migrate:dev --name descriptive_name`
3. **Test locally**
4. **Commit migration files**
5. **Deploy**: `pnpm db:migrate:deploy`

### For SQL Features (RLS, triggers, etc.)

1. **Create SQL file** in `database/migrations/sql/`
2. **Name it**: `YYYYMMDD_HHMM_description.sql`
3. **Add metadata comments**:
   ```sql
   -- @version: 1.1.0
   -- @name: Add Projects Module
   -- @description: Creates projects table with RLS
   ```
4. **Apply**: `pnpm db:migrate`

### For Production

1. **Backup database first!**
2. **Test on staging environment**
3. **Run migrations during maintenance window**
4. **Verify with**: `pnpm db:version`

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start if not running
cd .. && docker-compose up -d postgres

# Verify connection string in .env
cat nexo-prj/.env
```

### "Table already exists" Error
```bash
# Check what's in the database
pnpm prisma db pull

# If needed, reset (WARNING: deletes all data!)
pnpm db:reset
```

### "RLS policies not working"
```bash
# Check RLS status
pnpm db:version

# Manually verify in psql
psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
```

### Prisma Client out of sync
```bash
# Regenerate client
pnpm db:generate

# Or if schema changed
pnpm db:migrate:dev
```

---

## 📊 Version Tracking

### Current Version: 1.0.0

To check current database version:
```bash
pnpm db:version
```

To view migration history in database:
```sql
SELECT version, name, applied_at, success
FROM migration_history
ORDER BY applied_at DESC;
```

---

## 🎯 Next Steps After Activation

Once migrations are complete:

1. ✅ **Test Multi-Tenant Isolation** (use test-multi-tenant.http)
2. ✅ **Verify RLS enforcement**
3. ✅ **Set up monitoring** for database metrics
4. ✅ **Configure backups** (automated)
5. ✅ **Document any custom changes**

---

## 📚 References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Project Architecture: `ARCHITECTURE.md`
- Activation Checklist: `ACTIVATION_CHECKLIST.md`
- Migration Strategy: `database/migrations/README.md`
- Version History: `database/DATABASE_VERSION.md`

---

## 🆘 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review `ACTIVATION_CHECKLIST.md`
3. Run `pnpm db:version` to see status
4. Check logs in terminal output
5. Review Prisma migration history: `prisma/migrations/`

---

## ✅ Completion Checklist

After following this guide, verify:

- [ ] PostgreSQL is running
- [ ] Database connection works
- [ ] Prisma migrations applied successfully
- [ ] SQL migrations applied successfully
- [ ] `pnpm db:version` shows all green checks
- [ ] RLS is enabled on all tables
- [ ] RLS policies are active (7+)
- [ ] Prisma Client is generated
- [ ] Services can connect to database
- [ ] Multi-tenant isolation test passes

---

**Status: Ready for Activation**  
**Last Updated: 2026-01-23**  
**Version: 1.0.0**
