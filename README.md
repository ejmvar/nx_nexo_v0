<<<<<<< HEAD
# NEXO Frontend - Multi-Portal CRM System

[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen)](https://github.com/your-repo/actions)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen)](https://github.com/your-repo/coverage)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)

A comprehensive multi-portal Customer Relationship Management system built with Next.js 16, React 19, and NX monorepo. Supports employees, clients, suppliers, and professionals with role-based access.

## 🚀 Quick Start (3 minutes to running)

### Prerequisites
- **MISE** installed: `curl https://mise.jdx.dev/install.sh | bash`
- **Node.js** (managed by MISE)
- **pnpm** (managed by MISE)

### 1. Environment Setup
```bash
# Install MISE and setup environment
mise install
mise doctor

# Install Nx CLI globally
mise run 100-000-001-nx-pnpm-install
```

### 2. Project Setup
```bash
# Install all dependencies
mise run test-install

# Quick health check
mise run check
```

### 3. Start Development
```bash
# Start development server - Choose your preferred tool:
mise run dev       # MISE
just dev          # Just
make dev          # Make
pnpm run dev      # npm scripts

# All commands do the same thing!
```

**🎉 You're done!** Visit `http://localhost:4200` to see the portal selection page.

---

## 🛠️ Task Runners - Choose Your Favorite!

This project supports **4 task runners** for maximum flexibility:

| Tool | Best For | Quick Example |
|------|----------|---------------|
| **MISE** | Environment management & testing | `mise run test-all` |
| **Just** | Modern syntax, powerful features | `just ci` |
| **Make** | Universal compatibility, CI/CD | `make check` |
| **pnpm** | IDE integration, simplicity | `pnpm run test` |

**📖 See [TASKS.md](TASKS.md) for complete task runner guide**

### Quick Command Reference

```bash
# Development
mise run dev  |  just dev  |  make dev  |  pnpm run dev

# Testing
mise run test-unit  |  just test  |  make test  |  pnpm run test

# Linting
mise run test-lint  |  just lint  |  make lint  |  pnpm run lint

# Health Check
mise run check  |  just check  |  make check  |  pnpm run check

# CI Pipeline
mise run ci  |  just ci  |  make ci  |  pnpm run ci
```

---

## 🧪 Testing Strategy - Every Step Tested

### Development Cycle Testing Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `mise run test-setup` | Environment verification | First time setup |
| `mise run test-install` | Install dependencies | After cloning |
| `mise run test-lint` | Code quality checks | Before commits |
| `mise run test-typecheck` | TypeScript validation | During development |
| `mise run test-unit` | Unit tests | Feature development |
| `mise run test-e2e` | End-to-end tests | Integration testing |
| `mise run test-build` | Production build | Pre-deployment |
| `mise run test-all` | Complete test suite | CI/CD pipeline |

### Quick Commands (Makefile)

```bash
# Quick start
make setup     # Initial setup
make dev       # Development server
make check     # Health check (lint + types + unit)
make all       # Full test suite
make ci        # CI simulation

# Testing phases
make lint      # ESLint
make typecheck # TypeScript
make test      # Unit tests
make e2e       # E2E tests
make build     # Production build

# Development
make test-watch  # Watch mode
make clean       # Clean artifacts
make reset       # Full reset
```

### CI/CD Pipeline Simulation

```bash
# Run complete CI pipeline locally
mise run ci
# or
make ci

# This runs: lint → typecheck → test-coverage → e2e → build
```

---

## 📁 Project Structure

```
nexo-prj/
├── apps/
│   ├── nexo-prj/              # Main Next.js application
│   │   ├── src/app/           # App Router pages
│   │   │   ├── page.tsx       # Portal selection
│   │   │   ├── employee/      # Employee portal
│   │   │   ├── client/        # Client portal
│   │   │   ├── supplier/      # Supplier portal
│   │   │   └── professional/  # Professional portal
│   │   ├── specs/             # Unit tests
│   │   └── public/            # Static assets
│   └── nexo-prj-e2e/          # E2E tests (Playwright)
├── libs/
│   └── shared-ui/             # Shared UI components
├── nx.json                    # NX configuration
├── package.json               # Workspace dependencies
└── tsconfig.base.json         # TypeScript config
```

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **NX 22.3.3** - Monorepo management

### UI & Styling
- **MUI v7** - Component library
- **Tailwind CSS** - Utility classes
- **Emotion** - CSS-in-JS

### Testing Stack
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Testing Library** - Component testing
- **Jest** - Test runner (via NX)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **MISE** - Environment management
- **pnpm** - Package management

### Features Implemented
- ✅ **NextAuth.js** - Authentication system
- ✅ **React Hook Form** - Form management
- ✅ **TanStack Table** - Data tables
- ✅ **Recharts** - Data visualization
- ✅ **PDF.js** - Document viewing
- ✅ **Multi-portal routing** - Role-based portals

---

## 🧪 Testing Coverage

### Unit Tests (`specs/`)
- Component rendering tests
- Hook testing
- Utility function tests
- Business logic validation

### E2E Tests (`apps/nexo-prj-e2e/`)
- Portal navigation
- User interactions
- Form submissions
- Authentication flows

### Test Commands
```bash
# Unit tests
mise run test-unit          # Run all unit tests
mise run test-unit-watch    # Watch mode
mise run test-unit-coverage # With coverage

# E2E tests
mise run test-e2e          # Headless mode
mise run test-e2e-ui       # With UI

# Component specific
mise run test-app          # Main app tests
mise run test-components   # Shared UI tests
```

---

## 🚀 Development Workflow

### 1. Daily Development
```bash
# Start with health check
make check

# Work on features
make dev

# Test your changes
make test

# Before commit
make lint && make typecheck
```

### 2. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-portal

# Development cycle
make dev          # Work
make test         # Test
make check        # Verify
make build        # Build check

# Commit
git add .
git commit -m "feat: add new portal functionality"
```

### 3. Pre-deployment
```bash
# Full verification
make all

# Performance check
make perf

# CI simulation
make ci
```

---

## 🔧 Troubleshooting

### Common Issues

**MISE not found**
```bash
curl https://mise.jdx.dev/install.sh | bash
source ~/.bashrc
```

**Dependencies issues**
```bash
make reset  # Full clean reinstall
```

**Port already in use**
```bash
lsof -ti:4200 | xargs kill -9
make dev
```

**Test failures**
```bash
make clean
make test  # Re-run tests
```

### Debug Mode
```bash
# Debug unit tests
make debug-unit

# Debug E2E tests
make debug-e2e
```

---

## 📊 Performance & Quality

### Code Quality Gates
- **ESLint**: Zero warnings/errors
- **TypeScript**: Strict mode enabled
- **Test Coverage**: >90% target
- **Build**: Clean production builds

### Performance Benchmarks
- **Build Time**: < 2 seconds (incremental)
- **Test Time**: < 30 seconds (full suite)
- **Bundle Size**: Optimized with NX

---

## 🤝 Contributing

### Onboarding New Developers
1. **Setup**: `make setup` (3 minutes)
2. **Verify**: `make check` (1 minute)
3. **Explore**: `make dev` (immediate feedback)
4. **Learn**: `make help` (comprehensive guide)

### Code Standards
- **Commits**: Conventional commits
- **PRs**: Include tests and documentation
- **Reviews**: Automated + manual review

### Testing Requirements
- **Unit Tests**: All new functions/components
- **E2E Tests**: All new user flows
- **Coverage**: Maintain >90%
- **CI**: All checks must pass

---

## 📈 CI/CD Pipeline

### Automated Checks
```yaml
# Simulated CI pipeline (run with: make ci)
- Code Quality (ESLint)
- Type Safety (TypeScript)
- Unit Tests (Vitest)
- E2E Tests (Playwright)
- Build Verification (NX)
- Performance Tests
```

### Deployment Ready
- **Docker**: Containerized builds
- **Static Export**: CDN deployment ready
- **Multi-environment**: Dev/Staging/Prod configs

---

## 🎯 Success Metrics

- ✅ **Setup Time**: < 5 minutes
- ✅ **Test Feedback**: < 30 seconds
- ✅ **Build Time**: < 2 minutes
- ✅ **Onboarding**: Self-service
- ✅ **Quality Gates**: Automated
- ✅ **Documentation**: Comprehensive

---

## 📚 Additional Resources

- [NX Documentation](https://nx.dev/)
- [Next.js Guide](https://nextjs.org/docs)
- [MUI Components](https://mui.com/)
- [Playwright Testing](https://playwright.dev/)
- [MISE Tasks](https://mise.jdx.dev/tasks/)

---

**🎉 Happy coding!** The NEXO frontend is designed for rapid development with comprehensive testing at every step.
=======
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

### Infrastructure Tests

```bash
# Test Helm charts
mise run test:helm:validate
make test-helm-validate

# Test monitoring stack
mise run test:monitoring
make test-monitoring

# Test backend health
mise run test:backend:health
make test-backend-health

# Test database connectivity
mise run test:backend:database
make test-backend-database
```

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

### Main Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001 (GraphQL: http://localhost:3001/graphql)
- **Keycloak**: http://localhost:8080

### Monitoring
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002

### Database Admin Tools
- **pgAdmin**: http://localhost:5050 (admin@nexo.local / admin)
- **RedisInsight**: http://localhost:5540

### Database Connections
- **PostgreSQL**: localhost:5432 (nexo_user / nexo_password)
- **Redis**: localhost:6379

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference card
- [docs/TESTING.md](docs/TESTING.md) - Comprehensive testing guide
- [docs/ADVANCED_MONITORING.md](docs/ADVANCED_MONITORING.md) - Monitoring, alerts, and APM
- [docs/BACKUP_AUTOMATION.md](docs/BACKUP_AUTOMATION.md) - Database backup and recovery
- [docs/DATABASE_ADMIN_TOOLS.md](docs/DATABASE_ADMIN_TOOLS.md) - Database admin UI guide
- [docs/docker.md](docs/docker.md) - Docker setup and configuration
- [helm/README.md](helm/README.md) - Helm charts for Kubernetes deployment
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

## 📊 Monitoring & Operations

### Metrics & Dashboards
- **Grafana**: Metrics visualization (http://localhost:3002)
  - System Overview Dashboard
  - Backend API Metrics Dashboard
  - Database Metrics Dashboard
- **Prometheus**: Metrics collection (http://localhost:9090)
- **Jaeger**: Distributed tracing (http://localhost:16686)
- **OTEL Collector**: APM and telemetry (http://localhost:55679)
- Default credentials: admin/admin

See [ADVANCED_MONITORING.md](docs/ADVANCED_MONITORING.md) for complete monitoring guide.

### Database Administration
- **pgAdmin**: PostgreSQL management (http://localhost:5050)
- **RedisInsight**: Redis monitoring (http://localhost:5540)
- See [DATABASE_ADMIN_TOOLS.md](docs/DATABASE_ADMIN_TOOLS.md)

### Backup & Recovery
```bash
# Create backup
mise run db:backup

# Test restore
mise run db:restore:test

# Full restore (DESTRUCTIVE)
mise run db:restore

# View backup statistics
mise run db:backup:stats
```

See [BACKUP_AUTOMATION.md](docs/BACKUP_AUTOMATION.md) for complete backup guide.

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
>>>>>>> ft/docker
