# ============================================================================
# NEXO CRM - Makefile
# ============================================================================
# Alternative to MISE tasks for users who prefer Make
# Usage: make <target>
# Run 'make help' to see all available targets
# ============================================================================

.PHONY: help
.DEFAULT_GOAL := help

# Variables
PROJECT_NAME := nexo-prj
COMPOSE_FILE := docker/docker-compose.yml

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo '============================================'
	@echo 'NEXO CRM - Available Make Targets'
	@echo '============================================'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' | \
		sort
	@echo ''
	@echo 'Quick Start:'
	@echo '  make setup      - Setup development environment'
	@echo '  make dev        - Start development environment'
	@echo '  make test-all   - Run all tests'
	@echo ''

# ============================================================================
# SETUP & ONBOARDING
# ============================================================================

setup: ## Setup development environment for new users
	@bash scripts/setup-dev.sh

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

docker-validate: ## Validate docker-compose.yml syntax
	@docker compose -f $(COMPOSE_FILE) config > /dev/null && echo '✓ Docker Compose configuration is valid'

docker-build: ## Build all Docker images
	@docker compose -f $(COMPOSE_FILE) build

docker-up: ## Start all Docker services
	@docker compose -f $(COMPOSE_FILE) up -d

docker-down: ## Stop all Docker services
	@docker compose -f $(COMPOSE_FILE) down

docker-logs: ## View Docker logs
	@docker compose -f $(COMPOSE_FILE) logs -f

docker-ps: ## List running Docker containers
	@docker compose -f $(COMPOSE_FILE) ps

docker-clean: ## Clean Docker resources (containers, volumes, networks)
	@docker compose -f $(COMPOSE_FILE) down -v --remove-orphans

docker-restart: ## Restart Docker services
	@$(MAKE) docker-down
	@$(MAKE) docker-up

# ============================================================================
# TESTING COMMANDS
# ============================================================================

test-docker-health: ## Test Docker services health
	@bash scripts/test-docker-health.sh

test-docker-connectivity: ## Test connectivity between Docker services
	@bash scripts/test-docker-connectivity.sh

test-backend-health: ## Test backend API health
	@bash scripts/test-backend-health.sh

test-backend-database: ## Test backend database connectivity
	@bash scripts/test-backend-database.sh

test-k8s-validate: ## Validate Kubernetes manifests
	@bash scripts/validate-k8s.sh

test-nx: ## Test Nx installation
	@cd $(PROJECT_NAME) && nx --version && echo '✓ Nx is installed'

test-pnpm: ## Test pnpm dependencies
	@cd $(PROJECT_NAME) && pnpm install && echo '✓ Dependencies installed'

test-nx-build: ## Test build all Nx projects
	@cd $(PROJECT_NAME) && nx run-many --target=build --all

test-nx-lint: ## Test lint all Nx projects
	@cd $(PROJECT_NAME) && nx run-many --target=lint --all

test-nx-test: ## Test all Nx projects
	@cd $(PROJECT_NAME) && nx run-many --target=test --all

test-quick: ## Run quick validation tests
	@echo '⚡ Running quick tests...'
	@$(MAKE) docker-validate
	@$(MAKE) test-k8s-validate
	@$(MAKE) test-nx
	@echo '✅ Quick tests passed!'

test-all: ## Run ALL tests (Docker, K8s, Application)
	@echo '🧪 Running comprehensive test suite...'
	@$(MAKE) docker-validate
	@$(MAKE) test-docker-health
	@$(MAKE) test-k8s-validate
	@$(MAKE) test-nx
	@$(MAKE) test-pnpm
	@echo '✅ All tests passed!'

test-ci: ## Run CI/CD test pipeline
	@bash scripts/ci-test.sh

# ============================================================================
# KUBERNETES COMMANDS
# ============================================================================

k8s-validate: ## Validate Kubernetes manifests
	@bash scripts/validate-k8s.sh

k8s-dry-run: ## Dry run K8s deployment
	@kubectl apply -f k8s/ --dry-run=client

