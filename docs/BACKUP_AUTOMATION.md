# PostgreSQL Backup Automation

Comprehensive backup and disaster recovery solution for NEXO CRM PostgreSQL database.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Backup Scripts](#backup-scripts)
- [Restoration Process](#restoration-process)
- [Retention Policies](#retention-policies)
- [Automation](#automation)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The backup automation system provides:

- **Automated Backups**: Timestamped, compressed backups with metadata
- **Backup Verification**: Integrity checks and validation
- **Smart Rotation**: Daily/weekly/monthly retention policies
- **Easy Restoration**: Test and production restore capabilities
- **Comprehensive Logging**: Full audit trail of all operations

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Backup Automation                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Backup     │───▶│  Rotation    │───▶│  Retention   │ │
│  │   Script     │    │  Policy      │    │  Manager     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Backup Storage (./backups/postgres)        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  • nexo_20260120_143000.sql.gz   (Daily - 7 days)    │  │
│  │  • nexo_20260119_000000.sql.gz   (Weekly - 30 days)  │  │
│  │  • nexo_20260101_000000.sql.gz   (Monthly - 1 year)  │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                          │
│  │   Restore    │                                          │
│  │   Script     │                                          │
│  └──────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Create Your First Backup

```bash
# Using MISE
mise run db:backup

# Using Make
make db-backup

# Direct script
./scripts/backup-postgres.sh
```

### List Available Backups

```bash
# Using MISE
mise run db:backup:list

# Using Make
make db-backup-list

# Direct script
./scripts/backup-postgres.sh list
```

### Test Restore (Safe)

```bash
# Using MISE
mise run db:restore:test

# Using Make
make db-restore-test

# Direct script
./scripts/restore-postgres.sh test
```

## 📦 Backup Scripts

### 1. backup-postgres.sh

Creates compressed backups with full metadata.

#### Features

- **Compression**: gzip level 9 for optimal space usage
- **Metadata**: JSON info file with timestamp, size, version
- **Verification**: Automatic integrity checks
- **Cleanup**: Removes old backups based on retention policy

#### Usage

```bash
# Create backup
./scripts/backup-postgres.sh backup

# List backups
./scripts/backup-postgres.sh list

# Verify backup
./scripts/backup-postgres.sh verify backups/postgres/nexo_20260120_143000.sql.gz

# Clean old backups
./scripts/backup-postgres.sh cleanup
```

#### Configuration

Environment variables:

```bash
export BACKUP_DIR="./backups/postgres"        # Backup directory
export POSTGRES_CONTAINER="nexo-postgres"     # Container name
export POSTGRES_DB="nexo"                     # Database name
export POSTGRES_USER="nexo_user"              # Database user
export BACKUP_RETENTION_DAYS="7"              # Days to keep backups
export BACKUP_COMPRESSION="9"                 # Compression level (1-9)
```

#### Backup File Structure

```
backups/postgres/
├── nexo_20260120_143000.sql.gz     # Compressed backup
├── nexo_20260120_143000.info       # Metadata JSON
├── nexo_20260119_120000.sql.gz
└── nexo_20260119_120000.info
```

#### Metadata Example

```json
{
  "timestamp": "20260120_143000",
  "database": "nexo",
  "container": "nexo-postgres",
  "user": "nexo_user",
  "backup_file": "nexo_20260120_143000.sql.gz",
  "size": "2.3M",
  "compression": "9",
  "created_at": "2026-01-20T14:30:00-08:00",
  "hostname": "dev-server",
  "postgres_version": "PostgreSQL 15.3"
}
```

### 2. restore-postgres.sh

Restores database from backup with safety checks.

#### Features

- **Safety Backup**: Creates pre-restore backup automatically
- **Test Mode**: Restore to separate database for validation
- **Connection Management**: Terminates active connections safely
- **Verification**: Post-restore integrity checks

#### Usage

```bash
# Test restore (creates test database)
./scripts/restore-postgres.sh test

# Test specific backup
./scripts/restore-postgres.sh test backups/postgres/nexo_20260120_143000.sql.gz

# Full restore (DESTRUCTIVE - asks for confirmation)
./scripts/restore-postgres.sh restore

# Restore specific backup
./scripts/restore-postgres.sh restore backups/postgres/nexo_20260119_120000.sql.gz

# Show latest backup
./scripts/restore-postgres.sh latest

# List available backups
./scripts/restore-postgres.sh list
```

#### Test Restore Process

```
1. Verify backup integrity
2. Check PostgreSQL container
3. Create test database (nexo_restore_test)
4. Restore backup to test database
5. Run validation queries
6. Display results
7. Keep test database for inspection
```

#### Full Restore Process

```
1. Verify backup integrity
2. Check PostgreSQL container
3. Ask user confirmation
4. Create pre-restore safety backup
5. Terminate active connections
6. Drop and recreate database
7. Restore from backup
8. Run validation tests
9. Report results
```

### 3. backup-rotation.sh

Manages backup lifecycle with intelligent retention.

#### Features

- **Smart Retention**: Daily/weekly/monthly policies
- **Age Distribution**: Track backup age across time periods
- **Statistics**: Comprehensive backup analytics
- **Categorization**: List backups by type (daily/weekly/monthly)

#### Usage

```bash
# Apply rotation policies (delete old backups)
./scripts/backup-rotation.sh rotate

# Show statistics
./scripts/backup-rotation.sh stats

# List by category
./scripts/backup-rotation.sh list
```

#### Retention Policies

Default policies:

| Type | Criteria | Retention Period |
|------|----------|------------------|
| **Daily** | All backups | 7 days |
| **Weekly** | Sundays only | 30 days |
| **Monthly** | 1st of month | 365 days |

Configure via environment variables:

```bash
export DAILY_RETENTION="7"      # Keep daily backups for 7 days
export WEEKLY_RETENTION="30"    # Keep weekly backups for 30 days
export MONTHLY_RETENTION="365"  # Keep monthly backups for 1 year
```

#### Rotation Logic

```
For each backup:
  IF created on 1st of month:
    Keep if age ≤ 365 days (Monthly)
  ELSE IF created on Sunday:
    Keep if age ≤ 30 days (Weekly)
  ELSE:
    Keep if age ≤ 7 days (Daily)
  ELSE:
    Delete
```

## 🔄 Restoration Process

### Test Restore (Recommended First)

Always test restore before performing full restore:

```bash
# Test latest backup
make db-restore-test

# Verify test database
docker exec nexo-postgres psql -U nexo_user -d nexo_restore_test -c '\dt'

# Check data
docker exec nexo-postgres psql -U nexo_user -d nexo_restore_test -c 'SELECT COUNT(*) FROM users;'

# Clean up test database when done
docker exec nexo-postgres psql -U nexo_user -d postgres -c 'DROP DATABASE nexo_restore_test;'
```

### Full Restore

⚠️ **WARNING**: This is destructive! It will replace your current database.

```bash
# Restore from latest backup
make db-restore

# OR restore specific backup
BACKUP_FILE=backups/postgres/nexo_20260119_120000.sql.gz make db-restore-file
```

The script will:
1. Ask for confirmation
2. Create a safety backup
3. Perform the restore
4. Validate the restored data

### Emergency Restore

If you need to restore quickly:

```bash
# 1. Get latest backup
LATEST=$(./scripts/restore-postgres.sh latest)

# 2. Restore immediately (still creates safety backup)
./scripts/restore-postgres.sh restore "$LATEST"
```

## 📊 Retention Policies

### Policy Overview

```
Timeline:
├─ 0-7 days:    All backups kept (Daily)
├─ 8-30 days:   Sunday backups kept (Weekly)  
└─ 31-365 days: 1st of month backups kept (Monthly)
```

### Example Retention

Assuming backups created daily:

**After 7 days:**
- 7 daily backups

**After 30 days:**
- 7 daily backups (last 7 days)
- 4 weekly backups (Sundays from 8-30 days ago)

**After 365 days:**
- 7 daily backups
- 4 weekly backups
- 12 monthly backups

**Total: ~23 backups** spanning 1 year

### Customize Retention

Create custom retention in `.env` file:

```bash
# .env
DAILY_RETENTION=14        # Keep 2 weeks of daily backups
WEEKLY_RETENTION=60       # Keep 2 months of weekly backups
MONTHLY_RETENTION=730     # Keep 2 years of monthly backups
```

Then use with scripts:

```bash
# Load .env and run rotation
source .env && ./scripts/backup-rotation.sh rotate
```

## ⚙️ Automation

### Cron Job Setup

Add to crontab for automated backups:

```bash
# Edit crontab
crontab -e

# Add these lines:

# Daily backup at 2 AM
0 2 * * * cd /path/to/project && ./scripts/backup-postgres.sh backup >> /var/log/nexo-backup.log 2>&1

# Weekly rotation on Sundays at 3 AM
0 3 * * 0 cd /path/to/project && ./scripts/backup-rotation.sh rotate >> /var/log/nexo-rotation.log 2>&1

# Monthly stats report on 1st at 4 AM
0 4 1 * * cd /path/to/project && ./scripts/backup-rotation.sh stats | mail -s "NEXO Backup Report" admin@example.com
```

### Systemd Timer (Alternative)

Create systemd service and timer:

**`/etc/systemd/system/nexo-backup.service`:**

```ini
[Unit]
Description=NEXO PostgreSQL Backup
After=docker.service

[Service]
Type=oneshot
User=youruser
WorkingDirectory=/path/to/project
ExecStart=/path/to/project/scripts/backup-postgres.sh backup
StandardOutput=journal
StandardError=journal
```

**`/etc/systemd/system/nexo-backup.timer`:**

```ini
[Unit]
Description=NEXO Backup Timer

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable nexo-backup.timer
sudo systemctl start nexo-backup.timer

# Check status
sudo systemctl status nexo-backup.timer
```

### Docker Compose Service

Add a backup service to `docker-compose.yml`:

```yaml
services:
  backup:
    image: postgres:15-alpine
    container_name: nexo-backup
    depends_on:
      - postgres
    volumes:
      - ./backups:/backups
      - ./scripts:/scripts:ro
    environment:
      - BACKUP_DIR=/backups/postgres
      - POSTGRES_CONTAINER=nexo-postgres
      - POSTGRES_DB=nexo
      - POSTGRES_USER=nexo_user
      - DAILY_RETENTION=7
      - WEEKLY_RETENTION=30
      - MONTHLY_RETENTION=365
    command: >
      sh -c "
        apk add --no-cache bash &&
        while true; do
          sleep 86400;
          bash /scripts/backup-postgres.sh backup;
          bash /scripts/backup-rotation.sh rotate;
        done
      "
    restart: unless-stopped
    networks:
      - nexo-network
```

## 🎯 Best Practices

### 1. Backup Frequency

Recommended schedule:

- **Development**: Daily backups, 7-day retention
- **Staging**: Twice daily, 14-day retention
- **Production**: Hourly backups, 30-day retention + weekly + monthly

### 2. Offsite Backups

Always maintain offsite copies:

```bash
# Sync to S3
aws s3 sync ./backups/postgres s3://nexo-backups/postgres/

# Sync to remote server
rsync -avz ./backups/postgres/ user@backup-server:/backups/nexo/
```

### 3. Regular Restore Tests

Test restore monthly:

```bash
# First Monday of each month
0 9 1-7 * 1 cd /path/to/project && ./scripts/restore-postgres.sh test
```

### 4. Monitor Backup Size

Track backup growth:

```bash
# Check backup size trends
make db-backup-stats

# Alert if size exceeds threshold
BACKUP_SIZE=$(du -sm backups/postgres | cut -f1)
if [ $BACKUP_SIZE -gt 10000 ]; then
  echo "WARNING: Backups exceed 10GB!" | mail -s "Backup Alert" admin@example.com
fi
```

### 5. Encryption (Production)

Encrypt sensitive backups:

```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backups/postgres/nexo_20260120_143000.sql.gz

# Decrypt for restore
gpg --decrypt backups/postgres/nexo_20260120_143000.sql.gz.gpg | gunzip | \
  docker exec -i nexo-postgres psql -U nexo_user -d nexo
```

## 🔧 Troubleshooting

### Backup Fails with "Container Not Running"

**Problem**: PostgreSQL container is not running.

**Solution**:
```bash
# Check container status
docker ps | grep postgres

# Start container
docker compose up -d postgres

# Retry backup
make db-backup
```

### Backup File is Corrupted

**Problem**: `gzip: invalid compressed data`

**Solution**:
```bash
# Verify backup
make db-backup-verify

# If corrupted, remove and create new backup
rm -f backups/postgres/nexo_corrupted.sql.gz*
make db-backup
```

### Restore Fails with Permission Denied

**Problem**: User doesn't have permission to create/drop database.

**Solution**:
```bash
# Grant permissions
docker exec nexo-postgres psql -U postgres -c \
  "ALTER USER nexo_user CREATEDB;"

# Retry restore
make db-restore-test
```

### Out of Disk Space

**Problem**: Backup directory fills up disk.

**Solution**:
```bash
# Check disk usage
df -h backups/

# Apply aggressive rotation
DAILY_RETENTION=3 ./scripts/backup-rotation.sh rotate

# Or clean manually
cd backups/postgres && ls -t | tail -n +10 | xargs rm
```

### Backup Takes Too Long

**Problem**: Large database causes slow backups.

**Solution**:
```bash
# Use parallel dump (if pg_dump supports it)
docker exec nexo-postgres pg_dump -U nexo_user -d nexo -Fd -j 4 -f /tmp/backup

# Or dump specific tables only
docker exec nexo-postgres pg_dump -U nexo_user -d nexo -t users -t orders | gzip > partial_backup.sql.gz
```

## 📚 MISE & Make Commands

### MISE Tasks

```bash
# Backup commands
mise run db:backup              # Create backup
mise run db:backup:list         # List backups
mise run db:backup:verify       # Verify latest
mise run db:backup:rotate       # Apply rotation
mise run db:backup:stats        # Show statistics

# Restore commands
mise run db:restore:test        # Test restore
mise run db:restore             # Full restore
```

### Make Targets

```bash
# Backup commands
make db-backup                  # Create backup
make db-backup-list             # List backups
make db-backup-verify           # Verify latest
make db-backup-cleanup          # Clean old backups
make db-backup-rotate           # Apply rotation
make db-backup-stats            # Show statistics

# Restore commands
make db-restore-test            # Test restore
make db-restore                 # Full restore
make db-restore-latest          # Show latest backup
make db-restore-file BACKUP_FILE=path/to/backup.sql.gz  # Restore specific file
```

## 🔒 Security Considerations

### 1. Backup Permissions

Restrict access to backup files:

```bash
# Set proper permissions
chmod 700 backups/
chmod 600 backups/postgres/*.sql.gz

# Change ownership
chown -R backup-user:backup-group backups/
```

### 2. Sensitive Data

For production, consider:

- Encrypting backups at rest
- Using separate backup user with minimal permissions
- Storing backups on encrypted volumes
- Implementing backup access logs

### 3. Network Security

If backing up remotely:

- Use SSH tunnels or VPN
- Enable backup transfer encryption
- Implement backup integrity signatures

## 📞 Support

For issues or questions:

1. Check [TESTING.md](TESTING.md) for general troubleshooting
2. Review backup logs in script output
3. Check container logs: `docker logs nexo-postgres`
4. Consult PostgreSQL documentation

---

**Last Updated**: 2026-01-20  
**Maintained By**: NEXO Development Team
