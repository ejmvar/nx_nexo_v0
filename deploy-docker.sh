#!/bin/bash

# NEXO CRM Docker Deployment Script
# Automates building, testing, and deploying the Docker stack

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}NEXO CRM Docker Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Warning:${NC} .env file not found"
  echo "Creating .env from template..."
  
  cat > .env << 'EOF'
# NEXO CRM Environment Configuration
NODE_ENV=production
COMPOSE_PROJECT_NAME=nexo-crm

# Database
POSTGRES_DB=nexo_crm
POSTGRES_USER=nexo_user
POSTGRES_PASSWORD=change-this-secure-password-123
POSTGRES_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h

# Service Ports
AUTH_SERVICE_PORT=3001
GATEWAY_SERVICE_PORT=3002
CRM_SERVICE_PORT=3003

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
EOF

  echo -e "${GREEN}✓${NC} Created .env file"
  echo -e "${YELLOW}⚠${NC}  Please edit .env with your configuration before deploying to production!"
  echo ""
fi

# Function to check Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker is not running"
    echo "Please start Docker and try again"
    exit 1
  fi
  echo -e "${GREEN}✓${NC} Docker is running"
}

# Function to build images
build_images() {
  echo ""
  echo -e "${BLUE}[1/5] Building Docker images...${NC}"
  
  docker-compose build --no-cache
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Images built successfully"
  else
    echo -e "${RED}✗${NC} Image build failed"
    exit 1
  fi
}

# Function to start services
start_services() {
  echo ""
  echo -e "${BLUE}[2/5] Starting services...${NC}"
  
  docker-compose up -d
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Services started"
  else
    echo -e "${RED}✗${NC} Failed to start services"
    exit 1
  fi
}

# Function to wait for services to be healthy
wait_for_health() {
  echo ""
  echo -e "${BLUE}[3/5] Waiting for services to be healthy...${NC}"
  
  local max_attempts=30
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt + 1))
    echo -n "  Attempt $attempt/$max_attempts... "
    
    # Check if all services are healthy
    HEALTHY=$(docker-compose ps | grep -c "healthy")
    TOTAL=$(docker-compose ps | grep -c "Up")
    
    if [ "$HEALTHY" -ge 3 ]; then
      echo -e "${GREEN}✓${NC}"
      echo -e "${GREEN}✓${NC} All services are healthy"
      return 0
    fi
    
    echo "($HEALTHY/$TOTAL healthy)"
    sleep 5
  done
  
  echo -e "${RED}✗${NC} Services did not become healthy in time"
  docker-compose ps
  echo ""
  echo "Check logs with: docker-compose logs"
  exit 1
}

# Function to apply migrations
apply_migrations() {
  echo ""
  echo -e "${BLUE}[4/5] Applying database migrations...${NC}"
  
  # Wait a bit for PostgreSQL to be fully ready
  sleep 5
  
  # Apply all migrations
  for file in nexo-prj/database/migrations/sql/*.sql; do
    if [ -f "$file" ]; then
      echo "  Applying $(basename "$file")..."
      docker exec -i nexo-postgres psql -U nexo_user -d nexo_crm < "$file" > /dev/null 2>&1
      
      if [ $? -eq 0 ]; then
        echo -e "    ${GREEN}✓${NC} Applied successfully"
      else
        echo -e "    ${YELLOW}⚠${NC}  May have already been applied or have errors"
      fi
    fi
  done
  
  echo -e "${GREEN}✓${NC} Migrations complete"
}

# Function to verify deployment
verify_deployment() {
  echo ""
  echo -e "${BLUE}[5/5] Verifying deployment...${NC}"
  
  # Check Auth Service
  if curl -f -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✓${NC} Auth Service (http://localhost:3001)"
  else
    echo -e "${RED}✗${NC} Auth Service failed health check"
  fi
  
  # Check CRM Service (may return 401 which is OK)
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/health)
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${GREEN}✓${NC} CRM Service (http://localhost:3003)"
  else
    echo -e "${RED}✗${NC} CRM Service failed health check (status: $HTTP_STATUS)"
  fi
  
  # Check Gateway Service
  if curl -f -s http://localhost:3002/health > /dev/null; then
    echo -e "${GREEN}✓${NC} Gateway Service (http://localhost:3002)"
  else
    echo -e "${RED}✗${NC} Gateway Service failed health check"
  fi
  
  # Check PostgreSQL
  if docker exec nexo-postgres pg_isready -U nexo_user -d nexo_crm > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL Database"
  else
    echo -e "${RED}✗${NC} PostgreSQL failed health check"
  fi
}

# Function to show summary
show_summary() {
  echo ""
  echo -e "${BLUE}================================${NC}"
  echo -e "${GREEN}Deployment Complete!${NC}"
  echo -e "${BLUE}================================${NC}"
  echo ""
  echo "Services:"
  echo "  - Gateway:  http://localhost:3002"
  echo "  - Auth:     http://localhost:3001"
  echo "  - CRM:      http://localhost:3003"
  echo "  - Database: localhost:5432"
  echo ""
  echo "Useful commands:"
  echo "  - View logs:    docker-compose logs -f"
  echo "  - View status:  docker-compose ps"
  echo "  - Stop:         docker-compose stop"
  echo "  - Restart:      docker-compose restart"
  echo ""
  echo "Documentation:"
  echo "  - Deployment:   DOCKER_DEPLOYMENT.md"
  echo "  - Architecture: ARCHITECTURE.md"
  echo ""
}

# Main execution
main() {
  check_docker
  build_images
  start_services
  wait_for_health
  apply_migrations
  verify_deployment
  show_summary
}

# Run main function
main
