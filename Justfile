# NEXO Frontend - Just Task Runner
# ==================================
# Modern task runner with clean syntax
# Use with: just <recipe>

# Default recipe to display help
default:
    @just --list

# ===============================
# SETUP & INSTALLATION
# ===============================

# Initial project setup (MISE + dependencies)
setup:
    @echo "🔧 Setting up NEXO Frontend development environment..."
    mise install
    mise doctor
    cd nexo-prj && pnpm install
    @echo "✅ Setup complete! Run 'just dev' to start development"

# Install all dependencies
install:
    @echo "📦 Installing dependencies..."
    cd nexo-prj && pnpm install
    @echo "✅ Dependencies installed"

# Install dependencies and verify
install-verify: install
    @echo "🔍 Verifying installation..."
    cd nexo-prj && pnpm list --depth=0
    @echo "✅ Installation verified"

# ===============================
# CODE QUALITY
# ===============================

# Run ESLint on all projects
lint:
    @echo "🔍 Running ESLint..."
    cd nexo-prj && pnpm run lint
    @echo "✅ Linting complete"

# Run ESLint with auto-fix
lint-fix:
    @echo "🔧 Running ESLint with auto-fix..."
    cd nexo-prj && pnpm run lint:fix
    @echo "✅ Linting complete"

# Run TypeScript type checking
typecheck:
    @echo "🔍 Running TypeScript checks..."
    cd nexo-prj && pnpm run typecheck
    @echo "✅ Type checking complete"

# Format code with Prettier
format:
    @echo "✨ Formatting code..."
    cd nexo-prj && pnpm run format
    @echo "✅ Formatting complete"

# Check code formatting
format-check:
    @echo "🔍 Checking code formatting..."
    cd nexo-prj && pnpm run format:check
    @echo "✅ Format check complete"

# ===============================
# UNIT TESTING
# ===============================

# Run unit tests for all projects
test:
    @echo "🧪 Running unit tests..."
    cd nexo-prj && pnpm run test
    @echo "✅ Unit tests complete"

# Run unit tests in watch mode
test-watch:
    @echo "👀 Running unit tests in watch mode..."
    cd nexo-prj && pnpm run test:watch

# Run unit tests with coverage
test-coverage:
    @echo "📊 Running unit tests with coverage..."
    cd nexo-prj && pnpm run test:coverage
    @echo "✅ Coverage report generated"

# Run unit tests with UI
test-ui:
    @echo "🎨 Running unit tests with UI..."
    cd nexo-prj && pnpm run test:ui

# Test specific project
test-project PROJECT:
    @echo "🧪 Testing {{PROJECT}}..."
    cd nexo-prj && npx nx test {{PROJECT}}

# ===============================
# E2E TESTING
# ===============================

# Run end-to-end tests
e2e:
    @echo "🌐 Running E2E tests..."
    cd nexo-prj && pnpm run e2e
    @echo "✅ E2E tests complete"

# Run E2E tests with UI mode
e2e-ui:
    @echo "🎭 Running E2E tests with UI..."
    cd nexo-prj && pnpm run e2e:ui

# Run E2E tests with headed browser
e2e-headed:
    @echo "🎭 Running E2E tests with headed browser..."
    cd nexo-prj && pnpm run e2e:headed

# Run E2E tests with debugging
e2e-debug:
    @echo "🐛 Running E2E tests with debugging..."
    cd nexo-prj && npx nx e2e nexo-prj-e2e --headed --debug

# ===============================
# BUILD & DEPLOYMENT
# ===============================

# Build main application
build:
    @echo "🔨 Building application..."
    cd nexo-prj && pnpm run build
    @echo "✅ Build complete"

# Build all projects
build-all:
    @echo "🔨 Building all projects..."
    cd nexo-prj && pnpm run build:all
    @echo "✅ All builds complete"

# Build for production
build-prod: lint typecheck test build
    @echo "✅ Production build complete"

# Build affected projects only
build-affected:
    @echo "🔨 Building affected projects..."
    cd nexo-prj && pnpm run affected:build

# ===============================
# DEVELOPMENT
# ===============================

# Start development server
dev:
    @echo "🚀 Starting development server..."
    @echo "📱 Frontend will be available at: http://localhost:4200"
    cd nexo-prj && pnpm run dev

# Start all development servers
dev-all:
    @echo "🚀 Starting all development servers..."
    cd nexo-prj && pnpm run serve:all

# Development with tests watching
dev-test:
    @echo "🚀 Starting development with test watching..."
    cd nexo-prj && pnpm run dev & pnpm run test:watch

# ===============================
# CLEANUP & RESET
# ===============================

# Clean build artifacts and caches
clean:
    @echo "🧹 Cleaning build artifacts..."
    cd nexo-prj && pnpm run clean
    @echo "✅ Cleanup complete"

# Deep clean including node_modules
clean-deep: clean
    @echo "🧹 Deep cleaning (including node_modules)..."
    cd nexo-prj && rm -rf node_modules pnpm-lock.yaml
    @echo "✅ Deep cleanup complete"

# Full reset: clean + install + test all
reset: clean install check
    @echo "🔄 Full reset complete"

# ===============================
# HEALTH CHECKS
# ===============================

# Quick health check (lint + typecheck + unit tests)
check: lint typecheck test
    @echo "✅ Health check passed!"

# Quick check (lint + typecheck only)
check-quick: lint typecheck
    @echo "✅ Quick check passed!"

