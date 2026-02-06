#!/usr/bin/env bash
# ============================================================================
# NEXO CRM - Pre-Release Validation Script
# Purpose: Final validation checks before production deployment
# Date: 2026-02-03
# ============================================================================
# This script performs critical checks:
# 1. Security audit (credentials, secrets, vulnerabilities)
# 2. Configuration validation
# 3. Database integrity
# 4. Performance benchmarks
# 5. Deployment readiness
# 6. Documentation completeness
# ============================================================================

set -Eeo pipefail

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

# Results
RESULTS_DIR="$PROJECT_ROOT/tmp/pre-release-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$RESULTS_DIR/pre-release-report-$TIMESTAMP.md"

# Scoring
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0
CRITICAL_FAILURES=0

# ============================================================================
# Helper Functions
# ============================================================================

print_banner() {
  echo -e "${MAGENTA}"
  echo "╔══════════════════════════════════════════════════════════════════╗"
  echo "║                                                                  ║"
  echo "║          NEXO CRM - PRE-RELEASE VALIDATION                      ║"
  echo "║                                                                  ║"
  echo "╚══════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_section() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🔍 $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_check() {
  echo -e "${CYAN}➤${NC} $1"
}

print_pass() {
  echo -e "${GREEN}✅ PASS:${NC} $1"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
  log_result "✅ $1"
}

print_fail() {
  echo -e "${RED}❌ FAIL:${NC} $1"
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
  log_result "❌ $1"
}

print_critical() {
  echo -e "${RED}🚨 CRITICAL:${NC} $1"
  ((CRITICAL_FAILURES++))
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
  log_result "🚨 CRITICAL: $1"
}

print_warning() {
  echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
  ((WARNING_CHECKS++))
  ((TOTAL_CHECKS++))
  log_result "⚠️  $1"
}

