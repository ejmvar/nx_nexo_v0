# 🚀 Database Migration - Quick Reference

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Apply all migrations
cd nexo-prj
pnpm db:migrate:dev --name initial_multi_tenant_setup
pnpm db:migrate

# 3. Verify
pnpm db:version

# 4. Done! 🎉
```

---

## 📋 Essential Commands

| Task | Command | When to Use |
|------|---------|-------------|
| Check versions | `pnpm db:version` | Before/after migrations |
| Apply SQL migrations | `pnpm db:migrate` | After creating .sql files |
| Create schema migration | `pnpm db:migrate:dev --name xyz` | After schema.prisma changes |
| Deploy to production | `pnpm db:migrate:deploy` | Production deployments |
| Preview changes | `pnpm db:migrate:dry` | Before applying |
| Open GUI | `pnpm db:studio` | Visual database browsing |
| Generate client | `pnpm db:generate` | After schema changes |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `database/migrations/sql/*.sql` | SQL migrations (RLS, triggers) |
| `database/DATABASE_VERSION.md` | Version history & compatibility |
| `.env` | Database connection string |

---

## 🔧 Common Tasks

### Add a New Table
1. Edit `prisma/schema.prisma`
2. Run `pnpm db:migrate:dev --name add_table_name`
3. If needs RLS, create SQL migration file
4. Run `pnpm db:migrate`

### Check Database Status
```bash
pnpm db:version
```

### Reset Database (DEV ONLY!)
```bash
pnpm db:reset
```

### View Data
```bash
pnpm db:studio
# Opens http://localhost:5555
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect | `docker-compose up -d postgres` |
| Table exists error | Check `migration_history` table or use `pnpm db:reset` |
| Prisma out of sync | `pnpm db:generate` |
| RLS not working | `pnpm db:version` then check policies |

---

## 📚 Full Documentation

- **Activation Guide:** [DATABASE_ACTIVATION_GUIDE.md](./DATABASE_ACTIVATION_GUIDE.md)
- **Implementation Summary:** [MIGRATION_SYSTEM_SUMMARY.md](./MIGRATION_SYSTEM_SUMMARY.md)
- **Migration Strategy:** [nexo-prj/database/migrations/README.md](./nexo-prj/database/migrations/README.md)
- **Version History:** [nexo-prj/database/DATABASE_VERSION.md](./nexo-prj/database/DATABASE_VERSION.md)
- **Multi-Tenant Checklist:** [ACTIVATION_CHECKLIST.md](./ACTIVATION_CHECKLIST.md)

---

## ✅ Post-Migration Checklist

- [ ] `pnpm db:version` shows all green ✅
- [ ] RLS is enabled (7+ policies)
- [ ] Services can connect to database
- [ ] Multi-tenant test passes (test-multi-tenant.http)

---

**Quick Help:** Run `pnpm db:version` to see current status!
