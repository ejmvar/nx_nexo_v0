# NEXO Frontend - Task Runner Guide

This project supports **4 different task runners** for maximum flexibility. Choose the one that fits your workflow:

## 🚀 Quick Reference

| Task | MISE | Just | Make | npm |
|------|------|------|------|-----|
| **Development** |
| Start dev server | `mise run dev` | `just dev` | `make dev` | `pnpm run dev` |
| Install deps | `mise run test-install` | `just install` | `make install` | `pnpm install` |
| **Testing** |
| Run tests | `mise run test-unit` | `just test` | `make test` | `pnpm run test` |
| Watch tests | `mise run test-unit-watch` | `just test-watch` | `make test-watch` | `pnpm run test:watch` |
| Coverage | `mise run test-unit-coverage` | `just test-coverage` | `make test-coverage` | `pnpm run test:coverage` |
| E2E tests | `mise run test-e2e` | `just e2e` | `make e2e` | `pnpm run e2e` |
| E2E UI mode | `mise run test-e2e-ui` | `just e2e-ui` | `make e2e-ui` | `pnpm run e2e:ui` |
| **Quality** |
| Lint | `mise run test-lint` | `just lint` | `make lint` | `pnpm run lint` |
| Type check | `mise run test-typecheck` | `just typecheck` | `make typecheck` | `pnpm run typecheck` |
| Format | - | `just format` | - | `pnpm run format` |
| Health check | `mise run check` | `just check` | `make check` | `pnpm run check` |
| **Build** |
| Build app | `mise run test-build` | `just build` | `make build` | `pnpm run build` |
| Build all | - | `just build-all` | `make build` | `pnpm run build:all` |
| **CI/CD** |
| CI pipeline | `mise run ci` | `just ci` | `make ci` | `pnpm run ci` |
| **Cleanup** |
| Clean | `mise run test-clean` | `just clean` | `make clean` | `pnpm run clean` |
| Reset all | `mise run test-reset` | `just reset` | `make reset` | - |

---

## 📖 Detailed Documentation

### 1. MISE (Recommended for Dev Environment)

**Best for**: Managing tools, environment setup, and comprehensive testing

```bash
# Setup
mise install
mise doctor

# View all tasks
mise tasks

# Common workflows
mise run test-setup          # Setup testing environment
mise run dev                 # Quick dev start
mise run check               # Quick health check (lint + typecheck + test)
mise run test-all            # Complete test suite
mise run test-ci             # CI pipeline simulation

# Component testing
mise run test-components     # Test shared-ui library
mise run test-app           # Test main app

# Debugging
mise run test-debug-unit    # Debug unit tests
mise run test-debug-e2e     # Debug E2E tests

# Performance
mise run test-perf-build    # Benchmark build
mise run test-perf-test     # Benchmark tests
```

**Configuration**: [.mise.toml](.mise.toml)

---

### 2. Just (Recommended for Task Execution)

**Best for**: Modern, clean syntax with powerful features

```bash
# View all recipes
just --list
just list

# Setup & Installation
just setup                  # Initial project setup
just install               # Install dependencies
just install-verify        # Install + verify

# Development
just dev                   # Start dev server
just dev-all              # Start all servers
just dev-test             # Dev + watch tests

# Testing
just test                  # Unit tests
just test-watch           # Watch mode
just test-coverage        # With coverage
just test-ui              # With UI
just test-project <name>  # Specific project

just e2e                   # E2E tests
just e2e-ui               # E2E with UI
just e2e-headed           # E2E headed
just e2e-debug            # E2E debug

# Code Quality
just lint                  # ESLint
just lint-fix             # ESLint + fix
just typecheck            # TypeScript
just format               # Prettier
just format-check         # Check formatting

# Build
just build                 # Build app
just build-all            # Build all projects
just build-prod           # Production build (lint + typecheck + test + build)
just build-affected       # Build affected only

# Health Checks
just check                 # Full check (lint + typecheck + test)
just check-quick          # Quick check (lint + typecheck)
just check-full           # Full validation (all + e2e + build)

# CI/CD
just ci                    # Full CI pipeline
just ci-affected          # CI for affected projects

# Docker
just docker-build         # Build production image
just docker-build-dev     # Build dev image
just docker-run          # Run container
just docker-run-dev      # Run dev container
just docker-stop         # Stop containers

# Cleanup
just clean                # Clean artifacts
just clean-deep          # Deep clean (+ node_modules)
just reset               # Full reset

# Utilities
just deps                 # Check updates
just deps-update         # Update deps
just deps-audit          # Security audit
just graph               # Dependency graph
just affected            # Show affected projects
just info                # Project info
just version             # Version info
```

