# Database Version Documentation

## Current Version

**Version:** 1.0.0  
**Released:** 2026-01-23  
**Status:** ✅ Active

## Version History

### v1.0.0 (2026-01-23)
**Initial Multi-Tenant Release**

**Changes:**
- ✅ Created core tables: accounts, roles, users, user_roles
- ✅ Created CRM tables: clients, suppliers, employees, professionals
- ✅ Enabled Row Level Security (RLS) on all tables
- ✅ Created RLS isolation policies for multi-tenant security
- ✅ Added triggers for automatic updated_at timestamps
- ✅ Created migration_history table for version tracking
- ✅ Seeded default account for development

**Database Features:**
- PostgreSQL extensions: uuid-ossp, pgcrypto
- Row Level Security (RLS) enforced
- Automatic timestamp updates
- Multi-tenant isolation at database level

**Compatibility:**
- PostgreSQL: 16.x
- Prisma: 7.x
- Node.js: 20.x, 22.x

**Breaking Changes:** None (initial release)

**Migration Notes:**
- Run Prisma migrations first: `pnpm prisma migrate deploy`
- Then run SQL migrations: `pnpm db:migrate`
- Verify RLS: `pnpm db:check-version`

---

## Upcoming Versions

### v1.1.0 (Planned)
**Projects & Tasks Module**

**Planned Changes:**
- [ ] Add projects table with account_id
- [ ] Add tasks table linked to projects
- [ ] Add project_members junction table
- [ ] Create RLS policies for projects/tasks
- [ ] Add project status workflow

**Estimated:** Q1 2026

### v1.2.0 (Planned)
**Advanced Permissions & Audit**

**Planned Changes:**
- [ ] Add audit_log table for all changes
- [ ] Implement fine-grained permission system
- [ ] Add row-level permissions (beyond account isolation)
- [ ] Create audit triggers on all tables

**Estimated:** Q2 2026

---

## Rollback Procedures

### From v1.0.0 to Fresh Install
```sql
-- WARNING: This will delete ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## Version Compatibility Matrix

| DB Version | Prisma | PostgreSQL | Node.js | Backend API | Frontend |
|-----------|--------|------------|---------|-------------|----------|
| 1.0.0     | 7.x    | 16.x       | 20.x/22.x | 1.0.x     | 1.0.x    |
| 1.1.0     | 7.x    | 16.x       | 20.x/22.x | 1.1.x     | 1.0.x+   |
| 1.2.0     | 7.x    | 16.x+      | 22.x    | 1.2.x     | 1.1.x+   |

---

## Checking Your Version

### Using CLI
```bash
pnpm db:version
```

### Using SQL
```sql
SELECT version, applied_at, name
FROM migration_history
WHERE success = true
ORDER BY applied_at DESC
LIMIT 1;
```

### Using API
```bash
curl http://localhost:3000/health/database
```

---

## Migration Checklist

Before applying any migration:

- [ ] **Backup database** - `pnpm db:backup`
- [ ] **Review migration** - Check SQL files
- [ ] **Test on staging** - Apply to test environment first
- [ ] **Check compatibility** - Verify version matrix
- [ ] **Read release notes** - Understand breaking changes
- [ ] **Plan rollback** - Know how to revert if needed
- [ ] **Schedule maintenance** - Inform users of downtime
- [ ] **Apply migration** - `pnpm db:migrate`
- [ ] **Verify success** - `pnpm db:verify`
- [ ] **Update documentation** - Record changes

---

## Schema Changelog

### Tables Created in v1.0.0

1. **accounts** - Tenant/organization records
2. **roles** - Role definitions per account
3. **users** - User accounts with authentication
4. **user_roles** - Many-to-many user-role assignments
5. **clients** - CRM client records
6. **suppliers** - Supplier management
7. **employees** - Employee records
8. **professionals** - Professional/contractor records
9. **migration_history** - Migration tracking

### Indexes Created in v1.0.0
- `idx_users_account_id` - Fast account-based user lookups
- `idx_users_email` - Fast email lookups for authentication
- `idx_roles_account_id` - Fast role lookups per account
- `idx_clients_account_id` - Fast client queries per account
- `idx_suppliers_account_id` - Fast supplier queries per account
- `idx_employees_account_id` - Fast employee queries per account
- `idx_professionals_account_id` - Fast professional queries per account

### Functions Created in v1.0.0
- `current_user_account_id()` - Get active account from session
- `update_updated_at_column()` - Auto-update timestamps

### Policies Created in v1.0.0
- `accounts_isolation_policy` - Isolate account data
- `roles_isolation_policy` - Isolate roles per account
- `users_isolation_policy` - Isolate users per account
- `clients_isolation_policy` - Isolate clients per account
- `suppliers_isolation_policy` - Isolate suppliers per account
- `employees_isolation_policy` - Isolate employees per account
- `professionals_isolation_policy` - Isolate professionals per account

---

## Support

For migration issues or questions:
- Check logs: `database/logs/`
- Run diagnostics: `pnpm db:verify`
- Review docs: `database/migrations/README.md`
- Contact: DevOps team

---

**Last Updated:** 2026-01-23  
**Maintained By:** NEXO CRM Development Team
