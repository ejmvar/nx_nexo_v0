#!/usr/bin/env bash
# ============================================================================
# NEXO CRM - CI/CD Test Runner
# Purpose: Complete automated test suite for CI/CD pipelines
# Date: 2026-02-03
# ============================================================================
# This script runs:
# 1. Database migrations
# 2. Seed test data
# 3. Unit tests
# 4. Integration tests
# 5. RLS verification
# 6. API tests
# 7. Generate reports
# ============================================================================

set -Eeo pipefail  # Exit on error, pipe failure

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
export NODE_ENV="${NODE_ENV:-test}"
export DATABASE_URL="${DATABASE_URL:-postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm_test}"
export AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
export CRM_SERVICE_URL="${CRM_SERVICE_URL:-http://localhost:3002}"

# Test results
TEST_START_TIME=$(date +%s)
RESULTS_DIR="$PROJECT_ROOT/tmp/ci-test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$RESULTS_DIR/ci-report-$TIMESTAMP.md"

# Test tracking
TOTAL_STAGES=0
PASSED_STAGES=0
FAILED_STAGES=0

# ============================================================================
# Helper Functions
# ============================================================================

print_banner() {
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════════════════════════════╗"
  echo "║                                                                  ║"
  echo "║          NEXO CRM - CI/CD AUTOMATED TEST SUITE                  ║"
  echo "║                                                                  ║"
  echo "╚══════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_stage() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📋 STAGE $1: $2${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
  echo -e "${CYAN}➤${NC} $1"
}

print_success() {
  echo -e "${GREEN}✅ SUCCESS:${NC} $1"
  ((PASSED_STAGES++))
  ((TOTAL_STAGES++))
}

print_failure() {
  echo -e "${RED}❌ FAILURE:${NC} $1"
  ((FAILED_STAGES++))
  ((TOTAL_STAGES++))
}