**Configuration**: [Justfile](Justfile)

---

### 3. Make (Recommended for CI/CD)

**Best for**: Universal compatibility, CI/CD pipelines

```bash
# View all targets
make help

# Quick Start
make setup                 # Initial setup
make dev                   # Development server
make check                 # Health check
make all                   # Complete test suite

# Testing Phases
make lint                  # Code quality
make typecheck            # Type checking
make test                 # Unit tests
make e2e                  # E2E tests
make build                # Production build

# Development Cycle
make dev                   # Dev server
make test-watch           # Watch mode
make clean                # Clean artifacts
make reset                # Full reset

# CI/CD
make ci                    # CI pipeline
make ci-docker            # Docker-based CI

# Reporting
make coverage             # Coverage reports
make perf                 # Performance tests

# Components
make test-components      # Test shared-ui
make test-app            # Test main app

# Debugging
make debug-unit          # Debug unit tests
make debug-e2e          # Debug E2E tests

# Utilities
make deps                # Check updates
make deps-update        # Update deps
make info               # Project info
```

**Configuration**: [Makefile](Makefile)

---

### 4. npm/pnpm Scripts

**Best for**: IDE integration, simple commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm install             # Install dependencies

# Testing
pnpm run test            # Unit tests
pnpm run test:watch      # Watch mode
pnpm run test:coverage   # With coverage
pnpm run test:ui         # With UI

pnpm run e2e             # E2E tests
pnpm run e2e:ui          # E2E UI mode
pnpm run e2e:headed      # E2E headed

# Code Quality
pnpm run lint            # ESLint
pnpm run lint:fix        # ESLint + fix
pnpm run typecheck       # TypeScript
pnpm run format          # Prettier
pnpm run format:check    # Check formatting

# Build
pnpm run build           # Build app
pnpm run build:all       # Build all projects

# Health & CI
pnpm run check           # Health check
pnpm run ci              # CI pipeline

# Nx Commands
pnpm run graph           # Dependency graph
pnpm run affected        # Affected projects
pnpm run affected:test   # Test affected
pnpm run affected:build  # Build affected

# Utilities
pnpm run clean           # Clean artifacts
pnpm run serve:all       # All dev servers
```

**Configuration**: [nexo-prj/package.json](nexo-prj/package.json)

---

## 🎯 Workflow Recommendations

### Daily Development
```bash
# Choose your preferred tool
just dev          # or: make dev, mise run dev, pnpm run dev
just check        # or: make check, mise run check, pnpm run check
```

### Before Commit
```bash
# Full validation
just check-full   # or: make ci, mise run test-ci, pnpm run ci
```

### CI/CD Pipeline
```bash
# Most compatible
make ci
```

### Environment Setup
```bash
# Tool management
mise install
mise run test-setup
```

---

## 🔧 Tool Installation

### MISE (Modern Tool Management)
```bash
curl https://mise.run | sh
mise install
```

### Just (Command Runner)
```bash
# macOS
brew install just

# Linux
cargo install just

# Or download from: https://github.com/casey/just
```

### Make (Usually Pre-installed)
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS (via Xcode)
xcode-select --install
```

---

## 📁 Task File Locations

- **MISE**: [.mise.toml](.mise.toml)
- **Just**: [Justfile](Justfile)
- **Make**: [Makefile](Makefile)
- **npm**: [nexo-prj/package.json](nexo-prj/package.json)

---

## 🆘 Troubleshooting

### Task not found?
```bash
# List available tasks
mise tasks          # MISE
just --list        # Just
make help          # Make
pnpm run           # npm scripts
```

### Tool not installed?
```bash
# Check installations
mise doctor        # MISE
just --version     # Just
make --version     # Make
pnpm --version     # pnpm
```

### Clean start needed?
```bash
# Choose one
just reset         # Just
make reset        # Make
mise run test-reset # MISE
```

---

## 🎨 Customization

All task files are fully customizable:

1. **Add new tasks**: Edit the respective configuration file
2. **Modify existing tasks**: Update task definitions
3. **Create shortcuts**: Add aliases in your shell config

Example shell alias:
```bash
# Add to ~/.bashrc or ~/.zshrc
alias nexo-dev='just dev'
alias nexo-test='just test'
alias nexo-ci='just ci'
```

---

## 📚 Additional Resources

- **MISE**: https://mise.jdx.dev
- **Just**: https://just.systems
- **Make**: https://www.gnu.org/software/make/
- **Nx**: https://nx.dev
- **pnpm**: https://pnpm.io

---

**Choose your favorite tool and start building! 🚀**
