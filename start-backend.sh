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

# Kill existing auth service if running
pkill -f "nx serve auth-service" 2>/dev/null || true

# Start auth service in background
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=nexo_crm \
DB_USER=nexo_admin \
DB_PASSWORD=nexo_dev_password_2026 \
PORT=3001 \
REDIS_URL=redis://localhost:6379 \
JWT_SECRET=nexo_jwt_secret_key_2026 \
nx serve auth-service --host 0.0.0.0 > /tmp/auth-service.log 2>&1 &

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
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "Service URLs:"
echo "  PostgreSQL: localhost:5432"
echo "  Redis:      localhost:6379"
echo "  Auth API:   http://localhost:3001/api"
echo ""
echo "Logs:"
echo "  Auth Service: tail -f /tmp/auth-service.log"
echo "  PostgreSQL:   docker logs -f nexo-postgres"
echo "  Redis:        docker logs -f nexo-redis"
echo ""
echo "To stop services:"
echo "  pkill -f 'nx serve auth-service'"
echo "  docker compose -f docker-compose.full.yml down"
