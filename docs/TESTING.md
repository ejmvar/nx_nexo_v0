# Testing Infrastructure

## Overview

This document outlines the comprehensive testing infrastructure for NEXO CRM. Every step, activity, and development workflow includes automated testing to ensure reliability and ease of onboarding.

## Philosophy

- **Every step must be testable**: All infrastructure, code, and workflows have automated tests
- **Simplest possible approach**: Use MISE tasks or Makefile - whichever you prefer
- **Easy onboarding**: New developers should run one command to validate their setup

## Quick Start

### For New Developers

```bash
# Setup entire development environment
bash scripts/setup-dev.sh

# Or using MISE
mise run setup

# Or using Make
make setup
```

### Daily Workflow

```bash
# Start development
mise run dev
# or
make dev

# Run all tests
mise run test:all
# or  
make test-all

# Stop development
mise run dev:stop
# or
make dev-stop
```

## Testing Methods

You can use any of these three methods - they all do the same thing:

### 1. MISE Tasks (Recommended)

```bash
# View all available tasks
mise tasks

# Run specific test
mise run docker:validate
mise run test:docker:health
mise run k8s:validate

# Run test suites
mise run test:quick        # Quick validation
mise run test:all          # Comprehensive tests
mise run ci:test           # CI/CD pipeline
```

### 2. Makefile

```bash
# View all available targets
make help

# Run specific test
make docker-validate
make test-docker-health
make test-k8s-validate

# Run test suites
make test-quick           # Quick validation
make test-all             # Comprehensive tests
make test-ci              # CI/CD pipeline
```

### 3. Direct Scripts

```bash
# Run test scripts directly
bash scripts/test-docker-health.sh
bash scripts/test-docker-connectivity.sh
bash scripts/validate-k8s.sh
bash scripts/ci-test.sh
```

## Test Categories

### 1. Docker Infrastructure Tests

**Validate Configuration**
```bash
mise run docker:validate    # Check docker-compose.yml syntax
make docker-validate
```

**Health Checks**
```bash
mise run test:docker:health    # Test all service health endpoints
make test-docker-health
```

Tests:
- PostgreSQL database connection
- Redis ping/pong
- Keycloak `/health/ready` endpoint
- Frontend HTTP response
- Prometheus `/-/healthy` endpoint
- Grafana `/api/health` endpoint

**Connectivity Tests**
```bash
mise run test:docker:connectivity    # Test service-to-service connections
make test-docker-connectivity
```

Tests:
- Keycloak → PostgreSQL
- Frontend → Redis
- Frontend → Keycloak
- Prometheus → Frontend (metrics scraping)

### 2. Kubernetes Tests

**Validate Manifests**
```bash
mise run k8s:validate    # Validate YAML syntax and structure
make test-k8s-validate
```

**Dry Run Deployment**
```bash
mise run k8s:dry-run     # Test deployment without applying
make k8s-dry-run
```

### 3. Application Tests

**Nx Installation**
```bash
mise run test:nx:install    # Verify Nx CLI is available
make test-nx
```

**Dependencies**
```bash
mise run test:pnpm:install    # Install and verify dependencies
make test-pnpm
```

**Build Tests**
```bash
mise run test:nx:build:all    # Build all projects
make test-nx-build
```

**Lint Tests**
```bash
mise run test:nx:lint:all     # Lint all projects
make test-nx-lint
```

**Unit Tests**
```bash
mise run test:nx:test:all     # Run all unit tests
make test-nx-test
```

### 4. Comprehensive Test Suites

**Quick Tests** (for rapid feedback)
```bash
mise run test:quick
make test-quick
```

Runs:
1. Docker Compose validation
2. Kubernetes manifests validation
3. Nx installation check

**Full Test Suite** (before commits)
```bash
mise run test:all
make test-all
```

Runs:
1. Docker Compose validation
2. Docker services health checks
3. Kubernetes manifests validation
4. Nx installation verification
5. pnpm dependencies installation

**CI/CD Pipeline** (automated testing)
```bash
mise run ci:test
make test-ci
```

