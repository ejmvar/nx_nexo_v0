#!/usr/bin/env bash
# ============================================================================
# NEXO CRM - Robust Shutdown Script
# ============================================================================
# Universal shutdown for TEST, DEV, QA, PROD environments
# Features:
# - Graceful shutdown with timeouts
# - Force kill if needed
# - PID file cleanup
# - Resource cleanup
# - State preservation options
# ============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/tmp/logs"
LOG_FILE="${LOG_DIR}/shutdown-$(date +%Y%m%d-%H%M%S).log"

# Environment
ENV="${NEXO_ENV:-dev}"

# Shutdown configuration
GRACEFUL_TIMEOUT=10
FORCE_TIMEOUT=5

# Ports
AUTH_PORT=3001
CRM_PORT=3003
GATEWAY_PORT=3002
FRONTEND_PORT=3000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# Logging
# ============================================================================

setup_logging() {
  mkdir -p "${LOG_DIR}"
  exec > >(tee -a "${LOG_FILE}")
  exec 2>&1
  log_info "Shutdown log: ${LOG_FILE}"
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
# Process Management
# ============================================================================

stop_service_by_pid() {
  local pid_file=$1
  local service_name=$2
  
  if [ ! -f "${pid_file}" ]; then
    log_info "${service_name}: No PID file found"
    return 0
  fi
  
  local pid=$(cat "${pid_file}")
  
  if ! ps -p ${pid} > /dev/null 2>&1; then
    log_info "${service_name}: Process ${pid} not running"
    rm -f "${pid_file}"
    return 0
  fi
  
  log_info "${service_name}: Stopping process ${pid}..."
  
  # Try graceful shutdown
  kill -TERM ${pid} 2>/dev/null || true
  
  # Wait for graceful shutdown
  local waited=0
  while [ $waited -lt $GRACEFUL_TIMEOUT ]; do
    if ! ps -p ${pid} > /dev/null 2>&1; then
      log_info "${service_name}: Stopped gracefully"
      rm -f "${pid_file}"
      return 0
    fi
    sleep 1
    ((waited++))
  done
  
  # Force kill
  log_warn "${service_name}: Graceful shutdown timeout, forcing..."
  kill -KILL ${pid} 2>/dev/null || true
  sleep 1
  
  if ps -p ${pid} > /dev/null 2>&1; then
    log_error "${service_name}: Failed to stop process ${pid}"
    return 1
  fi
  
  log_info "${service_name}: Force stopped"
  rm -f "${pid_file}"
  return 0
}

stop_service_by_port() {
  local port=$1
  local service_name=$2
  
  log_info "${service_name}: Checking port ${port}..."
  
  local pids=$(lsof -ti:${port} 2>/dev/null || true)
  
  if [ -z "${pids}" ]; then
    log_info "${service_name}: No process on port ${port}"
    return 0
  fi
  
  for pid in ${pids}; do
    log_info "${service_name}: Found process ${pid} on port ${port}"
    
    # Try graceful
    kill -TERM ${pid} 2>/dev/null || true
    sleep 2
    
    # Check if stopped
    if ! ps -p ${pid} > /dev/null 2>&1; then
      log_info "${service_name}: Process ${pid} stopped gracefully"
      continue
    fi
    
    # Force kill
    log_warn "${service_name}: Force killing process ${pid}"
    kill -KILL ${pid} 2>/dev/null || true
    sleep 1
    
    if ps -p ${pid} > /dev/null 2>&1; then
      log_error "${service_name}: Failed to kill process ${pid}"
    else
      log_info "${service_name}: Process ${pid} killed"
    fi
  done
  
  return 0
}

# ============================================================================
# Service Shutdown
# ============================================================================

stop_frontend() {
  log_step "Stopping frontend"
  
  stop_service_by_pid "${LOG_DIR}/frontend.pid" "frontend"
  stop_service_by_port ${FRONTEND_PORT} "frontend"
}

stop_backend_services() {
  log_step "Stopping backend services"
  
  # Stop in reverse order
  stop_service_by_pid "${LOG_DIR}/api-gateway.pid" "api-gateway"
  stop_service_by_port ${GATEWAY_PORT} "api-gateway"
  
  stop_service_by_pid "${LOG_DIR}/crm-service.pid" "crm-service"
  stop_service_by_port ${CRM_PORT} "crm-service"
  
  stop_service_by_pid "${LOG_DIR}/auth-service.pid" "auth-service"
  stop_service_by_port ${AUTH_PORT} "auth-service"
}

stop_database() {
  log_step "Stopping database services"
  
  if [ "${ENV}" = "test" ] || [ "${ENV}" = "dev" ]; then
    if docker ps | grep -q nexo-postgres; then
      log_info "Stopping PostgreSQL container..."
      unset DOCKER_HOST
      docker compose -f docker/docker-compose.yml stop postgres
      log_info "PostgreSQL stopped"
    else
      log_info "PostgreSQL container not running"
    fi
  else
    log_info "External database (${ENV} environment) - not stopping"
  fi
}

# ============================================================================
# Cleanup
# ============================================================================

cleanup_resources() {
  log_step "Cleaning up resources"
  
  # Remove PID files
  rm -f "${LOG_DIR}"/*.pid
  
  # Remove success markers
  rm -f "${LOG_DIR}/.startup-success"
  
  # Cleanup orphaned processes
  log_info "Checking for orphaned processes..."
  
  for port in ${AUTH_PORT} ${CRM_PORT} ${GATEWAY_PORT} ${FRONTEND_PORT}; do
    local pids=$(lsof -ti:${port} 2>/dev/null || true)
    if [ -n "${pids}" ]; then
      log_warn "Found orphaned process on port ${port}: ${pids}"
      kill -KILL ${pids} 2>/dev/null || true
    fi
  done
  
  log_info "Cleanup complete"
}

# ============================================================================
# Verification
# ============================================================================

verify_shutdown() {
  log_step "Verifying shutdown"
  
  local errors=0
  
  # Check all ports are free
  for port in ${AUTH_PORT} ${CRM_PORT} ${GATEWAY_PORT} ${FRONTEND_PORT}; do
    if lsof -ti:${port} 2>/dev/null; then
      log_error "Port ${port} still in use"
      ((errors++))
    else
      log_info "✓ Port ${port} free"
    fi
  done
  
  # Check no PID files remain
  local pid_files=$(find "${LOG_DIR}" -name "*.pid" 2>/dev/null || true)
  if [ -n "${pid_files}" ]; then
    log_warn "PID files remain: ${pid_files}"
  else
    log_info "✓ No PID files"
  fi
  
  if [ $errors -gt 0 ]; then
    log_error "Shutdown verification failed with $errors error(s)"
    return 1
  fi
  
  log_info "Shutdown verified successfully"
  return 0
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  setup_logging
  
  log_info "============================================================================"
  log_info "NEXO CRM - Shutting down ${ENV} environment"
  log_info "============================================================================"
  
  # Step 1: Stop frontend
  stop_frontend
  
  # Step 2: Stop backend services
  stop_backend_services
  
  # Step 3: Stop database (optional)
  if [ "${1:-}" = "--with-db" ]; then
    stop_database
  fi
  
  # Step 4: Cleanup
  cleanup_resources
  
  # Step 5: Verify
  if ! verify_shutdown; then
    log_error "Shutdown verification failed"
    if [ "${1:-}" = "--force" ]; then
      log_warn "Force mode: continuing anyway"
    else
      exit 1
    fi
  fi
  
  log_info "✓ Shutdown complete"
  return 0
}

# ============================================================================
# Entry Point
# ============================================================================

case "${1:-stop}" in
  stop|shutdown)
    main "$@"
    ;;
  force)
    main --force
    ;;
  clean)
    main --with-db --force
    ;;
  *)
    echo "Usage: $0 {stop|force|clean}"
    echo ""
    echo "Commands:"
    echo "  stop   - Graceful shutdown (preserve database)"
    echo "  force  - Force shutdown even if verification fails"
    echo "  clean  - Stop everything including database"
    exit 1
    ;;
esac
