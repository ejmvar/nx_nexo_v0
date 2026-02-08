#!/usr/bin/env bash
# ============================================================================
# NEXO CRM - Robust Startup Script
# ============================================================================
# Universal startup for TEST, DEV, QA, PROD environments
# Features:
# - Prerequisites check
# - Service dependency ordering
# - Health checks with retries
# - Port cleanup
# - Detailed logging
# ============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/tmp/logs"
LOG_FILE="${LOG_DIR}/startup-$(date +%Y%m%d-%H%M%S).log"

# Environment (default: dev)
ENV="${NEXO_ENV:-dev}"

# Ports configuration
AUTH_PORT=3001
CRM_PORT=3003
GATEWAY_PORT=3002
FRONTEND_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379

# Health check configuration
MAX_RETRIES=30
RETRY_INTERVAL=2

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Logging Functions
# ============================================================================

setup_logging() {
  mkdir -p "${LOG_DIR}"
  exec > >(tee -a "${LOG_FILE}")
  exec 2>&1
  log_info "Startup log: ${LOG_FILE}"
}

log_info() {
  echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"
}

log_step() {
  echo ""
  echo -e "${BLUE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"
  echo "============================================================================"
}

# ============================================================================
# Prerequisites Check
# ============================================================================

check_prerequisites() {
  log_step "Checking prerequisites"
  
  local errors=0
  
  # Check Node.js
  if command -v node &> /dev/null; then
    log_info "✓ Node.js $(node --version)"
  else
    log_error "✗ Node.js not found"
    ((errors++))
  fi
  
  # Check pnpm
  if command -v pnpm &> /dev/null; then
    log_info "✓ pnpm $(pnpm --version)"
  else
    log_error "✗ pnpm not found"
    ((errors++))
  fi
  
  # Check Docker (optional for dev)
  if command -v docker &> /dev/null; then
    log_info "✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
  else
    log_warn "△ Docker not found (optional)"
  fi
  
  # Check database connectivity
  if [ "${ENV}" != "test" ]; then
    if nc -z localhost ${POSTGRES_PORT} 2>/dev/null; then
      log_info "✓ PostgreSQL accessible on port ${POSTGRES_PORT}"
    else
      log_error "✗ PostgreSQL not accessible on port ${POSTGRES_PORT}"
      ((errors++))
    fi
  fi
  
  if [ $errors -gt 0 ]; then
    log_error "Prerequisites check failed with $errors error(s)"
    return 1
  fi
  
  log_info "All prerequisites satisfied"
  return 0
}

# ============================================================================
# Port Management
# ============================================================================

cleanup_port() {
  local port=$1
  local service_name=$2
  
  log_info "Checking port ${port} (${service_name})..."
  
  # Find process using the port
  local pid=$(lsof -ti:${port} 2>/dev/null || true)
  
  if [ -n "${pid}" ]; then
    log_warn "Port ${port} in use by PID ${pid}, killing..."
    kill -9 ${pid} 2>/dev/null || true
    sleep 1
    
    # Verify port is free
    if lsof -ti:${port} 2>/dev/null; then
      log_error "Failed to free port ${port}"
      return 1
    fi
    log_info "Port ${port} freed successfully"
  else
    log_info "Port ${port} is free"
  fi
  
  return 0
}

cleanup_ports() {
  log_step "Cleaning up ports"
  
  cleanup_port ${AUTH_PORT} "auth-service"
  cleanup_port ${CRM_PORT} "crm-service"
  cleanup_port ${GATEWAY_PORT} "api-gateway"
  cleanup_port ${FRONTEND_PORT} "frontend"
  
  log_info "All ports cleaned"
}

# ============================================================================
# Service Health Checks
# ============================================================================

wait_for_service() {
  local url=$1
  local service_name=$2
  local max_retries=${3:-$MAX_RETRIES}
  
  log_info "Waiting for ${service_name} at ${url}..."
  
  local retry=0
  while [ $retry -lt $max_retries ]; do
    if curl -s -f "${url}" > /dev/null 2>&1; then
      log_info "✓ ${service_name} is ready"
      return 0
    fi
    
    ((retry++))
    if [ $retry -lt $max_retries ]; then
      echo -n "."
      sleep ${RETRY_INTERVAL}
    fi
  done
  
  echo ""
  log_error "✗ ${service_name} failed to start after $((max_retries * RETRY_INTERVAL)) seconds"
  return 1
}

wait_for_port() {
  local port=$1
  local service_name=$2
  local max_retries=${3:-$MAX_RETRIES}
  
  log_info "Waiting for ${service_name} on port ${port}..."
  
  local retry=0
  while [ $retry -lt $max_retries ]; do
    if nc -z localhost ${port} 2>/dev/null; then
      log_info "✓ ${service_name} is listening on port ${port}"
      return 0
    fi
    
    ((retry++))
    if [ $retry -lt $max_retries ]; then
      echo -n "."
      sleep ${RETRY_INTERVAL}
    fi
  done
  
  echo ""
  log_error "✗ ${service_name} did not start on port ${port}"
  return 1
}

# ============================================================================
# Service Startup
# ============================================================================

start_database() {
  log_step "Starting database services"
  
  if [ "${ENV}" = "test" ] || [ "${ENV}" = "dev" ]; then
    # Check if already running
    if nc -z localhost ${POSTGRES_PORT} 2>/dev/null; then
      log_info "PostgreSQL already running"
      return 0
    fi
    
    # Start via Docker
    log_info "Starting PostgreSQL via Docker..."
    unset DOCKER_HOST
    docker compose -f docker/docker-compose.yml up -d postgres
    
    wait_for_port ${POSTGRES_PORT} "PostgreSQL" 30
  else
    log_info "Using external database (${ENV} environment)"
  fi
}

