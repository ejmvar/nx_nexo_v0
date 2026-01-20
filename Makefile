# NEXO Frontend - Development & Testing Makefile
# ================================================
# Comprehensive testing for every step of the development cycle
# Use with: make <target>

.PHONY: help setup install lint typecheck test test-watch test-coverage e2e e2e-ui build dev clean reset check ci all

# ===============================
# HELP & INFO
# ===============================
help: ## Show this help message
	@echo "🚀 NEXO Frontend Development & Testing Commands"
	@echo "==============================================="
	@echo ""
	@echo "📋 QUICK START:"
	@echo "  make setup     - Initial project setup"
	@echo "  make dev       - Start development server"
	@echo "  make check     - Quick health check"
	@echo "  make all       - Run complete test suite"
	@echo ""
	@echo "🧪 TESTING PHASES:"
	@echo "  make lint      - Code quality checks"
	@echo "  make typecheck - TypeScript validation"
	@echo "  make test      - Unit tests"
	@echo "  make e2e       - End-to-end tests"
	@echo "  make build     - Production build"
	@echo ""
	@echo "🔄 DEVELOPMENT CYCLE:"
	@echo "  make dev       - Development server"
	@echo "  make test-watch- Watch mode testing"
	@echo "  make clean     - Clean artifacts"
	@echo "  make reset     - Full reset"
	@echo ""
	@echo "🚀 CI/CD:"
	@echo "  make ci        - CI pipeline simulation"
	@echo "  make ci-docker - Docker-based CI"
	@echo ""
	@echo "📊 REPORTING:"
	@echo "  make coverage  - Coverage reports"
	@echo "  make perf      - Performance tests"
	@echo ""

# ===============================
# SETUP & INSTALLATION
# ===============================
setup: ## Initial project setup (MISE + dependencies)
	@echo "🔧 Setting up NEXO Frontend development environment..."
	mise install
	mise doctor
	cd nexo-prj && pnpm install
	@echo "✅ Setup complete! Run 'make dev' to start development"

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	cd nexo-prj && pnpm install
	@echo "✅ Dependencies installed"

# ===============================
# CODE QUALITY
# ===============================
lint: ## Run ESLint on all projects
	@echo "🔍 Running ESLint..."
	cd nexo-prj && npx nx run-many --target=lint --all
	@echo "✅ Linting complete"

typecheck: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript checks..."
	cd nexo-prj && npx nx run-many --target=typecheck --all
	@echo "✅ Type checking complete"

# ===============================
# UNIT TESTING
# ===============================
test: ## Run unit tests for all projects
	@echo "🧪 Running unit tests..."
	cd nexo-prj && npx nx run-many --target=test --all
	@echo "✅ Unit tests complete"

test-watch: ## Run unit tests in watch mode
	@echo "👀 Running unit tests in watch mode..."
	cd nexo-prj && npx nx run-many --target=test --all --watch

test-coverage: ## Run unit tests with coverage
	@echo "📊 Running unit tests with coverage..."
	cd nexo-prj && npx nx run-many --target=test --all --coverage
	@echo "✅ Coverage report generated"

# ===============================
# E2E TESTING
# ===============================
e2e: ## Run end-to-end tests
	@echo "🌐 Running E2E tests..."
	cd nexo-prj && npx nx run-many --target=e2e --all
	@echo "✅ E2E tests complete"

e2e-ui: ## Run E2E tests with UI mode
	@echo "🎭 Running E2E tests with UI..."
	cd nexo-prj && npx nx e2e nexo-prj-e2e --ui

# ===============================
# BUILD & DEPLOYMENT
# ===============================
build: ## Build all projects
	@echo "🔨 Building all projects..."
	cd nexo-prj && npx nx run-many --target=build --all
	@echo "✅ Build complete"

build-deps: ## Build all dependencies
	@echo "🔗 Building dependencies..."
	cd nexo-prj && npx nx run-many --target=build-deps --all

# ===============================
# DEVELOPMENT
# ===============================
dev: ## Start development server
	@echo "🚀 Starting development server..."
	@echo "📱 Frontend will be available at: http://localhost:4200"
	cd nexo-prj && npx nx serve nexo-prj

dev-all: ## Start all development servers
	@echo "🚀 Starting all development servers..."
	cd nexo-prj && npx nx run-many --target=serve --all --parallel

# ===============================
# CLEANUP & RESET
# ===============================
clean: ## Clean build artifacts and caches
	@echo "🧹 Cleaning build artifacts..."
	cd nexo-prj && npx nx reset && rm -rf .next node_modules/.cache dist
	@echo "✅ Cleanup complete"

reset: clean install all ## Full reset: clean + install + test all
	@echo "🔄 Full reset complete"

# ===============================
# HEALTH CHECKS
# ===============================
check: lint typecheck test ## Quick health check (lint + typecheck + unit tests)
	@echo "✅ Health check passed!"

# ===============================
# CI/CD PIPELINE
# ===============================
ci: lint typecheck test-coverage e2e build ## Simulate CI pipeline
	@echo "🚀 CI pipeline completed successfully!"

ci-docker: ## Run CI in Docker container
	@echo "🐳 Running CI in Docker..."
	docker build -t nexo-frontend-ci -f Dockerfile.ci .
	docker run --rm nexo-frontend-ci

# ===============================
# PERFORMANCE TESTING
# ===============================
perf: ## Run performance tests
	@echo "⚡ Running performance tests..."
	@echo "Build time:" && cd nexo-prj && time npx nx build nexo-prj > /dev/null
	@echo "Test time:" && cd nexo-prj && time npx nx run-many --target=test --all > /dev/null

perf-build: ## Test build performance
	@echo "⚡ Testing build performance..."
	cd nexo-prj && time npx nx build nexo-prj

perf-test: ## Test test execution performance
	@echo "⚡ Testing test performance..."
	cd nexo-prj && time npx nx run-many --target=test --all

# ===============================
# COVERAGE & REPORTING
# ===============================
coverage: test-coverage ## Generate coverage reports
	@echo "📊 Coverage reports generated in nexo-prj/coverage/"

coverage-html: ## Open coverage report in browser
	cd nexo-prj && npx nx test nexo-prj --coverage --watch=false && open coverage/lcov-report/index.html

# ===============================
# DEBUGGING
# ===============================
debug-unit: ## Debug unit tests
	@echo "🐛 Debugging unit tests..."
	cd nexo-prj && npx nx test nexo-prj --inspect --inspect-brk

debug-e2e: ## Debug E2E tests
	@echo "🐛 Debugging E2E tests..."
	cd nexo-prj && npx nx e2e nexo-prj-e2e --headed --debug

# ===============================
# COMPONENT TESTING
# ===============================
test-components: ## Test shared UI components
	@echo "🧩 Testing shared components..."
	cd nexo-prj && npx nx test shared-ui --coverage

test-app: ## Test main application
	@echo "📱 Testing main application..."
	cd nexo-prj && npx nx test nexo-prj --coverage

# ===============================
# UTILITY
# ===============================
deps: ## Check for dependency updates
	@echo "🔍 Checking for dependency updates..."
	cd nexo-prj && pnpm outdated

deps-update: ## Update dependencies
	@echo "⬆️ Updating dependencies..."
	cd nexo-prj && pnpm update

# ===============================
# INFORMATION
# ===============================
info: ## Show project information
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
	@echo "  make dev       - Start development"
	@echo "  make check     - Health check"
	@echo "  make all       - Full test suite"
	@echo "  make ci        - CI simulation"