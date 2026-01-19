#!/bin/bash
# ============================================================================
# Docker Connectivity Test Script
# ============================================================================
# Tests connectivity between Docker services
# Usage: bash scripts/test-docker-connectivity.sh
# ============================================================================

set -e

COMPOSE_FILE="docker/docker-compose.yml"

echo "🔗 Testing Docker services connectivity..."

# Function to test network connectivity
test_connectivity() {
    local from_service=$1
    local to_service=$2
    local port=$3
    
    echo "Testing connectivity: $from_service -> $to_service:$port"
    
    if docker compose -f "$COMPOSE_FILE" exec -T "$from_service" nc -zv "$to_service" "$port" 2>&1 | grep -q "succeeded"; then
        echo "✓ $from_service can reach $to_service:$port"
        return 0
    else
        echo "❌ $from_service cannot reach $to_service:$port"
        return 1
    fi
}

FAILED=0

# Test Frontend -> Backend connectivity (when backend is added)
# test_connectivity frontend backend 3001 || FAILED=$((FAILED + 1))

# Test Keycloak -> PostgreSQL
if ! test_connectivity keycloak postgres 5432; then
    FAILED=$((FAILED + 1))
fi

# Test Frontend -> Redis
if ! test_connectivity frontend redis 6379; then
    FAILED=$((FAILED + 1))
fi

# Test Frontend -> Keycloak
if ! test_connectivity frontend keycloak 8080; then
    FAILED=$((FAILED + 1))
fi

# Test Prometheus -> Frontend (metrics scraping)
if ! test_connectivity prometheus frontend 3000; then
    FAILED=$((FAILED + 1))
fi

# Test Frontend -> Backend API
if ! test_connectivity frontend backend 3001; then
    FAILED=$((FAILED + 1))
fi

# Test Backend -> PostgreSQL
if ! test_connectivity backend postgres 5432; then
    FAILED=$((FAILED + 1))
fi

# Test Backend -> Redis
if ! test_connectivity backend redis 6379; then
    FAILED=$((FAILED + 1))
fi

# Test Backend -> Keycloak
if ! test_connectivity backend keycloak 8080; then
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All connectivity tests passed!"
    exit 0
else
    echo "❌ $FAILED connectivity test(s) failed"
    exit 1
fi
