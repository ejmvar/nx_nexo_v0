# NEXO CRM - Modern Customer Relationship Management System

A comprehensive, cloud-native CRM system built with modern technologies and best practices.

## 🚀 Quick Start

### For New Developers

```bash
# Setup entire development environment (one command!)
bash scripts/setup-dev.sh

# Or using MISE
mise run setup

# Or using Make
make setup
```

This will:
- ✅ Check all prerequisites (Docker, pnpm, Nx)
- ✅ Validate configurations
- ✅ Install dependencies
- ✅ Start Docker services
- ✅ Run health checks

### Daily Development Workflow

```bash
# Start development environment
mise run dev        # or: make dev

# Run all tests
mise run test:all   # or: make test-all

# View service URLs
mise run urls       # or: make urls

# Stop environment
mise run dev:stop   # or: make dev-stop
```

## 📋 Prerequisites

- **Docker** 24.0+ with Docker Compose
- **Node.js** 22.6.0+
- **pnpm** 9.13.2+
- **Nx** 20.2.2+ (optional, will be installed)
- **MISE** (optional but recommended) - [Install](https://mise.jdx.dev/getting-started.html)
- **Make** (optional alternative to MISE)

## 🏗️ Architecture

NEXO CRM follows a microservices architecture with:

- **Frontend**: Next.js 15 (App Router) with React 19
- **Backend**: NestJS with GraphQL
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Auth**: Keycloak (OAuth 2.0 / OpenID Connect)
- **Monitoring**: Prometheus + Grafana
- **Container Orchestration**: Docker Compose (dev) / Kubernetes (prod)

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 🧪 Testing

**Testing Philosophy**: Every step must be testable and simple.

### Quick Tests (30 seconds)

```bash
mise run test:quick
# or
make test-quick
```

Validates:
- Docker Compose configuration
- Kubernetes manifests
- Nx installation

### Full Test Suite (5 minutes)

```bash
mise run test:all
# or
make test-all
```

Runs:
- ✅ Configuration validation
- ✅ Docker services health checks
- ✅ Service connectivity tests
- ✅ Application linting
- ✅ Unit tests
- ✅ Build verification

### Continuous Testing

```bash
# Watch mode for development
cd nexo-prj
nx affected --target=test --watch
```

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guide.

## 📦 Project Structure

```
.
├── .github/workflows/     # CI/CD pipelines
├── docker/               # Docker Compose configuration
│   └── docker-compose.yml
├── k8s/                  # Kubernetes manifests
├── nexo-prj/            # Nx monorepo workspace
│   ├── apps/
│   │   ├── employee-portal/    # Frontend application
│   │   └── api-gateway/        # Backend API (to be added)
│   └── libs/                   # Shared libraries
├── scripts/             # Automation scripts
│   ├── setup-dev.sh           # Development setup
│   ├── test-docker-health.sh  # Health checks
│   ├── validate-k8s.sh        # K8s validation
│   └── ci-test.sh             # CI/CD pipeline
├── docs/                # Documentation
│   ├── TESTING.md            # Testing guide
│   └── docker.md             # Docker guide
├── .mise.toml           # MISE task definitions
├── Makefile             # Make targets (alternative)
└── README.md            # This file
```

## 🛠️ Available Commands

### MISE Tasks (Recommended)

```bash
# View all available tasks
mise tasks

# Development
mise run dev                    # Start dev environment
mise run dev:frontend          # Start frontend only
mise run dev:backend           # Start backend only
mise run dev:stop              # Stop environment

# Docker
mise run docker:up             # Start services
mise run docker:down           # Stop services
mise run docker:logs           # View logs
mise run docker:ps             # List containers
mise run docker:clean          # Clean resources

# Testing
mise run test:all              # All tests
mise run test:quick            # Quick validation
mise run test:docker:health    # Health checks
mise run k8s:validate          # Validate K8s manifests

# Utilities
mise run urls                  # Show service URLs
mise run db:shell             # PostgreSQL shell
mise run redis:shell          # Redis CLI
mise run clean:all            # Clean everything
```

### Make Targets (Alternative)

```bash
# View all available targets
make help

# Same commands as MISE, with hyphenated names
make dev
make test-all
make docker-up
make urls
```

### Direct Scripts

```bash
# Run scripts directly
bash scripts/setup-dev.sh
bash scripts/test-docker-health.sh
bash scripts/validate-k8s.sh
bash scripts/ci-test.sh
```

## 🌐 Service URLs

After starting with `mise run dev` or `make dev`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001 (GraphQL: http://localhost:3001/graphql)
- **Keycloak**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [docs/TESTING.md](docs/TESTING.md) - Comprehensive testing guide
- [docs/docker.md](docs/docker.md) - Docker setup and configuration
- [PROMPTS/](PROMPTS/) - Development prompts and phases

## 🔧 Development

### Adding a New Feature

1. Create feature branch:
   ```bash
   git checkout -b ft/your-feature
   ```

2. Run tests before starting:
   ```bash
   mise run test:quick
   ```

3. Develop your feature in `nexo-prj/`

4. Test your changes:
   ```bash
   cd nexo-prj
   nx affected --target=test
   nx affected --target=lint
   ```

5. Run full test suite:
   ```bash
   mise run test:all
   ```

6. Commit and push:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin ft/your-feature
   ```

### Working with Nx

```bash
cd nexo-prj

# Generate new application
nx g @nx/next:app my-app

# Generate new library
nx g @nx/js:lib my-lib

# Show project graph
nx graph

# Build affected projects
nx affected --target=build

# Test affected projects
nx affected --target=test
```

## 🐳 Docker Commands

### Development

```bash
# Start all services
mise run docker:up

# View logs (all services)
mise run docker:logs

# View specific service logs
mise run logs:frontend
mise run logs:postgres

# Execute commands in containers
mise run db:shell       # PostgreSQL
mise run redis:shell    # Redis

# Restart services
mise run docker:restart
```

### Database Operations

```bash
# Backup database
mise run db:backup

# Restore database
docker compose -f docker/docker-compose.yml exec -T postgres \
  psql -U nexo_user -d nexo_crm < backup.sql

# Reset database (WARNING: deletes all data)
mise run docker:clean
mise run docker:up
```

## ☸️ Kubernetes Deployment

### Validate Manifests

```bash
mise run k8s:validate
```

### Dry Run

```bash
mise run k8s:dry-run
```

### Deploy

```bash
mise run k8s:deploy
```

## 🔒 Security

- OAuth 2.0 / OpenID Connect authentication via Keycloak
- Role-based access control (RBAC)
- Secure secrets management
- Container security scanning (Trivy)
- Regular dependency updates

## 🚦 CI/CD

GitHub Actions workflow runs on every push:

1. **Validate** - Configuration validation
2. **Docker Tests** - Health and connectivity checks
3. **Application Tests** - Lint, test, build
4. **Security Scan** - Vulnerability scanning
5. **Integration Tests** - Full pipeline test
6. **Deploy** - Staging/Production deployment

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for pipeline configuration.

## 📊 Monitoring

- **Prometheus**: Metrics collection (http://localhost:9090)
- **Grafana**: Metrics visualization (http://localhost:3001)
- Default credentials: admin/admin

## 🐛 Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker info

# Check port conflicts
docker ps

# Clean and restart
mise run docker:clean
mise run docker:up
```

### Tests failing

```bash
# Run diagnostic tests
mise run test:all

# Check service health
mise run test:docker:health

# View logs
mise run docker:logs
```

### Permission errors

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Re-login for changes to take effect
```

See [docs/TESTING.md](docs/TESTING.md) for more troubleshooting tips.

## 🤝 Contributing

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
2. Run `mise run setup` to initialize your environment
3. Create a feature branch: `git checkout -b ft/your-feature`
4. Make your changes and test: `mise run test:all`
5. Commit using conventional commits: `feat:`, `fix:`, `docs:`, etc.
6. Push and create a pull request

## 📝 License

[Your License Here]

## 👥 Team

[Your Team Information Here]

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/nexo-crm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/nexo-crm/discussions)

---

**Made with ❤️ by the NEXO CRM Team**
