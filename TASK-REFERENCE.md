# Task Runner Quick Reference

This is your **cheat sheet** for running tasks across all 4 task runners. All commands do the same thing!

## 📋 Task Mapping Table

| Task | MISE | Just | Make | npm/pnpm |
|------|------|------|------|----------|
| **Setup & Installation** |
| Initial setup | `mise run test-setup` | `just setup` | `make setup` | `pnpm install` |
| Install deps | `mise run test-install` | `just install` | `make install` | `pnpm install` |
| **Development** |
| Dev server | `mise run dev` | `just dev` | `make dev` | `pnpm run dev` |
| Dev + tests | `mise run test-dev` | `just dev-test` | `make test-watch` | `pnpm run test:watch` |
| All servers | `mise run test-dev-all` | `just dev-all` | `make dev-all` | `pnpm run serve:all` |
| **Testing - Unit** |
| Run tests | `mise run test-unit` | `just test` | `make test` | `pnpm run test` |
| Watch mode | `mise run test-unit-watch` | `just test-watch` | `make test-watch` | `pnpm run test:watch` |
| Coverage | `mise run test-unit-coverage` | `just test-coverage` | `make test-coverage` | `pnpm run test:coverage` |
| Test UI | - | `just test-ui` | - | `pnpm run test:ui` |
| **Testing - E2E** |
| E2E tests | `mise run test-e2e` | `just e2e` | `make e2e` | `pnpm run e2e` |
| E2E UI | `mise run test-e2e-ui` | `just e2e-ui` | `make e2e-ui` | `pnpm run e2e:ui` |
| E2E headed | - | `just e2e-headed` | - | `pnpm run e2e:headed` |
| E2E debug | `mise run test-debug-e2e` | `just e2e-debug` | `make debug-e2e` | - |
| **Code Quality** |
| Lint | `mise run test-lint` | `just lint` | `make lint` | `pnpm run lint` |
| Lint + fix | - | `just lint-fix` | - | `pnpm run lint:fix` |
| Typecheck | `mise run test-typecheck` | `just typecheck` | `make typecheck` | `pnpm run typecheck` |
| Format | - | `just format` | - | `pnpm run format` |
| Format check | - | `just format-check` | - | `pnpm run format:check` |
| **Build** |
| Build app | `mise run test-build` | `just build` | `make build` | `pnpm run build` |
| Build all | - | `just build-all` | `make build` | `pnpm run build:all` |
| Build prod | - | `just build-prod` | - | - |
| Build deps | `mise run test-build-deps` | - | `make build-deps` | - |
| **Health Checks** |
| Quick check | `mise run check` | `just check` | `make check` | `pnpm run check` |
| Full check | `mise run test-all` | `just check-full` | `make all` | - |
| CI pipeline | `mise run ci` | `just ci` | `make ci` | `pnpm run ci` |
| **Cleanup** |
| Clean | `mise run test-clean` | `just clean` | `make clean` | `pnpm run clean` |
| Deep clean | - | `just clean-deep` | - | - |
| Reset all | `mise run test-reset` | `just reset` | `make reset` | - |
| **Components** |
| Test shared | `mise run test-components` | `just test-components` | `make test-components` | - |
| Test app | `mise run test-app` | `just test-app` | `make test-app` | - |
| **Debug** |
| Debug unit | `mise run test-debug-unit` | `just debug-unit` | `make debug-unit` | - |
| Debug E2E | `mise run test-debug-e2e` | `just debug-e2e` | `make debug-e2e` | - |
| **Performance** |
| Perf tests | - | `just perf` | `make perf` | - |
| Perf build | `mise run test-perf-build` | `just perf-build` | `make perf-build` | - |
| Perf test | `mise run test-perf-test` | `just perf-test` | `make perf-test` | - |
| **Docker** |
| Build image | - | `just docker-build` | - | - |
| Build dev | - | `just docker-build-dev` | - | - |
| Run container | - | `just docker-run` | - | - |
| Run dev | - | `just docker-run-dev` | - | - |
| Stop | - | `just docker-stop` | - | - |
| **Dependencies** |
| Check updates | - | `just deps` | `make deps` | - |
| Update deps | - | `just deps-update` | `make deps-update` | - |
| Audit deps | - | `just deps-audit` | - | - |
| **NX Workspace** |
| Show graph | - | `just graph` | - | `pnpm run graph` |
| Show affected | - | `just affected` | - | `pnpm run affected` |
| Test affected | - | `just affected-test` | - | `pnpm run affected:test` |
| Build affected | - | - | - | `pnpm run affected:build` |
| **Information** |
| List tasks | `mise tasks` | `just --list` | `make help` | `pnpm run` |
| Project info | - | `just info` | `make info` | - |
| Version info | - | `just version` | - | - |