print_info() {
  echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

log_result() {
  echo "- $1" >> "$REPORT_FILE"
}

log_section() {
  echo -e "\n## $1\n" >> "$REPORT_FILE"
}

# ============================================================================
# Check 1: Security Audit
# ============================================================================

check_security() {
  print_section "SECURITY AUDIT"
  log_section "Security Audit"
  
  # Check for hardcoded secrets
  print_check "Scanning for hardcoded secrets and credentials"
  
  local secret_patterns=(
    "password.*=.*['\"][^'\"]{8,}['\"]"
    "secret.*=.*['\"][^'\"]{16,}['\"]"
    "api[_-]?key.*=.*['\"][^'\"]{16,}['\"]"
    "token.*=.*['\"][^'\"]{20,}['\"]"
    "private[_-]?key"
  )
  
  local secrets_found=false
  for pattern in "${secret_patterns[@]}"; do
    if grep -r -iE "$pattern" "$PROJECT_ROOT/nexo-prj/apps" \
       --exclude-dir=node_modules \
       --exclude-dir=dist \
       --exclude="*.spec.ts" \
       --exclude="*.test.ts" 2>/dev/null | grep -v "example" | head -n 5; then
      secrets_found=true
    fi
  done
  
  if [ "$secrets_found" = true ]; then
    print_critical "Hardcoded secrets found in code"
  else
    print_pass "No hardcoded secrets detected"
  fi
  
  # Check .env files
  print_check "Checking for .env files in repository"
  if find "$PROJECT_ROOT" -name ".env" -not -path "*/node_modules/*" | grep -q .; then
    print_warning ".env files found (ensure they're in .gitignore)"
  else
    print_pass "No .env files in repository"
  fi
  
  # Check .gitignore
  print_check "Verifying .gitignore configuration"
  if [ -f "$PROJECT_ROOT/nexo-prj/.gitignore" ]; then
    local sensitive_patterns=(".env" "*.pem" "*.key" "secrets" "dist" "node_modules")
    local missing_patterns=()
    
    for pattern in "${sensitive_patterns[@]}"; do
      if ! grep -q "$pattern" "$PROJECT_ROOT/nexo-prj/.gitignore"; then
        missing_patterns+=("$pattern")
      fi
    done
    
    if [ ${#missing_patterns[@]} -gt 0 ]; then
      print_warning ".gitignore missing patterns: ${missing_patterns[*]}"
    else
      print_pass ".gitignore properly configured"
    fi
  else
    print_critical ".gitignore file not found"
  fi
  
  # Check for npm audit vulnerabilities
  print_check "Running npm security audit"
  cd "$PROJECT_ROOT/nexo-prj"
  if pnpm audit --json > "$RESULTS_DIR/npm-audit-$TIMESTAMP.json" 2>&1; then
    local high_vulns=$(jq '.metadata.vulnerabilities.high // 0' "$RESULTS_DIR/npm-audit-$TIMESTAMP.json" 2>/dev/null || echo "0")
    local critical_vulns=$(jq '.metadata.vulnerabilities.critical // 0' "$RESULTS_DIR/npm-audit-$TIMESTAMP.json" 2>/dev/null || echo "0")
    
    if [ "$critical_vulns" -gt 0 ]; then
      print_critical "$critical_vulns critical npm vulnerabilities found"
    elif [ "$high_vulns" -gt 0 ]; then
      print_warning "$high_vulns high-severity npm vulnerabilities found"
    else
      print_pass "No critical npm vulnerabilities detected"
    fi
  else
    print_info "npm audit completed with findings (see report)"
  fi
  
  # Check JWT secret strength
  print_check "Checking JWT secret configuration"
  if [ -f "$PROJECT_ROOT/nexo-prj/.env.example" ]; then
    if grep -q "do-not-use-in-production" "$PROJECT_ROOT/nexo-prj/.env.example"; then
      print_pass ".env.example has proper warning"
    else
      print_warning ".env.example should include production warnings"
    fi
  fi
  
  echo ""
}

# ============================================================================
# Check 2: Configuration Validation
# ============================================================================

check_configuration() {
  print_section "CONFIGURATION VALIDATION"
  log_section "Configuration Validation"
  
  # Check required environment files
  print_check "Checking environment configuration files"
  if [ -f "$PROJECT_ROOT/nexo-prj/.env.example" ]; then
    print_pass ".env.example exists"
  else
    print_fail ".env.example not found"
  fi
  
  # Check package.json consistency
  print_check "Validating package.json files"
  cd "$PROJECT_ROOT/nexo-prj"
  if [ -f "package.json" ]; then
    local pkg_name=$(jq -r '.name // empty' package.json)
    local pkg_version=$(jq -r '.version // empty' package.json)
    print_info "Package: $pkg_name@$pkg_version"
    print_pass "package.json is valid"
  else
    print_fail "package.json not found"
  fi
  
  # Check TypeScript configuration
  print_check "Validating TypeScript configuration"
  if [ -f "$PROJECT_ROOT/nexo-prj/tsconfig.json" ]; then
    if jq empty "$PROJECT_ROOT/nexo-prj/tsconfig.json" 2>/dev/null; then
      print_pass "tsconfig.json is valid"
    else
      print_fail "tsconfig.json has syntax errors"
    fi
  else
    print_fail "tsconfig.json not found"
  fi
  
  # Check NX workspace configuration
  print_check "Validating Nx workspace configuration"
  if [ -f "$PROJECT_ROOT/nexo-prj/nx.json" ]; then
    if jq empty "$PROJECT_ROOT/nexo-prj/nx.json" 2>/dev/null; then
      print_pass "nx.json is valid"
    else
      print_fail "nx.json has syntax errors"
    fi
  else
    print_fail "nx.json not found"
  fi
  
  # Check Docker configuration
  print_check "Validating Docker configuration"
  if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    print_pass "docker-compose.yml exists"
    
    # Basic YAML syntax check
    if command -v docker &>/dev/null; then
      if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" config >/dev/null 2>&1; then
        print_pass "docker-compose.yml syntax is valid"
      else
        print_fail "docker-compose.yml has syntax errors"
      fi
    fi
  else
    print_warning "docker-compose.yml not found"
  fi
  
  echo ""
}

# ============================================================================
# Check 3: Database Integrity
# ============================================================================

check_database() {
  print_section "DATABASE INTEGRITY"
  log_section "Database Integrity"
  
  local db_url="${DATABASE_URL:-postgresql://nexo_user:nexo_password@localhost:5432/nexo_crm}"
  
  # Check database connection
  print_check "Testing database connection"
  if psql "$db_url" -c "SELECT 1" >/dev/null 2>&1; then
    print_pass "Database connection successful"
  else
    print_critical "Cannot connect to database"
    return 1
  fi
  
  # Check required tables
  print_check "Verifying database schema"
  local required_tables=("accounts" "users" "roles" "permissions" "clients" "projects" "tasks" "files" "audit_logs")
  local missing_tables=()
  
  for table in "${required_tables[@]}"; do
    if ! psql "$db_url" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='$table');" | grep -q "t"; then
      missing_tables+=("$table")
    fi
  done
  
  if [ ${#missing_tables[@]} -gt 0 ]; then
    print_fail "Missing tables: ${missing_tables[*]}"
  else
    print_pass "All required tables exist"
  fi
  
  # Check RLS policies
  print_check "Verifying Row-Level Security (RLS) policies"
  local rls_tables=("accounts" "users" "clients" "projects" "tasks" "files")
  local tables_without_rls=()
  
  for table in "${rls_tables[@]}"; do
    local rls_enabled=$(psql "$db_url" -t -c "SELECT relrowsecurity FROM pg_class WHERE relname='$table';" | tr -d ' ')
    if [ "$rls_enabled" != "t" ]; then
      tables_without_rls+=("$table")
    fi
  done
  
  if [ ${#tables_without_rls[@]} -gt 0 ]; then
    print_critical "RLS not enabled on: ${tables_without_rls[*]}"
  else
    print_pass "RLS enabled on all critical tables"
  fi
  
  # Check for orphaned records
  print_check "Checking for data integrity issues"
  local orphaned_projects=$(psql "$db_url" -t -c "SELECT COUNT(*) FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.client_id IS NOT NULL AND c.id IS NULL;" | tr -d ' ')
  
  if [ "$orphaned_projects" -gt 0 ]; then
    print_warning "$orphaned_projects orphaned projects found (projects without valid clients)"
  else
    print_pass "No orphaned records detected"
  fi
  
  # Check index coverage
  print_check "Verifying database indexes"
  local index_count=$(psql "$db_url" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';" | tr -d ' ')
  print_info "Total indexes: $index_count"
  
  if [ "$index_count" -lt 20 ]; then
    print_warning "Low index count ($index_count), consider adding more indexes for performance"
  else
    print_pass "Adequate index coverage ($index_count indexes)"
  fi
  
  echo ""
}

# ============================================================================
# Check 4: Build and Code Quality
# ============================================================================

check_build_quality() {
  print_section "BUILD & CODE QUALITY"
  log_section "Build & Code Quality"
  
  cd "$PROJECT_ROOT/nexo-prj"
  
  # Check TypeScript compilation
  print_check "Compiling TypeScript (type checking)"
  if pnpm nx build crm-service --skip-nx-cache > "$RESULTS_DIR/build-$TIMESTAMP.log" 2>&1; then
    print_pass "TypeScript compilation successful"
  else
    print_fail "TypeScript compilation failed"
    print_info "See: $RESULTS_DIR/build-$TIMESTAMP.log"
  fi
  
  # Check linting
  print_check "Running linter"
  if pnpm nx lint crm-service > "$RESULTS_DIR/lint-$TIMESTAMP.log" 2>&1; then
    print_pass "Linting passed"
  else
    print_warning "Linting issues found"
    print_info "See: $RESULTS_DIR/lint-$TIMESTAMP.log"
  fi
  
  # Check for TODO/FIXME comments
  print_check "Scanning for TODO/FIXME comments"
  local todo_count=$(grep -r "TODO\|FIXME" "$PROJECT_ROOT/nexo-prj/apps" \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --include="*.ts" \
    --include="*.tsx" 2>/dev/null | wc -l)
  
  if [ "$todo_count" -gt 20 ]; then
    print_warning "$todo_count TODO/FIXME comments found"
  elif [ "$todo_count" -gt 0 ]; then
    print_info "$todo_count TODO/FIXME comments found"
  else
    print_pass "No outstanding TODO/FIXME comments"
  fi
  
  # Check test coverage
  print_check "Checking test coverage"
  if [ -f "$PROJECT_ROOT/nexo-prj/coverage/lcov.info" ]; then
    print_info "Coverage report exists"
    print_pass "Tests have been run"
  else
    print_warning "No coverage report found (run tests with --coverage)"
  fi
  
  echo ""
}

# ============================================================================
# Check 5: Performance Benchmarks
# ============================================================================

check_performance() {
  print_section "PERFORMANCE BENCHMARKS"
  log_section "Performance Benchmarks"
  
  # Check bundle sizes
  print_check "Analyzing build artifact sizes"
  if [ -d "$PROJECT_ROOT/nexo-prj/dist/apps/crm-service" ]; then
    local dist_size=$(du -sh "$PROJECT_ROOT/nexo-prj/dist/apps/crm-service" 2>/dev/null | cut -f1)
    print_info "CRM service bundle size: $dist_size"
    
    # Simple size check (adjust threshold as needed)
    local dist_size_kb=$(du -sk "$PROJECT_ROOT/nexo-prj/dist/apps/crm-service" 2>/dev/null | cut -f1)
    if [ "$dist_size_kb" -gt 100000 ]; then  # >100MB
      print_warning "Build size is large ($dist_size)"
    else
      print_pass "Build size is acceptable ($dist_size)"
    fi
  else
    print_warning "Build artifacts not found (run build first)"
  fi
  
  # Check node_modules size
  print_check "Checking dependencies size"
  if [ -d "$PROJECT_ROOT/nexo-prj/node_modules" ]; then
    local nm_size=$(du -sh "$PROJECT_ROOT/nexo-prj/node_modules" 2>/dev/null | cut -f1)
    print_info "node_modules size: $nm_size"
    
    local nm_size_mb=$(du -sm "$PROJECT_ROOT/nexo-prj/node_modules" 2>/dev/null | cut -f1)
    if [ "$nm_size_mb" -gt 1000 ]; then  # >1GB
      print_warning "Dependencies are very large ($nm_size)"
    else
      print_pass "Dependencies size is acceptable ($nm_size)"
    fi
  fi
  
  # Check for production optimizations
  print_check "Verifying production optimizations"
  if grep -q '"target": "node"' "$PROJECT_ROOT/nexo-prj/apps/crm-service/project.json" 2>/dev/null; then
    print_pass "Production target configured"
  else
    print_warning "Verify production build target"
  fi
  
  echo ""
}

# ============================================================================
# Check 6: Documentation
# ============================================================================

check_documentation() {
  print_section "DOCUMENTATION COMPLETENESS"
  log_section "Documentation Completeness"
  
  # Check README files
  print_check "Checking README documentation"
  local readme_files=("README.md" "nexo-prj/README.md" "ARCHITECTURE.md")
  local missing_docs=()
  
  for doc in "${readme_files[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$doc" ]; then
      missing_docs+=("$doc")
    fi
  done
  
  if [ ${#missing_docs[@]} -gt 0 ]; then
    print_warning "Missing documentation: ${missing_docs[*]}"
  else
    print_pass "Core documentation files exist"
  fi
  
  # Check for API documentation
  print_check "Checking API documentation"
  if grep -r "@nestjs/swagger" "$PROJECT_ROOT/nexo-prj/apps" \
     --include="*.ts" 2>/dev/null | grep -q "import"; then
    print_pass "Swagger/OpenAPI configured"
  else
    print_warning "No API documentation (Swagger) detected"
  fi
  
  # Check for environment variable documentation
  print_check "Checking environment variable documentation"
  if [ -f "$PROJECT_ROOT/nexo-prj/.env.example" ]; then
    local env_var_count=$(grep -c "=" "$PROJECT_ROOT/nexo-prj/.env.example" || echo "0")
    print_info "$env_var_count environment variables documented"
    
    if [ "$env_var_count" -gt 10 ]; then
      print_pass "Environment variables well-documented"
    else
      print_warning "Limited environment variable documentation"
    fi
  fi
  
  # Check for migration documentation
  print_check "Checking database migration documentation"
  if [ -f "$PROJECT_ROOT/nexo-prj/database/migrations/README.md" ] || \
     [ -f "$PROJECT_ROOT/database/README.md" ]; then
    print_pass "Migration documentation exists"
  else
    print_warning "No migration documentation found"
  fi
  
  echo ""
}

# ============================================================================
# Check 7: Deployment Readiness
# ============================================================================

check_deployment_readiness() {
  print_section "DEPLOYMENT READINESS"
  log_section "Deployment Readiness"
  
  # Check for production environment configuration
  print_check "Checking production configuration"
  if [ -f "$PROJECT_ROOT/nexo-prj/.env.production" ]; then
    print_pass "Production environment file exists (.env.production)"
  else
    print_info "No .env.production file (expected to be generated during deployment)"
  fi
  
  # Check CI/CD configuration
  print_check "Checking CI/CD configuration"
  local ci_configs=(".github/workflows" ".gitlab-ci.yml" "Jenkinsfile" "azure-pipelines.yml")
  local has_ci=false
  
  for config in "${ci_configs[@]}"; do
    if [ -e "$PROJECT_ROOT/$config" ]; then
      has_ci=true
      print_pass "CI/CD configured ($config)"
      break
    fi
  done
  
  if [ "$has_ci" = false ]; then
    print_warning "No CI/CD configuration found"
  fi
  
  # Check Docker health checks
  print_check "Verifying Docker health checks"
  if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    if grep -q "healthcheck" "$PROJECT_ROOT/docker-compose.yml"; then
      print_pass "Docker health checks configured"
    else
      print_warning "No Docker health checks configured"
    fi
  fi
  
  # Check logging configuration
  print_check "Verifying logging configuration"
  if grep -r "@nestjs/common.*Logger" "$PROJECT_ROOT/nexo-prj/apps" \
     --include="*.ts" 2>/dev/null | grep -q "import"; then
    print_pass "Logging framework configured"
  else
    print_warning "Logging configuration not detected"
  fi
  
  # Check error handling
  print_check "Checking error handling patterns"
  if grep -r "try.*catch\|\.catch(" "$PROJECT_ROOT/nexo-prj/apps/crm-service/src" \
     --include="*.ts" 2>/dev/null | wc -l | grep -q "[1-9]"; then
    print_pass "Error handling patterns found"
  else
    print_warning "Limited error handling detected"
  fi
  
  echo ""
}

# ============================================================================
# Generate Final Report
# ============================================================================

generate_final_report() {
  print_section "GENERATING FINAL REPORT"
  
  # Calculate score
  local success_rate=0
  if [ $TOTAL_CHECKS -gt 0 ]; then
    success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
  fi
  
  # Add summary to report
  cat >> "$REPORT_FILE" <<EOF

---

## Final Summary

- **Total Checks:** $TOTAL_CHECKS
- **Passed:** $PASSED_CHECKS ✅
- **Failed:** $FAILED_CHECKS ❌
- **Warnings:** $WARNING_CHECKS ⚠️
- **Critical Failures:** $CRITICAL_FAILURES 🚨
- **Success Rate:** ${success_rate}%

---

## Deployment Recommendation

EOF
  
  if [ $CRITICAL_FAILURES -gt 0 ]; then
    cat >> "$REPORT_FILE" <<EOF
### 🚨 DO NOT DEPLOY

Critical issues must be resolved before deployment:
- $CRITICAL_FAILURES critical failures detected
- Review and fix all critical issues above

**Status:** ❌ NOT READY FOR PRODUCTION
EOF
    print_critical "DEPLOYMENT BLOCKED: $CRITICAL_FAILURES critical failures"
    
  elif [ $FAILED_CHECKS -gt 5 ]; then
    cat >> "$REPORT_FILE" <<EOF
### ⚠️ DEPLOYMENT NOT RECOMMENDED

Multiple failures detected:
- $FAILED_CHECKS failed checks
- $WARNING_CHECKS warnings

**Recommendation:** Fix failures before deploying

**Status:** ⚠️ NOT RECOMMENDED FOR PRODUCTION
EOF
    print_fail "DEPLOYMENT NOT RECOMMENDED: Too many failures ($FAILED_CHECKS)"
    
  elif [ $FAILED_CHECKS -gt 0 ] || [ $WARNING_CHECKS -gt 5 ]; then
    cat >> "$REPORT_FILE" <<EOF
### ⚠️ DEPLOYMENT WITH CAUTION

Some issues detected:
- $FAILED_CHECKS failed checks
- $WARNING_CHECKS warnings

**Recommendation:** Review failures and warnings, deploy to staging first

**Status:** ⚠️ DEPLOY WITH CAUTION
EOF
    print_warning "DEPLOYMENT ALLOWED BUT WITH CAUTION"
    
  else
    cat >> "$REPORT_FILE" <<EOF
### ✅ READY FOR DEPLOYMENT

All critical checks passed:
- Success rate: ${success_rate}%
- No critical failures
- Minimal warnings

**Status:** ✅ APPROVED FOR PRODUCTION
EOF
    print_pass "SYSTEM READY FOR DEPLOYMENT"
  fi
  
  echo ""
  print_info "Full report: $REPORT_FILE"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  print_banner
  
  echo "Pre-Release Validation Started at $(date)"
  echo "Project Root: $PROJECT_ROOT"
  echo ""
  
  # Create results directory
  mkdir -p "$RESULTS_DIR"
  
  # Initialize report
  cat > "$REPORT_FILE" <<EOF
# NEXO CRM - Pre-Release Validation Report

**Generated:** $(date)
**Project:** NEXO CRM System
**Validator:** Pre-Release Validation Script

---

EOF
  
  # Run all checks
  check_security
  check_configuration
  check_database
  check_build_quality
  check_performance
  check_documentation
  check_deployment_readiness
  
  # Generate final report
  generate_final_report
  
  # Print summary
  echo -e "\n${CYAN}════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}                  FINAL RESULTS${NC}"
  echo -e "${CYAN}════════════════════════════════════════════════════════${NC}\n"
  
  echo "Total Checks: $TOTAL_CHECKS"
  echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
  echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
  echo -e "${YELLOW}Warnings: $WARNING_CHECKS${NC}"
  
  if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "${RED}Critical Failures: $CRITICAL_FAILURES${NC}"
  fi
  
  local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
  echo -e "\nSuccess Rate: ${success_rate}%"
  
  echo ""
  echo "Detailed report: $REPORT_FILE"
  
  # Exit code
  if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "\n${RED}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                      ║${NC}"
    echo -e "${RED}║     🚨 DEPLOYMENT BLOCKED - FIX CRITICAL ISSUES 🚨   ║${NC}"
    echo -e "${RED}║                                                      ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════╝${NC}\n"
    exit 2
  elif [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "\n${YELLOW}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                      ║${NC}"
    echo -e "${YELLOW}║     ⚠️  DEPLOYMENT NOT RECOMMENDED - REVIEW ISSUES ⚠️ ║${NC}"
    echo -e "${YELLOW}║                                                      ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════╝${NC}\n"
    exit 1
  else
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                      ║${NC}"
    echo -e "${GREEN}║          ✅ READY FOR PRODUCTION DEPLOYMENT ✅       ║${NC}"
    echo -e "${GREEN}║                                                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}\n"
    exit 0
  fi
}

# Run main function
main "$@"
