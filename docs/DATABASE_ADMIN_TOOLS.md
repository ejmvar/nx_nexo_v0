# Database Admin Tools - User Guide

## Overview

NEXO CRM includes two powerful database administration tools for managing PostgreSQL and Redis.

## pgAdmin - PostgreSQL Administration

### Access
- **URL**: http://localhost:5050
- **Email**: admin@nexo.local
- **Password**: admin

### Features
- Visual query builder
- Database schema browser
- Table data editor
- SQL query execution
- Performance monitoring
- Backup and restore
- User management

### First-Time Setup

1. **Open pgAdmin**: Navigate to http://localhost:5050

2. **Add Server Connection**:
   - Right-click "Servers" → "Register" → "Server"
   - **General Tab**:
     - Name: `NEXO CRM`
   - **Connection Tab**:
     - Host: `postgres`
     - Port: `5432`
     - Maintenance database: `nexo`
     - Username: `nexo_user`
     - Password: `nexo_password`
   - **Save**: Click "Save"

3. **Browse Database**:
   - Expand: Servers → NEXO CRM → Databases → nexo
   - View: Schemas → Tables → Columns

### Common Tasks

#### Execute SQL Query
1. Right-click on database → "Query Tool"
2. Write your SQL query
3. Press F5 or click "Execute"

#### View Table Data
1. Navigate to: Schemas → public → Tables
2. Right-click table → "View/Edit Data" → "All Rows"

#### Export Data
1. Right-click table → "Import/Export"
2. Select "Export"
3. Choose format (CSV, JSON, etc.)

#### Create Backup
1. Right-click database → "Backup"
2. Choose filename and format
3. Click "Backup"

## RedisInsight - Redis Administration

### Access
- **URL**: http://localhost:5540

### Features
- Key-value browser
- Redis command execution
- Memory analysis
- Pub/Sub monitoring
- Real-time performance metrics
- JSON viewer
- Stream monitoring

### First-Time Setup

1. **Open RedisInsight**: Navigate to http://localhost:5540

2. **Add Database Connection**:
   - Click "Add Redis Database"
   - **Connection Settings**:
     - Host: `redis`
     - Port: `6379`
     - Database Alias: `NEXO CRM Redis`
   - **Click**: "Add Redis Database"

3. **Browse Keys**:
   - Click on your database
   - Use the browser to explore keys

### Common Tasks

#### Browse Keys
1. Click on database name
2. Use search bar to filter keys
3. Click on key to view value

#### Execute Redis Commands
1. Click "CLI" tab
2. Type Redis command (e.g., `KEYS *`, `GET mykey`)
3. Press Enter

#### Monitor Performance
1. Click "Analysis Tools"
2. View memory usage
3. See key statistics

#### Pub/Sub Monitoring
1. Click "Pub/Sub" tab
2. Subscribe to channels
3. Publish test messages

## Integration with Backend

### Connection Strings

The backend automatically connects to databases using these URLs:

```bash
# PostgreSQL
DATABASE_URL=postgresql://nexo_user:nexo_password@postgres:5432/nexo

# Redis
REDIS_URL=redis://redis:6379
```

### Viewing Backend Queries

#### In pgAdmin
1. Enable query logging in PostgreSQL
2. View: Tools → Server Configuration → postgresql.conf
3. Set: `log_statement = 'all'`
4. View logs: Tools → Server Logs

#### In RedisInsight
1. Use "Profiler" tab
2. Start profiling
3. Execute backend operations
4. See real-time commands

## Troubleshooting

### pgAdmin Connection Failed

**Problem**: Cannot connect to PostgreSQL server

**Solution**:
```bash
# Check if postgres is running
mise run docker:ps

# Check postgres logs
mise run logs:postgres

# Verify network
docker network inspect nexo-network
```

### RedisInsight Connection Failed

**Problem**: Cannot connect to Redis server

**Solution**:
```bash
# Check if redis is running
mise run docker:ps

# Test redis connection
docker compose -f docker/docker-compose.yml exec redis redis-cli ping

# Check redis logs
mise run logs:redis
```

### pgAdmin Login Issues

**Problem**: Cannot log in to pgAdmin

**Solution**:
- Use email: `admin@nexo.local`
- Use password: `admin`
- Clear browser cookies if needed

### Data Not Showing

**Problem**: Tables appear empty in pgAdmin

**Solution**:
```bash
# Run backend migrations
cd nexo-prj
pnpm nx run api-gateway:migrate

# Seed sample data
pnpm nx run api-gateway:seed
```

## Best Practices

### Security
- ⚠️ Change default passwords in production
- Use read-only database users for browsing
- Enable SSL connections in production
- Restrict network access

### Performance
- Use query limits when browsing large tables
- Use indexes for frequently queried columns
- Monitor slow queries in pgAdmin
- Check memory usage in RedisInsight

### Backup
- Schedule regular database backups
- Test backup restoration periodically
- Store backups securely
- Use different backup strategies (full, incremental)

## Quick Commands

### pgAdmin via MISE/Make
```bash
# View pgAdmin logs
mise run logs:pgadmin
make logs-pgadmin

# Restart pgAdmin
docker compose -f docker/docker-compose.yml restart pgadmin
```

### RedisInsight via MISE/Make
```bash
# View RedisInsight logs
mise run logs:redisinsight
make logs-redisinsight

# Restart RedisInsight
docker compose -f docker/docker-compose.yml restart redisinsight
```

### Access Logs
```bash
# PostgreSQL
mise run logs:postgres

# Redis
mise run logs:redis

# Backend (to see DB queries)
mise run logs:backend
```

## Resources

### pgAdmin
- Official Docs: https://www.pgadmin.org/docs/
- Tutorial: https://www.pgadmin.org/docs/pgadmin4/latest/getting_started.html

### RedisInsight
- Official Docs: https://redis.io/docs/ui/insight/
- Tutorial: https://redis.io/docs/ui/insight/tutorials/

### PostgreSQL
- SQL Reference: https://www.postgresql.org/docs/current/sql.html
- Performance: https://www.postgresql.org/docs/current/performance-tips.html

### Redis
- Commands: https://redis.io/commands/
- Best Practices: https://redis.io/docs/manual/patterns/

## Support

For issues or questions:
1. Check logs: `mise run docker:logs`
2. Review service status: `mise run docker:ps`
3. Run health checks: `mise run test:docker:health`
4. Consult documentation above