start_backend_services() {
  log_step "Starting backend services"
  
  cd "${PROJECT_ROOT}/nexo-prj"
  
  # Auth service
  log_info "Starting auth-service on port ${AUTH_PORT}..."
  pnpm nx serve auth-service > "${LOG_DIR}/auth-service.log" 2>&1 &
  echo $! > "${LOG_DIR}/auth-service.pid"
  
  wait_for_service "http://localhost:${AUTH_PORT}/health" "auth-service" 20
  
  # CRM service
  log_info "Starting crm-service on port ${CRM_PORT}..."
  pnpm nx serve crm-service > "${LOG_DIR}/crm-service.log" 2>&1 &
  echo $! > "${LOG_DIR}/crm-service.pid"
  
  wait_for_service "http://localhost:${CRM_PORT}/health" "crm-service" 20
  
  # API Gateway (optional)
  if [ "${ENV}" != "test" ]; then
    log_info "Starting api-gateway on port ${GATEWAY_PORT}..."
    pnpm nx serve api-gateway > "${LOG_DIR}/api-gateway.log" 2>&1 &
    echo $! > "${LOG_DIR}/api-gateway.pid"
    
    wait_for_service "http://localhost:${GATEWAY_PORT}/health" "api-gateway" 20
  fi
  
  cd "${PROJECT_ROOT}"
}

start_frontend() {
  log_step "Starting frontend"
  
  cd "${PROJECT_ROOT}/nexo-prj"
  
  log_info "Starting frontend on port ${FRONTEND_PORT}..."
  pnpm nx serve nexo-prj > "${LOG_DIR}/frontend.log" 2>&1 &
  echo $! > "${LOG_DIR}/frontend.pid"
  
  wait_for_service "http://localhost:${FRONTEND_PORT}" "frontend" 60
  
  cd "${PROJECT_ROOT}"
}

# ============================================================================
# Verification
# ============================================================================

verify_system() {
  log_step "Verifying system health"
  
  local errors=0
  
  # Check auth service
  if curl -s -f "http://localhost:${AUTH_PORT}/health" > /dev/null 2>&1; then
    log_info "✓ Auth service healthy"
  else
    log_error "✗ Auth service unhealthy"
    ((errors++))
  fi
  
  # Check CRM service
  if curl -s -f "http://localhost:${CRM_PORT}/health" > /dev/null 2>&1; then
    log_info "✓ CRM service healthy"
  else
    log_error "✗ CRM service unhealthy"
    ((errors++))
  fi
  
  # Check frontend
  if curl -s -f "http://localhost:${FRONTEND_PORT}" > /dev/null 2>&1; then
    log_info "✓ Frontend healthy"
  else
    log_error "✗ Frontend unhealthy"
    ((errors++))
  fi
  
  if [ $errors -gt 0 ]; then
    log_error "System verification failed with $errors error(s)"
    return 1
  fi
  
  log_info "All services healthy"
  return 0
}

print_status() {
  log_step "System Status"
  
  echo ""
  echo "Service URLs:"
  echo "  Frontend:     http://localhost:${FRONTEND_PORT}"
  echo "  Auth Service: http://localhost:${AUTH_PORT}"
  echo "  CRM Service:  http://localhost:${CRM_PORT}"
  echo "  API Gateway:  http://localhost:${GATEWAY_PORT}"
  echo ""
  echo "Database:"
  echo "  PostgreSQL:   localhost:${POSTGRES_PORT}"
  echo "  Redis:        localhost:${REDIS_PORT}"
  echo ""
  echo "Logs:"
  echo "  Directory:    ${LOG_DIR}"
  echo "  Startup:      ${LOG_FILE}"
  echo ""
  echo "PID Files:"
  echo "  auth-service: $(cat ${LOG_DIR}/auth-service.pid 2>/dev/null || echo 'N/A')"
  echo "  crm-service:  $(cat ${LOG_DIR}/crm-service.pid 2>/dev/null || echo 'N/A')"
  echo "  frontend:     $(cat ${LOG_DIR}/frontend.pid 2>/dev/null || echo 'N/A')"
  echo ""
  
  if [ -f "${LOG_DIR}/.startup-success" ]; then
    log_info "✓ System is ready for ${ENV} environment"
  fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  setup_logging
  
  log_info "============================================================================"
  log_info "NEXO CRM - Starting ${ENV} environment"
  log_info "============================================================================"
  
  # Step 1: Prerequisites
  if ! check_prerequisites; then
    log_error "Prerequisites check failed"
    exit 1
  fi
  
  # Step 2: Cleanup ports
  if ! cleanup_ports; then
    log_error "Port cleanup failed"
    exit 1
  fi
  
  # Step 3: Start database
  if ! start_database; then
    log_error "Database startup failed"
    exit 1
  fi
  
  # Step 4: Start backend services
  if ! start_backend_services; then
    log_error "Backend services startup failed"
    exit 1
  fi
  
  # Step 5: Start frontend
  if ! start_frontend; then
    log_error "Frontend startup failed"
    exit 1
  fi
  
  # Step 6: Verify system
  if ! verify_system; then
    log_error "System verification failed"
    exit 1
  fi
  
  # Mark success
  touch "${LOG_DIR}/.startup-success"
  
  # Print status
  print_status
  
  log_info "✓ Startup complete"
  return 0
}

# ============================================================================
# Entry Point
# ============================================================================

# Handle CLI arguments
case "${1:-start}" in
  start)
    main
    ;;
  status)
    print_status
    ;;
  *)
    echo "Usage: $0 {start|status}"
    exit 1
    ;;
esac
