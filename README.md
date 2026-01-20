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