# Full validation check
check-full: lint typecheck test-coverage e2e build
    @echo "✅ Full validation passed!"

# ===============================
# CI/CD PIPELINE
# ===============================

# Simulate CI pipeline
ci: lint typecheck test-coverage e2e build-all
    @echo "🚀 CI pipeline completed successfully!"

# CI for affected projects only
ci-affected:
    @echo "🚀 Running CI for affected projects..."
    cd nexo-prj && pnpm run lint && pnpm run typecheck && pnpm run affected:test && pnpm run affected:e2e && pnpm run affected:build
    @echo "✅ Affected CI complete"

# ===============================
# DOCKER
# ===============================

# Build Docker image
docker-build:
    @echo "🐳 Building Docker image..."
    docker build -t nexo-frontend:latest -f nexo-prj/Dockerfile .
    @echo "✅ Docker image built"

# Build development Docker image
docker-build-dev:
    @echo "🐳 Building development Docker image..."
    docker build -t nexo-frontend:dev -f nexo-prj/Dockerfile.dev .
    @echo "✅ Development Docker image built"

# Run Docker container
docker-run:
    @echo "🐳 Running Docker container..."
    docker run -p 3000:3000 nexo-frontend:latest

# Run development Docker container
docker-run-dev:
    @echo "🐳 Running development Docker container..."
    docker-compose up

# Stop Docker containers
docker-stop:
    @echo "🐳 Stopping Docker containers..."
    docker-compose down

# ===============================
# PERFORMANCE TESTING
# ===============================

# Run performance tests
perf:
    @echo "⚡ Running performance tests..."
    cd nexo-prj && time pnpm run build > /dev/null
    cd nexo-prj && time pnpm run test > /dev/null

# Test build performance
perf-build:
    @echo "⚡ Testing build performance..."
    cd nexo-prj && time pnpm run build

# Test test execution performance
perf-test:
    @echo "⚡ Testing test performance..."
    cd nexo-prj && time pnpm run test

# ===============================
# COVERAGE & REPORTING
# ===============================

# Generate coverage reports
coverage: test-coverage
    @echo "📊 Coverage reports generated in nexo-prj/coverage/"

# View coverage in browser
coverage-view:
    @echo "📊 Opening coverage report..."
    cd nexo-prj && open coverage/lcov-report/index.html || xdg-open coverage/lcov-report/index.html

# ===============================
# DEBUGGING
# ===============================

# Debug unit tests
debug-unit:
    @echo "🐛 Debugging unit tests..."
    cd nexo-prj && npx nx test nexo-prj --inspect --inspect-brk

# Debug E2E tests
debug-e2e:
    @echo "🐛 Debugging E2E tests..."
    cd nexo-prj && npx nx e2e nexo-prj-e2e --headed --debug

# ===============================
# COMPONENT TESTING
# ===============================

# Test shared UI components
test-components:
    @echo "🧩 Testing shared components..."
    cd nexo-prj && npx nx test shared-ui --coverage

# Test main application
test-app:
    @echo "📱 Testing main application..."
    cd nexo-prj && npx nx test nexo-prj --coverage

# ===============================
# DEPENDENCY MANAGEMENT
# ===============================

# Check for dependency updates
deps:
    @echo "🔍 Checking for dependency updates..."
    cd nexo-prj && pnpm outdated

# Update dependencies
deps-update:
    @echo "⬆️ Updating dependencies..."
    cd nexo-prj && pnpm update

# Update dependencies interactively
deps-update-interactive:
    @echo "⬆️ Updating dependencies interactively..."
    cd nexo-prj && pnpm update --interactive

# Audit dependencies for security issues
deps-audit:
    @echo "🔒 Auditing dependencies..."
    cd nexo-prj && pnpm audit

# ===============================
# NX WORKSPACE
# ===============================

# Show dependency graph
graph:
    @echo "📊 Generating dependency graph..."
    cd nexo-prj && pnpm run graph

# Show affected projects
affected:
    @echo "📋 Showing affected projects..."
    cd nexo-prj && pnpm run affected

# Run affected tests
affected-test:
    @echo "🧪 Running affected tests..."
    cd nexo-prj && pnpm run affected:test

# ===============================
# INFORMATION
# ===============================

# Show project information
info:
    @echo "📋 NEXO Frontend Project Info"
    @echo "=============================="
    @echo "📁 Project: NEXO CRM Frontend"
    @echo "🏗️ Framework: Next.js 16 + React 19"
    @echo "🛠️ Build Tool: Nx Monorepo"
    @echo "📦 Package Manager: pnpm"
    @echo "🧪 Testing: Vitest + Playwright"
    @echo "🎨 UI: MUI v7 + Tailwind CSS"
    @echo ""
    @echo "📂 Structure:"
    @echo "  apps/nexo-prj/          - Main Next.js application"
    @echo "  apps/nexo-prj-e2e/      - E2E tests (Playwright)"
    @echo "  libs/shared-ui/         - Shared UI components"
    @echo ""
    @echo "🚀 Quick commands:"
    @echo "  just dev       - Start development"
    @echo "  just check     - Health check"
    @echo "  just ci        - CI simulation"

# Show version information
version:
    @echo "📦 Package versions:"
    @echo "Node: $(node --version)"
    @echo "pnpm: $(pnpm --version)"
    @echo "Nx: $(cd nexo-prj && npx nx --version)"

# List all available recipes
list:
    @just --list
