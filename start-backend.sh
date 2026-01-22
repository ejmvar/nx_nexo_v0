#!/bin/bash
# Start NEXO Backend Services
# ============================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting NEXO Backend Services${NC}"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Starting Docker...${NC}"
    # You may need to start Docker Desktop or systemctl start docker
fi

# Step 1: Start Database & Redis
echo -e "${BLUE}1️⃣  Starting PostgreSQL and Redis...${NC}"
unset DOCKER_HOST
cd "$(dirname "$0")"
docker compose -f docker-compose.full.yml up -d postgres redis

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 5

# Check health
if docker ps --filter name=nexo-postgres --filter health=healthy | grep -q nexo-postgres; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not healthy yet${NC}"
fi

if docker ps --filter name=nexo-redis --filter health=healthy | grep -q nexo-redis; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Redis is not healthy yet${NC}"
fi

echo ""

# Step 2: Start Auth Service
echo -e "${BLUE}2️⃣  Starting Auth Service (port 3001)...${NC}"
cd nexo-prj

# Kill existing services if running
pkill -f "nx serve auth-service" 2>/dev/null || true
pkill -f "nx serve api-gateway" 2>/dev/null || true

# Start auth service in background
cd apps/auth-service
set -a && source .env.local && set +a
cd ../..
nx serve auth-service > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
echo "Auth Service PID: $AUTH_PID"

# Wait for auth service to start
echo "Waiting for auth service to start..."
sleep 10

# Test auth service
if curl -s http://localhost:3001/api/auth/health > /dev/null; then
    echo -e "${GREEN}✅ Auth Service is running on http://localhost:3001/api${NC}"
else
    echo -e "${YELLOW}⚠️  Auth Service might not be ready yet${NC}"
fi

echo ""

# Step 3: Start API Gateway
echo -e "${BLUE}3️⃣  Starting API Gateway (port 3002)...${NC}"

# Start API Gateway in background
cd apps/api-gateway
set -a && source .env.local && set +a
cd ../..
nx serve api-gateway > /tmp/api-gateway.log 2>&1 &
GATEWAY_PID=$!
echo "API Gateway PID: $GATEWAY_PID"

# Wait for gateway to start
echo "Waiting for API Gateway to start..."
sleep 8

# Test gateway
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo -e "${GREEN}✅ API Gateway is running on http://localhost:3002/api${NC}"
else
    echo -e "${YELLOW}⚠️  API Gateway might not be ready yet${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "Service URLs:"
echo "  PostgreSQL:  localhost:5432"
echo "  Redis:       localhost:6379"
echo "  Auth API:    http://localhost:3001/api"
echo "  API Gateway: http://localhost:3002/api (⭐ Use this for frontend)"
echo ""
echo "Logs:"
echo "  Auth Service: tail -f /tmp/auth-service.log"
echo "  API Gateway:  tail -f /tmp/api-gateway.log"
echo "  PostgreSQL:   docker logs -f nexo-postgres"
echo "  Redis:        docker logs -f nexo-redis"
echo ""
echo "Tests:"
echo "  ./test-auth.sh     # Test auth service directly"
echo "  ./test-gateway.sh  # Test API Gateway routing"
echo ""
echo "To stop services:"
echo "  pkill -f 'nx serve'"
echo "  docker compose -f docker-compose.full.yml down"