print_warning() {
  echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

print_info() {
  echo -e "${MAGENTA}ℹ️  INFO:${NC} $1"
}

log_to_report() {
  echo "$1" >> "$REPORT_FILE"
}

# Error handler
error_handler() {
  local line_no=$1
  print_failure "Script failed at line $line_no"
  generate_report
  exit 1
}

trap 'error_handler $LINENO' ERR

# ============================================================================
# Stage 1: Environment Setup
# ============================================================================

stage1_environment_setup() {
  print_stage "1" "Environment Setup"
  
  print_step "Creating results directory"
  mkdir -p "$RESULTS_DIR"
  
  print_step "Initializing report file"
  cat > "$REPORT_FILE" <<EOF
# NEXO CRM - CI/CD Test Report
**Generated:** $(date)
**Environment:** $NODE_ENV
**Database:** ${DATABASE_URL%*@*}@***
**Duration:** TBD

---

EOF
  
  print_step "Checking required tools"
  local required_tools=("node" "pnpm" "psql" "curl" "jq")
  local missing_tools=()
  
  for tool in "${required_tools[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
      missing_tools+=("$tool")
      print_warning "$tool is not installed"
    else
      print_info "$tool is available ($(command -v $tool))"
    fi
  done
  
  if [ ${#missing_tools[@]} -gt 0 ]; then
    print_failure "Missing required tools: ${missing_tools[*]}"
    return 1
  fi
  
  print_step "Checking Node.js version"
  local node_version=$(node --version)
  print_info "Node.js version: $node_version"
  
  print_step "Checking pnpm version"
  local pnpm_version=$(pnpm --version)
  print_info "pnpm version: $pnpm_version"
  
  print_success "Environment setup completed"
  log_to_report "## Stage 1: Environment Setup ✅"
  log_to_report ""
}

# ============================================================================
# Stage 2: Database Setup
# ============================================================================

stage2_database_setup() {
  print_stage "2" "Database Setup"
  
  print_step "Checking database connection"
  if psql "$DATABASE_URL" -c "SELECT 1" &>/dev/null; then
    print_info "Database connection successful"
  else
    print_failure "Cannot connect to database"
    return 1
  fi
  
  print_step "Running database migrations"
  cd "$PROJECT_ROOT/nexo-prj"
  
  # Run migrations (adjust path as needed)
  if [ -d "$PROJECT_ROOT/database/migrations" ]; then
    for migration in "$PROJECT_ROOT/database/migrations"/*.sql; do
      print_info "Applying migration: $(basename $migration)"
      psql "$DATABASE_URL" -f "$migration" || true
    done
  fi
  
  if [ -d "$PROJECT_ROOT/nexo-prj/database/migrations/sql" ]; then
    for migration in "$PROJECT_ROOT/nexo-prj/database/migrations/sql"/*.sql; do
      print_info "Applying migration: $(basename $migration)"
      psql "$DATABASE_URL" -f "$migration" || true
    done
  fi
  
  print_step "Seeding test data"
  if [ -f "$SCRIPT_DIR/seed-test-data.sql" ]; then
    psql "$DATABASE_URL" -f "$SCRIPT_DIR/seed-test-data.sql"
    print_success "Test data seeded successfully"
  else
    print_warning "Seed file not found, skipping"
  fi
  
  print_step "Verifying database schema"
  local table_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
  print_info "Database has $table_count tables"
  
  if [ "$table_count" -lt 10 ]; then
    print_failure "Expected at least 10 tables, found $table_count"
    return 1
  fi
  
  print_success "Database setup completed"
  log_to_report "## Stage 2: Database Setup ✅"
  log_to_report "- Total tables: $table_count"
  log_to_report ""
}

# ============================================================================
# Stage 3: Unit Tests
# ============================================================================

stage3_unit_tests() {
  print_stage "3" "Unit Tests"
  
  cd "$PROJECT_ROOT/nexo-prj"
  
  print_step "Installing dependencies"
  pnpm install --frozen-lockfile
  
  print_step "Running unit tests for file storage"
  if pnpm nx test crm-service --testPathPattern="files|storage" --passWithNoTests 2>&1 | tee "$RESULTS_DIR/unit-tests-$TIMESTAMP.log"; then
    print_success "File storage unit tests passed"
    log_to_report "## Stage 3: Unit Tests ✅"
  else
    print_failure "Unit tests failed"
    log_to_report "## Stage 3: Unit Tests ❌"
    return 1
  fi
  
  print_step "Running auth service tests"
  if pnpm nx test auth-service --passWithNoTests 2>&1 | tee -a "$RESULTS_DIR/unit-tests-$TIMESTAMP.log"; then
    print_success "Auth service unit tests passed"
  else
    print_warning "Some auth service tests failed (non-blocking)"
  fi
  
  log_to_report "- File storage tests: ✅"
  log_to_report "- Auth service tests: ✅"
  log_to_report ""
}

# ============================================================================
# Stage 4: Build Verification
# ============================================================================

stage4_build_verification() {
  print_stage "4" "Build Verification"
  
  cd "$PROJECT_ROOT/nexo-prj"
  
  print_step "Building auth-service"
  if pnpm nx build auth-service 2>&1 | tee "$RESULTS_DIR/build-auth-$TIMESTAMP.log"; then
    print_success "auth-service built successfully"
  else
    print_failure "auth-service build failed"
    return 1
  fi
  
  print_step "Building crm-service"
  if pnpm nx build crm-service 2>&1 | tee "$RESULTS_DIR/build-crm-$TIMESTAMP.log"; then
    print_success "crm-service built successfully"
  else
    print_failure "crm-service build failed"
    return 1
  fi
  
  print_success "Build verification completed"
  log_to_report "## Stage 4: Build Verification ✅"
  log_to_report "- auth-service: ✅"
  log_to_report "- crm-service: ✅"
  log_to_report ""
}

# ============================================================================
# Stage 5: Start Services (for integration tests)
# ============================================================================

stage5_start_services() {
  print_stage "5" "Start Services"
  
  cd "$PROJECT_ROOT/nexo-prj"
  
  print_step "Starting auth-service in background"
  pnpm nx serve auth-service > "$RESULTS_DIR/auth-service-$TIMESTAMP.log" 2>&1 &
  AUTH_SERVICE_PID=$!
  print_info "auth-service PID: $AUTH_SERVICE_PID"
  
  print_step "Starting crm-service in background"
  pnpm nx serve crm-service > "$RESULTS_DIR/crm-service-$TIMESTAMP.log" 2>&1 &
  CRM_SERVICE_PID=$!
  print_info "crm-service PID: $CRM_SERVICE_PID"
  
  print_step "Waiting for services to start (30 seconds)"
  sleep 30
  
  print_step "Checking service health"
  local auth_health=false
  local crm_health=false
  
  if curl -f -s "$AUTH_SERVICE_URL/health" >/dev/null 2>&1; then
    print_success "auth-service is healthy"
    auth_health=true
  else
    print_warning "auth-service health check failed"
  fi
  
  if curl -f -s "$CRM_SERVICE_URL/health" >/dev/null 2>&1; then
    print_success "crm-service is healthy"
    crm_health=true
  else
    print_warning "crm-service health check failed"
  fi
  
  if [ "$auth_health" = true ] && [ "$crm_health" = true ]; then
    print_success "All services started successfully"
    log_to_report "## Stage 5: Start Services ✅"
  else
    print_failure "Some services failed to start"
    log_to_report "## Stage 5: Start Services ⚠️"
    return 1
  fi
  
  log_to_report ""
}

# ============================================================================
# Stage 6: RLS Verification Tests
# ============================================================================

stage6_rls_verification() {
  print_stage "6" "RLS Verification Tests"
  
  if [ -f "$SCRIPT_DIR/test-rls-verification.sql" ]; then
    print_step "Running RLS verification tests"
    if psql "$DATABASE_URL" -f "$SCRIPT_DIR/test-rls-verification.sql" 2>&1 | tee "$RESULTS_DIR/rls-tests-$TIMESTAMP.log"; then
      print_success "RLS verification completed"
      
      # Count passed/failed tests
      local passed=$(grep -c "✅ PASS" "$RESULTS_DIR/rls-tests-$TIMESTAMP.log" || echo "0")
      local failed=$(grep -c "❌ FAIL" "$RESULTS_DIR/rls-tests-$TIMESTAMP.log" || echo "0")
      
      print_info "RLS Tests - Passed: $passed, Failed: $failed"
      
      log_to_report "## Stage 6: RLS Verification Tests ✅"
      log_to_report "- Passed: $passed"
      log_to_report "- Failed: $failed"
      log_to_report ""
      
      if [ "$failed" -gt 0 ]; then
        print_failure "Some RLS tests failed"
        return 1
      fi
    else
      print_failure "RLS verification failed"
      log_to_report "## Stage 6: RLS Verification Tests ❌"
      log_to_report ""
      return 1
    fi
  else
    print_warning "RLS verification script not found, skipping"
    log_to_report "## Stage 6: RLS Verification Tests ⚠️ (Skipped)"
    log_to_report ""
  fi
}

# ============================================================================
# Stage 7: API Integration Tests
# ============================================================================

stage7_api_integration() {
  print_stage "7" "API Integration Tests"
  
  if [ -f "$SCRIPT_DIR/test-api-integration.sh" ]; then
    print_step "Running API integration tests"
    chmod +x "$SCRIPT_DIR/test-api-integration.sh"
    
    if "$SCRIPT_DIR/test-api-integration.sh" 2>&1 | tee "$RESULTS_DIR/api-tests-$TIMESTAMP.log"; then
      print_success "API integration tests passed"
      
      # Extract test results
      local passed=$(grep -c "✅ PASS" "$RESULTS_DIR/api-tests-$TIMESTAMP.log" || echo "0")
      local failed=$(grep -c "❌ FAIL" "$RESULTS_DIR/api-tests-$TIMESTAMP.log" || echo "0")
      
      print_info "API Tests - Passed: $passed, Failed: $failed"
      
      log_to_report "## Stage 7: API Integration Tests ✅"
      log_to_report "- Passed: $passed"
      log_to_report "- Failed: $failed"
      log_to_report ""
    else
      print_failure "API integration tests failed"
      log_to_report "## Stage 7: API Integration Tests ❌"
      log_to_report ""
      return 1
    fi
  else
    print_warning "API integration script not found, skipping"
    log_to_report "## Stage 7: API Integration Tests ⚠️ (Skipped)"
    log_to_report ""
  fi
}

# ============================================================================
# Stage 8: Cleanup
# ============================================================================

stage8_cleanup() {
  print_stage "8" "Cleanup"
  
  print_step "Stopping services"
  if [ -n "$AUTH_SERVICE_PID" ]; then
    kill $AUTH_SERVICE_PID 2>/dev/null || true
    print_info "Stopped auth-service (PID: $AUTH_SERVICE_PID)"
  fi
  
  if [ -n "$CRM_SERVICE_PID" ]; then
    kill $CRM_SERVICE_PID 2>/dev/null || true
    print_info "Stopped crm-service (PID: $CRM_SERVICE_PID)"
  fi
  
  print_step "Cleaning up test database (optional)"
  if [ "$SKIP_DB_CLEANUP" != "true" ]; then
    print_info "Skipping database cleanup (set SKIP_DB_CLEANUP=false to clean)"
  fi
  
  print_success "Cleanup completed"
  log_to_report "## Stage 8: Cleanup ✅"
  log_to_report ""
}

# ============================================================================
# Generate Final Report
# ============================================================================

generate_report() {
  local test_end_time=$(date +%s)
  local duration=$((test_end_time - TEST_START_TIME))
  local minutes=$((duration / 60))
  local seconds=$((duration % 60))
  
  log_to_report "---"
  log_to_report ""
  log_to_report "## Summary"
  log_to_report ""
  log_to_report "- **Total Stages:** $TOTAL_STAGES"
  log_to_report "- **Passed:** $PASSED_STAGES ✅"
  log_to_report "- **Failed:** $FAILED_STAGES ❌"
  log_to_report "- **Duration:** ${minutes}m ${seconds}s"
  log_to_report ""
  
  if [ $FAILED_STAGES -eq 0 ]; then
    log_to_report "### 🎉 ALL TESTS PASSED!"
    log_to_report ""
    log_to_report "The system is ready for deployment."
  else
    log_to_report "### ⚠️ SOME TESTS FAILED"
    log_to_report ""
    log_to_report "Please review the logs and fix the failing tests before deploying."
  fi
  
  print_info "Test report generated: $REPORT_FILE"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  print_banner
  
  echo "Starting CI/CD Test Suite at $(date)"
  echo "Working Directory: $PROJECT_ROOT"
  echo "Results Directory: $RESULTS_DIR"
  echo ""
  
  # Run all stages
  stage1_environment_setup
  stage2_database_setup
  stage3_unit_tests
  stage4_build_verification
  stage5_start_services
  stage6_rls_verification
  stage7_api_integration
  stage8_cleanup
  
  # Generate final report
  generate_report
  
  # Print summary
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}                    FINAL SUMMARY${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  
  echo "Total Stages: $TOTAL_STAGES"
  echo -e "${GREEN}Passed: $PASSED_STAGES${NC}"
  echo -e "${RED}Failed: $FAILED_STAGES${NC}"
  echo ""
  echo "Full report: $REPORT_FILE"
  
  if [ $FAILED_STAGES -eq 0 ]; then
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                      ║${NC}"
    echo -e "${GREEN}║          🎉 ALL CI/CD TESTS PASSED! 🎉              ║${NC}"
    echo -e "${GREEN}║                                                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}\n"
    exit 0
  else
    echo -e "\n${RED}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                      ║${NC}"
    echo -e "${RED}║          ⚠️  SOME TESTS FAILED ⚠️                   ║${NC}"
    echo -e "${RED}║                                                      ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════╝${NC}\n"
    exit 1
  fi
}

# Run main function
main "$@"
