#!/bin/bash
# ============================================================================
# Backend API Health Check Script
# ============================================================================
# Tests the health of backend API service
# Usage: bash scripts/test-backend-health.sh
# ============================================================================

set -e

COMPOSE_FILE="docker/docker-compose.yml"
BACKEND_URL="http://localhost:3001"
TIMEOUT=60
INTERVAL=2

echo "🏥 Testing Backend API health..."

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if backend service is running
if ! docker compose -f "$COMPOSE_FILE" ps backend | grep -q "Up"; then
    echo "❌ Backend service is not running. Start with: mise run docker:up"
    exit 1
fi

echo "✓ Backend service is running"

# Function to test health endpoint
test_health_endpoint() {
    echo "Testing backend health endpoint..."
    
    elapsed=0
    while [ $elapsed -lt $TIMEOUT ]; do
        if curl -sf "$BACKEND_URL/health" > /dev/null 2>&1; then
            echo "✓ Backend health endpoint is responding"
            return 0
        fi
        sleep $INTERVAL
        elapsed=$((elapsed + INTERVAL))
    done
    
    echo "❌ Backend health endpoint not responding (timeout: ${TIMEOUT}s)"
    return 1
}

# Function to test GraphQL endpoint
test_graphql_endpoint() {
    echo "Testing GraphQL endpoint..."
    
    response=$(curl -sf -X POST "$BACKEND_URL/graphql" \
        -H "Content-Type: application/json" \
        -d '{"query":"{ __typename }"}' 2>&1)
    
    if echo "$response" | grep -q "__typename"; then
        echo "✓ GraphQL endpoint is responding"
        return 0
    else
        echo "❌ GraphQL endpoint is not responding correctly"
        return 1
    fi
}

# Function to test database connection
test_database_connection() {
    echo "Testing backend database connection..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T backend \
        node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT 1')" \
        > /dev/null 2>&1; then
        echo "✓ Backend can connect to database"
        return 0
    else
        echo "❌ Backend cannot connect to database"
        return 1
    fi
}

# Function to test Redis connection
test_redis_connection() {
    echo "Testing backend Redis connection..."
    
    # Check if backend can reach Redis
    if docker compose -f "$COMPOSE_FILE" exec -T backend nc -zv redis 6379 2>&1 | grep -q "succeeded"; then
        echo "✓ Backend can connect to Redis"
        return 0
    else
        echo "❌ Backend cannot connect to Redis"
        return 1
    fi
}

# Function to test Keycloak connection
test_keycloak_connection() {
    echo "Testing backend Keycloak connection..."
    
    # Check if backend can reach Keycloak
    if docker compose -f "$COMPOSE_FILE" exec -T backend nc -zv keycloak 8080 2>&1 | grep -q "succeeded"; then
        echo "✓ Backend can connect to Keycloak"
        return 0
    else
        echo "❌ Backend cannot connect to Keycloak"
        return 1
    fi
}

# Run all tests
FAILED=0

if ! test_health_endpoint; then
    FAILED=$((FAILED + 1))
fi

if ! test_graphql_endpoint; then
    FAILED=$((FAILED + 1))
fi

if ! test_database_connection; then
    FAILED=$((FAILED + 1))
fi

if ! test_redis_connection; then
    FAILED=$((FAILED + 1))
fi

if ! test_keycloak_connection; then
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All backend API health checks passed!"
    exit 0
else
    echo "❌ $FAILED backend health check(s) failed"
    echo "💡 Check logs with: mise run logs:backend"
    exit 1
fi
