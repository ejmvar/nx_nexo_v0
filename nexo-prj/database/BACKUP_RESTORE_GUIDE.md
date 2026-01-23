# Database Backup & Restore Procedures

## 🛡️ Backup Strategy

### Automated Backups
The migration system includes automated backup procedures to ensure data safety.

### When Backups Are Created

1. **Before migrations** (automatic with `db:migrate:safe`)
2. **Before production deployments** (manual)
3. **Regular scheduled backups** (recommended: daily/weekly)
4. **Before schema changes** (best practice)
5. **Before risky operations** (any time you're unsure)

---

## 📦 Creating Backups

### Manual Backup
```bash
# Create backup with automatic timestamp
pnpm db:backup

# Create backup with description
pnpm db:backup pre-migration
pnpm db:backup before-production-deploy
pnpm db:backup weekly-backup
```

### Safe Migration (Automatic Backup)
```bash
# Automatically creates backup before migration
pnpm db:migrate:safe
```

### List All Backups
```bash
pnpm db:backup:list
# or
pnpm db:backup list
```

---

## 🔧 Backup Output

When creating a backup, you'll see:

```
╔════════════════════════════════════════════════════════════╗
║       NEXO CRM - Database Backup Tool                     ║
╚════════════════════════════════════════════════════════════╝

📦 Creating database backup...

📊 Gathering database information...
   Database: nexo_crm
   PostgreSQL: 16.2
   Tables: 9
   Migrations: 5

💾 Running pg_dump...
   ✅ Backup created in 1234ms

🔐 Calculating checksum...
   Checksum: a1b2c3d4e5f6g7h8...
   Size: 2048 KB

📝 Metadata saved

╔════════════════════════════════════════════════════════════╗
║                   Backup Complete!                         ║
╚════════════════════════════════════════════════════════════╝

📁 Backup file: backup_2026-01-23_143052_pre-migration.sql
📁 Metadata:    backup_2026-01-23_143052_pre-migration.json
📂 Location:    /path/to/nexo-prj/database/backups
```

---

## 📂 Backup Location & Structure

Backups are stored in: `nexo-prj/database/backups/`

### Files Created Per Backup:

1. **`.sql` file** - The actual database dump
   - Contains all schema and data
   - Can be restored using psql or restore tool
   - Includes DROP and CREATE statements

2. **`.json` file** - Backup metadata
   - Timestamp
   - Database name and version
   - Checksum for integrity verification
   - Table list
   - Migration count

### Example Structure:
```
database/backups/
├── backup_2026-01-23_120000.sql          # Morning backup
├── backup_2026-01-23_120000.json         # Metadata
├── backup_2026-01-23_143052_pre-migration.sql
├── backup_2026-01-23_143052_pre-migration.json
└── backup_2026-01-23_180000_post-migration.sql
```

---

## 🔄 Restoring from Backup

### Restore Specific Backup
```bash
# By exact filename
pnpm db:restore backup_2026-01-23_143052_pre-migration.sql

# By partial match (if unique)
pnpm db:restore 2026-01-23_143052
pnpm db:restore pre-migration
```

### Restore Latest Backup
```bash
pnpm db:restore latest
```

### List Available Backups
```bash
pnpm db:restore:list
# or
pnpm db:restore list
```

### Force Restore (Skip Confirmations)
```bash
pnpm db:restore latest --force
```

⚠️ **WARNING**: Restore will completely replace your current database!

---

## 🔒 Security Features

### 1. Checksum Verification
Every backup has a SHA-256 checksum to detect corruption:
- Calculated when backup is created
- Verified before restore
- Prevents restoring corrupted backups

### 2. Metadata Tracking
Each backup includes:
- Creation timestamp
- PostgreSQL version
- Number of tables
- Number of applied migrations
- Full table list

### 3. Safety Confirmations
Restore process requires:
- Explicit confirmation (type "yes")
- Checksum validation passes
- Clear warnings about data loss
- Can be bypassed with `--force` flag (use carefully!)

### 4. Clean Restore
Backups include:
- `DROP IF EXISTS` statements (clean state)
- No owner information (portable)
- No ACL information (security)
- Only essential data

---

## 🚀 Migration Workflow with Backups

### Development
```bash
# 1. Create backup
pnpm db:backup pre-feature-xyz

# 2. Make schema changes
# Edit prisma/schema.prisma

# 3. Apply migration
pnpm db:migrate:dev --name add-feature-xyz

# 4. Test changes
pnpm db:version

# 5. If something goes wrong
pnpm db:restore pre-feature-xyz
```

### Production (Recommended)
```bash
# 1. Backup before deployment
pnpm db:backup before-deploy-v1.2.0

# 2. Test on staging first
# Apply migrations on staging environment

# 3. Verify staging
pnpm db:version

# 4. If staging is good, deploy to production
pnpm db:backup pre-production-deploy
pnpm db:migrate:deploy

# 5. Verify production
pnpm db:version

# 6. Create post-deployment backup
pnpm db:backup post-production-deploy
```

### Automated Safe Migration
```bash
# This automatically creates backup before migration
pnpm db:migrate:safe
```

Equivalent to:
```bash
pnpm db:backup pre-migration
pnpm db:migrate
```

---

## 📋 Backup Checklist

Before any migration:
- [ ] Create backup: `pnpm db:backup pre-migration`
- [ ] Verify backup created successfully
- [ ] Note backup filename for restore if needed
- [ ] Ensure backup directory has sufficient space
- [ ] Test backup can be listed: `pnpm db:backup:list`

After migration:
- [ ] Verify migration succeeded: `pnpm db:version`
- [ ] Test application works correctly
- [ ] Create post-migration backup: `pnpm db:backup post-migration`
- [ ] Keep backup for rollback period (7-30 days recommended)

---

## 🔄 Rollback Procedures

### Immediate Rollback (During Migration)
If migration fails:
```bash
# Restore from pre-migration backup
pnpm db:restore pre-migration
```

### Delayed Rollback (After Migration)
If issues discovered later:
```bash
# 1. List available backups
pnpm db:restore:list

# 2. Identify backup before problematic migration
# Example: backup_2026-01-23_120000.sql

# 3. Create backup of current (broken) state
pnpm db:backup broken-state-before-rollback

# 4. Restore good backup
pnpm db:restore backup_2026-01-23_120000.sql

# 5. Regenerate Prisma client
pnpm db:generate

# 6. Verify
pnpm db:version
```

---

## 💾 Backup Retention Policy

### Recommended Schedule

**Development:**
- Before each migration
- Before risky operations
- Keep last 7 days

**Staging:**
- Daily backups
- Before each deployment
- Keep last 30 days

**Production:**
- Automated daily backups
- Before each deployment
- After successful deployment
- Keep:
  - Daily backups: 30 days
  - Weekly backups: 90 days
  - Monthly backups: 1 year
  - Pre-deployment backups: Indefinitely

### Cleanup Old Backups
```bash
# Manual cleanup (example)
cd database/backups
ls -lt *.sql

# Delete backups older than 30 days
find . -name "*.sql" -mtime +30 -delete
find . -name "*.json" -mtime +30 -delete
```

---

## 🛠️ Advanced Operations

### Backup to External Location
```bash
# Create backup
pnpm db:backup critical-backup

# Copy to external storage
cp database/backups/backup_*.sql /mnt/external-backup/
```

### Restore from External Backup
```bash
# Copy backup to local directory
cp /mnt/external-backup/backup_*.sql database/backups/

# Restore
pnpm db:restore backup_*
```

### Manual Backup (Using pg_dump directly)
```bash
pg_dump $DATABASE_URL --clean --if-exists > manual-backup.sql
```

### Manual Restore (Using psql directly)
```bash
psql $DATABASE_URL < manual-backup.sql
```

---

## 🚨 Emergency Procedures

### Total Database Corruption
1. **Don't panic** - Backups exist for this!
2. **Identify last known good backup**: `pnpm db:restore:list`
3. **Restore from backup**: `pnpm db:restore <backup-name>`
4. **Verify**: `pnpm db:version`
5. **Test application**
6. **Document what happened**

### Backup File Corrupted
If restore fails with checksum error:
1. Try previous backup
2. Check backup file integrity manually
3. Restore from external backup location
4. As last resort, rebuild from scratch

### Accidental Data Deletion
1. **Immediately create backup** of current state (despite deletions)
2. **Restore from most recent backup** before deletion
3. **Compare data** to identify what was deleted
4. **Re-apply any changes** made after backup

---

## 📊 Monitoring Backup Health

### Regular Checks
```bash
# Check backup directory size
du -sh database/backups/

# Count backups
ls database/backups/*.sql | wc -l

# List by size
ls -lhS database/backups/*.sql

# Check oldest backup
ls -lt database/backups/*.sql | tail -1
```

### Verify Backup Integrity
```bash
# Restore to test database (without affecting production)
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/test_db" \
  pnpm db:restore <backup-name> --force
```

---

## 🔗 Integration with CI/CD

### Pre-Deployment Backup (GitHub Actions Example)
```yaml
- name: Create Pre-Deployment Backup
  run: |
    cd nexo-prj
    pnpm db:backup pre-deploy-${{ github.sha }}
```

### Automated Daily Backup (Cron Example)
```bash
# Add to crontab
0 2 * * * cd /path/to/nexo-prj && pnpm db:backup daily-$(date +\%F) >> /var/log/backup.log 2>&1
```

---

## ✅ Best Practices

1. **Always backup before migrations**
2. **Test restores regularly** (monthly recommended)
3. **Keep multiple backup generations** (daily, weekly, monthly)
4. **Store backups in multiple locations** (local + remote)
5. **Document backup locations** and procedures
6. **Automate backup schedule** for production
7. **Verify backups after creation** (check file size, checksum)
8. **Practice restore procedures** before emergencies
9. **Monitor backup disk space**
10. **Keep deployment backups indefinitely**

---

## 📚 Related Documentation

- **Quick Reference**: [MIGRATION_QUICK_REFERENCE.md](../../MIGRATION_QUICK_REFERENCE.md)
- **Activation Guide**: [DATABASE_ACTIVATION_GUIDE.md](../../DATABASE_ACTIVATION_GUIDE.md)
- **Migration Strategy**: [migrations/README.md](../migrations/README.md)
- **Version History**: [DATABASE_VERSION.md](../DATABASE_VERSION.md)

---

**Backup Status: ✅ Fully Implemented**  
**Last Updated: 2026-01-23**