k8s-deploy: ## Deploy to Kubernetes
	@bash scripts/deploy.sh

# ============================================================================
# DEVELOPMENT WORKFLOW
# ============================================================================

dev: docker-up ## Start full development environment
	@cd $(PROJECT_NAME) && echo '✓ Development environment started'

dev-frontend: ## Start frontend development server
	@cd $(PROJECT_NAME) && nx dev employee-portal

dev-backend: ## Start backend development server
	@cd $(PROJECT_NAME) && nx serve api-gateway

dev-stop: docker-down ## Stop development environment

# ============================================================================
# NX WORKSPACE COMMANDS
# ============================================================================

nx-install: ## Install Nx CLI globally
	@pnpm install -g nx

nx-create: ## Create new Nx workspace
	@npx create-nx-workspace@latest $(PROJECT_NAME) --package-manager=pnpm

nx-graph: ## Show Nx project graph
	@cd $(PROJECT_NAME) && nx graph

nx-affected-build: ## Build affected projects
	@cd $(PROJECT_NAME) && nx affected --target=build

nx-affected-test: ## Test affected projects
	@cd $(PROJECT_NAME) && nx affected --target=test

nx-affected-lint: ## Lint affected projects
	@cd $(PROJECT_NAME) && nx affected --target=lint

# ============================================================================
# HELM COMMANDS
# ============================================================================

helm-lint: ## Lint Helm chart
	@helm lint helm/nexo-crm

helm-template: ## Render Helm templates (default)
	@helm template nexo-crm helm/nexo-crm

helm-template-dev: ## Render Helm templates (development)
	@helm template nexo-crm helm/nexo-crm -f helm/nexo-crm/values-dev.yaml

helm-template-staging: ## Render Helm templates (staging)
	@helm template nexo-crm helm/nexo-crm -f helm/nexo-crm/values-staging.yaml

helm-template-prod: ## Render Helm templates (production)
	@helm template nexo-crm helm/nexo-crm -f helm/nexo-crm/values-prod.yaml

helm-install-dev: ## Install Helm chart (development)
	@helm install nexo-crm helm/nexo-crm -f helm/nexo-crm/values-dev.yaml

helm-install-staging: ## Install Helm chart (staging)
	@helm install nexo-crm helm/nexo-crm -f helm/nexo-crm/values-staging.yaml

helm-install-prod: ## Install Helm chart (production)
	@helm install nexo-crm helm/nexo-crm -f helm/nexo-crm/values-prod.yaml

helm-upgrade-dev: ## Upgrade Helm release (development)
	@helm upgrade nexo-crm helm/nexo-crm -f helm/nexo-crm/values-dev.yaml

helm-upgrade-staging: ## Upgrade Helm release (staging)
	@helm upgrade nexo-crm helm/nexo-crm -f helm/nexo-crm/values-staging.yaml

helm-upgrade-prod: ## Upgrade Helm release (production)
	@helm upgrade nexo-crm helm/nexo-crm -f helm/nexo-crm/values-prod.yaml

helm-uninstall: ## Uninstall Helm release
	@helm uninstall nexo-crm

helm-list: ## List Helm releases
	@helm list

helm-status: ## Show Helm release status
	@helm status nexo-crm

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

clean-all: docker-clean ## Clean everything (Docker, node_modules, dist)
	@cd $(PROJECT_NAME) && rm -rf node_modules dist .nx
	@echo '✓ Cleaned all build artifacts'

install-deps: ## Install all dependencies
	@cd $(PROJECT_NAME) && pnpm install

update-deps: ## Update all dependencies
	@cd $(PROJECT_NAME) && pnpm update

format: ## Format code with Prettier
	@cd $(PROJECT_NAME) && nx format:write

check-format: ## Check code formatting
	@cd $(PROJECT_NAME) && nx format:check

# ============================================================================
# CI/CD COMMANDS
# ============================================================================

ci-build: ## CI build pipeline
	@$(MAKE) docker-validate
	@$(MAKE) test-nx-build

