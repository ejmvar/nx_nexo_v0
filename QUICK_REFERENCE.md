# NEXO CRM - Quick Reference Card

## 🚀 Getting Started (First Time)

```bash
# Setup everything (one command!)
bash scripts/setup-dev.sh
```

## 📋 Daily Commands

### Start Development
```bash
mise run dev                # Start all services
make dev                    # Alternative with Make
```

### Run Tests
```bash
mise run test:quick         # Quick validation (30s)
mise run test:all          # Full test suite (5min)
make test-all              # Alternative with Make
```

### View Services
```bash
mise run urls              # Show all URLs
make urls                  # Alternative
```

### Stop Development
```bash
mise run dev:stop          # Stop all services
make dev-stop              # Alternative
```

## 🐳 Docker Commands

| Action | MISE | Make |
|--------|------|------|
| Start services | `mise run docker:up` | `make docker-up` |
| Stop services | `mise run docker:down` | `make docker-down` |
| View logs | `mise run docker:logs` | `make docker-logs` |
| Clean resources | `mise run docker:clean` | `make docker-clean` |
| Restart services | `mise run docker:restart` | `make docker-restart` |

## 🧪 Testing Commands

| Test | MISE | Make |
|------|------|------|
| Quick validation | `mise run test:quick` | `make test-quick` |
| All tests | `mise run test:all` | `make test-all` |
| Docker health | `mise run test:docker:health` | `make test-docker-health` |
| K8s validation | `mise run k8s:validate` | `make test-k8s-validate` |
| CI pipeline | `mise run ci:test` | `make test-ci` |

## 📊 Monitoring Commands

| Service | MISE | Make |
|---------|------|------|
| Frontend logs | `mise run logs:frontend` | `make logs-frontend` |
| PostgreSQL logs | `mise run logs:postgres` | `make logs-postgres` |
| Redis logs | `mise run logs:redis` | `make logs-redis` |
| Keycloak logs | `mise run logs:keycloak` | `make logs-keycloak` |
| Prometheus logs | `mise run logs:prometheus` | `make logs-prometheus` |
| Grafana logs | `mise run logs:grafana` | `make logs-grafana` |

## 💾 Database Commands

| Action | MISE | Make |
|--------|------|------|
| PostgreSQL shell | `mise run db:shell` | `make db-shell` |
| Create backup | `mise run db:backup` | `make db-backup` |
| List backups | `mise run db:backup:list` | `make db-backup-list` |
| Verify backup | `mise run db:backup:verify` | `make db-backup-verify` |
| Test restore | `mise run db:restore:test` | `make db-restore-test` |
| Full restore | `mise run db:restore` | `make db-restore` |
| Backup rotation | `mise run db:backup:rotate` | `make db-backup-rotate` |
| Backup stats | `mise run db:backup:stats` | `make db-backup-stats` |
| Redis shell | `mise run redis:shell` | `make redis-shell` |

## 🛠️ Development Commands

| Action | Command |
|--------|---------|
| Start frontend | `mise run dev:frontend` or `make dev-frontend` |
| Start backend | `mise run dev:backend` or `make dev-backend` |
| View project graph | `cd nexo-prj && nx graph` |
| Build affected | `cd nexo-prj && nx affected --target=build` |
| Test affected | `cd nexo-prj && nx affected --target=test` |
| Lint affected | `cd nexo-prj && nx affected --target=lint` |

## 🌐 Service URLs

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:3001 | - |
| GraphQL Playground | http://localhost:3001/graphql | - |
| Keycloak | http://localhost:8080 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3002 | admin/admin |
| **pgAdmin** | **http://localhost:5050** | **admin@nexo.local/admin** |
| **RedisInsight** | **http://localhost:5540** | - |
| PostgreSQL | localhost:5432 | nexo_user/nexo_password |
| Redis | localhost:6379 | - |

## 🔍 Troubleshooting

### Services won't start
```bash
docker info                    # Check Docker is running
mise run docker:clean         # Clean and restart
mise run docker:up
```

### Tests failing
```bash
mise run test:docker:health   # Check service health
mise run docker:logs          # View all logs
```

### Port conflicts
```bash
docker ps                     # Check running containers
# Edit docker/docker-compose.yml to change ports
```

### Permission errors
```bash
sudo usermod -aG docker $USER  # Add user to docker group
# Then logout and login again
```

## 📚 Documentation

- `README.md` - Main documentation
- `ARCHITECTURE.md` - System architecture
- `docs/TESTING.md` - Comprehensive testing guide
- `docs/docker.md` - Docker documentation

## 🎯 Common Workflows

### New Feature Development
```bash
git checkout -b ft/my-feature
mise run test:quick          # Validate environment
# ... make changes ...
cd nexo-prj && nx affected --target=test
mise run test:all            # Full validation
git commit -m "feat: my feature"
```

### Before Committing
```bash
mise run test:all            # Run all tests
cd nexo-prj && nx format:write   # Format code
cd nexo-prj && nx affected --target=lint  # Lint changes
```

### Debug Services
```bash
mise run docker:ps           # List running containers
mise run docker:logs         # View all logs
mise run logs:frontend       # View specific service
mise run db:shell           # Connect to database
mise run redis:shell        # Connect to Redis
```

### Clean Everything
```bash
mise run docker:clean        # Clean Docker resources
mise run clean:all          # Clean everything
```

## ⚡ Quick Tips

1. **Use `mise run test:quick`** during development
2. **Run `mise run test:all`** before commits
3. **Check `mise run urls`** to find service URLs
4. **Use `mise tasks`** to see all available commands
5. **Use `make help`** for Make alternative

## 🆘 Get Help

```bash
mise tasks                   # List all MISE tasks
make help                    # List all Make targets
```

---

**Print this and keep it handy!** 📌