---

## 🎯 Which Task Runner Should I Use?

### Use **MISE** when:
- ✅ Managing tool versions (Node, pnpm, etc.)
- ✅ Setting up development environment
- ✅ Running comprehensive test suites
- ✅ Need environment variable management
- **Best for**: Environment setup, CI pipelines

### Use **Just** when:
- ✅ You like modern, clean syntax
- ✅ Need powerful recipe features
- ✅ Want the most comprehensive command set
- ✅ Docker integration needed
- **Best for**: Daily development workflow

### Use **Make** when:
- ✅ Universal compatibility required
- ✅ Running in CI/CD environments
- ✅ Team familiar with Make
- ✅ Need traditional build system
- **Best for**: CI/CD, universal compatibility

### Use **npm/pnpm** when:
- ✅ IDE integration (VS Code tasks)
- ✅ Simple, standard workflow
- ✅ No additional tools installed
- ✅ JavaScript/Node ecosystem standard
- **Best for**: IDE integration, simplicity

---

## 🚀 Common Workflows

### 1. Daily Development
```bash
# Pick your favorite!
mise run dev      # MISE
just dev         # Just
make dev         # Make
pnpm run dev     # pnpm

# All start the development server at http://localhost:4200
```

### 2. Before Committing
```bash
# Quick health check - all equivalent:
mise run check
just check
make check
pnpm run check

# All run: lint → typecheck → unit tests
```

### 3. Full Testing
```bash
# Complete test suite - all equivalent:
mise run test-all
just check-full
make all
pnpm run ci

# All run: lint → typecheck → unit → e2e → build
```

### 4. CI Pipeline
```bash
# CI simulation - all equivalent:
mise run ci
just ci
make ci
pnpm run ci

# All run: lint → typecheck → coverage → e2e → build
```

### 5. Debugging
```bash
# Debug tests - pick one:
mise run test-debug-unit
just debug-unit
make debug-unit

# Debug E2E - pick one:
mise run test-debug-e2e
just e2e-debug
make debug-e2e
```

---

## 📊 Feature Comparison

| Feature | MISE | Just | Make | pnpm |
|---------|------|------|------|------|
| Total Commands | 30+ | 60+ | 40+ | 25+ |
| Tool Management | ✅ | ❌ | ❌ | ❌ |
| Env Variables | ✅ | ❌ | ❌ | ❌ |
| Modern Syntax | ✅ | ✅ | ❌ | ✅ |
| Docker Tasks | ❌ | ✅ | ❌ | ❌ |
| Performance | ⚡⚡ | ⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| Dependencies | ✅ | ✅ | ✅ | ✅ |
| IDE Integration | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Universal | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Documentation | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔍 Finding the Right Command

### I want to...

**Start development**
- MISE: `mise run dev`
- Just: `just dev`
- Make: `make dev`
- pnpm: `pnpm run dev`

**Run all tests**
- MISE: `mise run test-all`
- Just: `just check-full`
- Make: `make all`
- pnpm: `pnpm run ci`

**Check code quality**
- MISE: `mise run check`
- Just: `just check`
- Make: `make check`
- pnpm: `pnpm run check`

**Build for production**
- MISE: `mise run test-build`
- Just: `just build-prod`
- Make: `make build`
- pnpm: `pnpm run build`

**Clean everything**
- MISE: `mise run test-reset`
- Just: `just reset`
- Make: `make reset`
- pnpm: `pnpm run clean && pnpm install`

**See all available commands**
- MISE: `mise tasks`
- Just: `just --list`
- Make: `make help`
- pnpm: `pnpm run`

---

## 💡 Pro Tips

### Combine Tools
```bash
# Use MISE for environment, Just for tasks
mise install          # Setup environment
just dev             # Run development

# Use Make in CI, Just locally
make ci              # CI pipeline
just dev-test        # Local development
```

### Create Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias nd='just dev'           # Nexo dev
alias nt='just test'          # Nexo test
alias nc='just check'         # Nexo check
alias nci='just ci'           # Nexo CI
```

### IDE Integration
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev Server",
      "type": "npm",
      "script": "dev",
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "npm",
      "script": "test",
      "problemMatcher": []
    }
  ]
}
```

---

## 📝 Notes

- All task runners are **equally capable** for most tasks
- Choose based on **your preference** and **team standards**
- **MISE** is required for environment setup regardless of which runner you use
- Commands are **synchronized** - they all do the same thing
- See [TASKS.md](TASKS.md) for detailed documentation

---

**Choose your favorite and start building! 🚀**