ci-test: ## CI test pipeline
	@$(MAKE) test-ci

ci-deploy: ## CI deploy pipeline
	@$(MAKE) k8s-deploy

# ============================================================================
# MONITORING & OBSERVABILITY
# ============================================================================

logs-frontend: ## View frontend logs
	@docker compose -f $(COMPOSE_FILE) logs -f frontend

logs-postgres: ## View PostgreSQL logs
	@docker compose -f $(COMPOSE_FILE) logs -f postgres

logs-redis: ## View Redis logs
	@docker compose -f $(COMPOSE_FILE) logs -f redis

logs-keycloak: ## View Keycloak logs
	@docker compose -f $(COMPOSE_FILE) logs -f keycloak

logs-prometheus: ## View Prometheus logs
	@docker compose -f $(COMPOSE_FILE) logs -f prometheus

logs-grafana: ## View Grafana logs
	@docker compose -f $(COMPOSE_FILE) logs -f grafana

logs-backend: ## View backend API logs
	@docker compose -f $(COMPOSE_FILE) logs -f backend

logs-pgadmin: ## View pgAdmin logs
	@docker compose -f $(COMPOSE_FILE) logs -f pgadmin

logs-redisinsight: ## View RedisInsight logs
	@docker compose -f $(COMPOSE_FILE) logs -f redisinsight

# ============================================================================
# DATABASE COMMANDS
# ============================================================================

db-shell: ## Connect to PostgreSQL shell
	@docker compose -f $(COMPOSE_FILE) exec postgres psql -U nexo_user -d nexo_crm

db-backup: ## Create PostgreSQL backup
	@bash scripts/backup-postgres.sh backup

db-backup-list: ## List all PostgreSQL backups
	@bash scripts/backup-postgres.sh list

db-backup-verify: ## Verify latest backup integrity
	@bash scripts/backup-postgres.sh verify $$(bash scripts/restore-postgres.sh latest)

db-backup-cleanup: ## Clean old backups based on retention policy
	@bash scripts/backup-postgres.sh cleanup

db-backup-rotate: ## Apply backup rotation policies
	@bash scripts/backup-rotation.sh rotate

db-backup-stats: ## Show backup statistics
	@bash scripts/backup-rotation.sh stats

db-restore-test: ## Test restore in separate database
	@bash scripts/restore-postgres.sh test

db-restore: ## Restore from latest backup (DESTRUCTIVE)
	@bash scripts/restore-postgres.sh restore

db-restore-file: ## Restore from specific backup file (use BACKUP_FILE=path/to/file.sql.gz)
	@bash scripts/restore-postgres.sh restore $(BACKUP_FILE)

db-restore-latest: ## Show latest backup file
	@bash scripts/restore-postgres.sh latest

# ============================================================================
# REDIS COMMANDS
# ============================================================================

redis-shell: ## Connect to Redis CLI
	@docker compose -f $(COMPOSE_FILE) exec redis redis-cli

redis-flush: ## Flush Redis cache (WARNING: deletes all data)
	@docker compose -f $(COMPOSE_FILE) exec redis redis-cli FLUSHALL
	@echo '⚠️  Redis cache flushed'

# ============================================================================
# MONITORING URLS
# ============================================================================

urls: ## Show all service URLs
	@echo '============================================'
	@echo 'NEXO CRM Service URLs'
	@echo '============================================'
	@echo 'Frontend:    http://localhost:3000'
	@echo 'Backend API: http://localhost:3001'
	@echo 'Keycloak:    http://localhost:8080'
	@echo 'Prometheus:  http://localhost:9090'
	@echo 'Grafana:     http://localhost:3002'
	@echo ''
	@echo 'Database Admin Tools:'
	@echo 'pgAdmin:     http://localhost:5050'
	@echo 'RedisInsight: http://localhost:5540'
	@echo ''
	@echo 'Database Connections:'
	@echo 'PostgreSQL:  localhost:5432'
	@echo 'Redis:       localhost:6379'
	@echo '============================================'
