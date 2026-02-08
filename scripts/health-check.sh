#!/usr/bin/env bash
# ============================================================================
# NEXO CRM - Health Check Script
# ============================================================================
# Comprehensive health check for all services
# Features:
# - Service availability
# - Response time monitoring
# - Dependency checks
# - Detailed status report
# ============================================================================

set -euo pipefail

# Ports
AUTH_PORT=3001
CRM_PORT=3003
GATEWAY_PORT=3002
FRONTEND_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================================================
# Health Check Functions
# ============================================================================

check_service() {
  local url=$1
  local service_name=$2
  local timeout=${3:-5}
  
  local start_time=$(date +%s%3N)
  
  if curl -s -f --max-time ${timeout} "${url}" > /dev/null 2>&1; then
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    echo -e "${GREEN}✓${NC} ${service_name} (${response_time}ms)"
    return 0
  else
    echo -e "${RED}✗${NC} ${service_name} (timeout)"
    return 1
  fi
}

check_port() {
  local port=$1
  local service_name=$2
  
  if nc -z localhost ${port} 2>/dev/null; then
    echo -e "${GREEN}✓${NC} ${service_name} (port ${port})"
    return 0
  else
    echo -e "${RED}✗${NC} ${service_name} (port ${port} not accessible)"
    return 1
  fi
}

# ============================================================================
# Main Health Check
# ============================================================================

main() {
  echo "============================================================================"
  echo "NEXO CRM - Health Check"
  echo "$(date '+%Y-%m-%d %H:%M:%S')"
  echo "============================================================================"
  echo ""
  
  local errors=0
  
  echo "Services:"
  check_service "http://localhost:${AUTH_PORT}/health" "Auth Service" || ((errors++))
  check_service "http://localhost:${CRM_PORT}/health" "CRM Service" || ((errors++))
  check_service "http://localhost:${GATEWAY_PORT}/health" "API Gateway" || ((errors++))
  check_service "http://localhost:${FRONTEND_PORT}" "Frontend" || ((errors++))
  
  echo ""
  echo "Databases:"
  check_port ${POSTGRES_PORT} "PostgreSQL" || ((errors++))
  check_port ${REDIS_PORT} "Redis" || ((errors++))
  
  echo ""
  echo "============================================================================"
  
  if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ All services healthy${NC}"
    return 0
  else
    echo -e "${RED}✗ ${errors} service(s) unhealthy${NC}"
    return 1
  fi
}

main "$@"
