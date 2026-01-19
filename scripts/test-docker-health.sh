#!/bin/bash
# ============================================================================
# Docker Health Check Script
# ============================================================================
# Tests the health of all Docker services in docker-compose.yml
# Usage: bash scripts/test-docker-health.sh
# ============================================================================

set -e

COMPOSE_FILE="docker/docker-compose.yml"
TIMEOUT=60
INTERVAL=2

echo "🏥 Testing Docker services health..."

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✓ Docker is running"

# Check if services are running
SERVICES=$(docker compose -f "$COMPOSE_FILE" ps --services 2>/dev/null | wc -l)
if [ "$SERVICES" -eq 0 ]; then
    echo "❌ No services are running. Start them with: mise run docker:up"
    exit 1
fi

echo "✓ Found $SERVICES running services"

# Function to test service health
test_service_health() {
    local service=$1
    local port=$2
    local host=${3:-localhost}
    local endpoint=${4:-/}
    
    echo "Testing $service on $host:$port..."
    
    elapsed=0
    while [ $elapsed -lt $TIMEOUT ]; do
        if curl -sf "http://$host:$port$endpoint" > /dev/null 2>&1; then
            echo "✓ $service is healthy"
            return 0
        fi
        sleep $INTERVAL
        elapsed=$((elapsed + INTERVAL))
    done
    
    echo "❌ $service health check failed (timeout: ${TIMEOUT}s)"
    return 1
}

# Function to test database connection
test_database() {
    local service=$1
    local port=$2
    local db=${3:-nexo_crm}
    local user=${4:-nexo_user}
    local password=${5:-nexo_password}
    
    echo "Testing $service database connection..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T "$service" pg_isready -U "$user" > /dev/null 2>&1; then
        echo "✓ $service database is ready"
        return 0
    else
        echo "❌ $service database is not ready"
        return 1
    fi
}

# Function to test Redis connection
test_redis() {
    echo "Testing Redis connection..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
        echo "✓ Redis is ready"
        return 0
    else
        echo "❌ Redis is not ready"
        return 1
    fi
}

# Run health checks
FAILED=0

# Test PostgreSQL
if ! test_database postgres 5432 nexo_crm nexo_user nexo_password; then
    FAILED=$((FAILED + 1))
fi

# Test Redis
if ! test_redis; then
    FAILED=$((FAILED + 1))
fi

# Test Keycloak
if ! test_service_health keycloak 8080 localhost /health/ready; then
    FAILED=$((FAILED + 1))
fi

# Test Frontend
if ! test_service_health frontend 3000; then
    FAILED=$((FAILED + 1))
fi

# Test Prometheus
if ! test_service_health prometheus 9090 localhost /-/healthy; then
    FAILED=$((FAILED + 1))
fi

# Test Grafana
if ! test_service_health grafana 3002 localhost /api/health; then
    FAILED=$((FAILED + 1))
fi

# Test Backend API
if ! test_service_health backend 3001 localhost /health; then
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All Docker services are healthy!"
    exit 0
else
    echo "❌ $FAILED service(s) failed health checks"
    exit 1
fi