Runs:
1. Docker Compose validation
2. Kubernetes manifests validation
3. Nx installation check
4. Dependencies installation (frozen lockfile)
5. Lint all projects
6. Test all projects
7. Build all projects

## Development Workflow Testing

### Start Development Environment

```bash
mise run dev
make dev
```

What it does:
1. Starts all Docker services
2. Waits for services to be healthy
3. Confirms environment is ready

### Test Frontend Development

```bash
mise run dev:frontend
make dev-frontend
```

### Test Backend Development

```bash
mise run dev:backend
make dev-backend
```

## Utility Commands

### View Service URLs

```bash
mise run urls
make urls
```

Shows:
- Frontend: http://localhost:3000
- Keycloak: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### View Logs

```bash
# All services
mise run docker:logs
make docker-logs

# Specific service
mise run logs:frontend
make logs-frontend

mise run logs:postgres
make logs-postgres
```

### Database Operations

```bash
# Connect to PostgreSQL
mise run db:shell
make db-shell

# Backup database
mise run db:backup
make db-backup

# Connect to Redis
mise run redis:shell
make redis-shell
```

### Clean Up

```bash
# Clean Docker resources
mise run docker:clean
make docker-clean

# Clean everything (Docker + node_modules + dist)
mise run clean:all
make clean-all
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup MISE
        uses: jdx/mise-action@v2
      
      - name: Run CI Tests
        run: mise run ci:test
```

### GitLab CI Example

```yaml
test:
  image: ubuntu:latest
  script:
    - curl https://mise.jdx.dev/install.sh | sh
    - mise run ci:test
```

### Jenkins Example

```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'mise run ci:test'
            }
        }
    }
}
```

## Testing Scripts

All test scripts are located in `scripts/` directory:

- `test-docker-health.sh` - Docker services health checks
- `test-docker-connectivity.sh` - Service connectivity tests
- `validate-k8s.sh` - Kubernetes manifests validation
- `ci-test.sh` - Complete CI/CD test pipeline
- `setup-dev.sh` - Development environment setup
- `deploy.sh` - Kubernetes deployment

## Test Results Interpretation

### Success

```
✅ All tests passed!
```

All services are healthy and functioning correctly.

### Failure

```
❌ 2 service(s) failed health checks
```

Check logs for specific service:
```bash
mise run docker:logs
mise run logs:frontend    # or specific service
```

### Warning

```
⚠️  kubectl not found, skipping K8s validation
```

Install missing dependencies:
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

## Troubleshooting

### Docker Services Not Starting

```bash
# Check Docker is running
docker info

# Check service logs
mise run docker:logs

# Restart services
mise run docker:restart
make docker-restart
```

### Port Conflicts

If ports are already in use, edit `docker/docker-compose.yml` to change port mappings.

### Permission Errors

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Re-login for changes to take effect
```

### Tests Timeout

Increase timeout in test scripts or check system resources:

```bash
# Check system resources
docker stats

# Check available memory
free -h
```

## Best Practices

1. **Run tests before commits**
   ```bash
   mise run test:all
   ```

2. **Run quick tests during development**
   ```bash
   mise run test:quick
   ```

3. **Check service health after starting**
   ```bash
   mise run dev
   mise run test:docker:health
   ```

4. **Clean up regularly**
   ```bash
   mise run docker:clean
   ```

5. **Keep dependencies updated**
   ```bash
   cd nexo-prj && pnpm update
   ```

## Additional Resources

- [MISE Documentation](https://mise.jdx.dev)
- [Docker Documentation](https://docs.docker.com)
- [Kubernetes Documentation](https://kubernetes.io/docs)
- [Nx Documentation](https://nx.dev)
- [GNU Make Manual](https://www.gnu.org/software/make/manual/)

## Support

For issues or questions:
1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. Review [docker/docs/docker.md](docker/docs/docker.md) for Docker setup
3. Run diagnostic tests: `mise run test:all`
4. Check service logs: `mise run docker:logs`
