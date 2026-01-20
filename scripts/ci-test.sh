#!/bin/bash
# NEXO Frontend - CI/CD Test Script
# =================================
# Comprehensive testing for CI/CD pipelines
# Run with: ./scripts/ci-test.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ===============================
# ENVIRONMENT CHECKS
# ===============================
check_environment() {
    log_info "Checking environment..."

    # Check if we're in the right directory
    if [ ! -f "nexo-prj/package.json" ]; then
        log_error "Not in project root directory. Please run from nx_nexo_v0.20260115_frontend/"
        exit 1
    fi

    # Check MISE
    if ! command -v mise &> /dev/null; then
        log_error "MISE not found. Install from: https://mise.jdx.dev/"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found"
        exit 1
    fi

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm not found"
        exit 1
    fi

    log_success "Environment check passed"
}

# ===============================
# DEPENDENCY INSTALLATION
# ===============================
install_dependencies() {
    log_info "Installing dependencies..."

    cd nexo-prj

    # Clean install
    rm -rf node_modules pnpm-lock.yaml
    pnpm install --frozen-lockfile

    cd ..
    log_success "Dependencies installed"
}

# ===============================
# CODE QUALITY CHECKS
# ===============================
run_lint() {
    log_info "Running ESLint..."

    cd nexo-prj
    if npx nx run-many --target=lint --all; then
        log_success "ESLint passed"
    else
        log_error "ESLint failed"
        exit 1
    fi
    cd ..
}

run_typecheck() {
    log_info "Running TypeScript checks..."

    cd nexo-prj
    if npx nx run-many --target=typecheck --all; then
        log_success "TypeScript checks passed"
    else
        log_error "TypeScript checks failed"
        exit 1
    fi
    cd ..
}

# ===============================
# UNIT TESTING
# ===============================
run_unit_tests() {
    log_info "Running unit tests..."

    cd nexo-prj
    if npx nx run-many --target=test --all --coverage --watch=false; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        exit 1
    fi
    cd ..
}

# ===============================
# E2E TESTING
# ===============================
run_e2e_tests() {
    log_info "Running E2E tests..."

    cd nexo-prj
    if npx nx run-many --target=e2e --all; then
        log_success "E2E tests passed"
    else
        log_error "E2E tests failed"
        exit 1
    fi
    cd ..
}

# ===============================
# BUILD VERIFICATION
# ===============================
run_build() {
    log_info "Running production build..."

    cd nexo-prj
    if npx nx run-many --target=build --all; then
        log_success "Production build successful"
    else
        log_error "Production build failed"
        exit 1
    fi
    cd ..
}

# ===============================
# PERFORMANCE CHECKS
# ===============================
run_performance_checks() {
    log_info "Running performance checks..."

    cd nexo-prj

    # Measure build time
    log_info "Measuring build performance..."
    BUILD_START=$(date +%s)
    npx nx build nexo-prj > /dev/null 2>&1
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))

    if [ $BUILD_TIME -gt 120 ]; then
        log_warning "Build time: ${BUILD_TIME}s (target: <120s)"
    else
        log_success "Build time: ${BUILD_TIME}s"
    fi

    # Measure test time
    log_info "Measuring test performance..."
    TEST_START=$(date +%s)
    npx nx run-many --target=test --all --watch=false > /dev/null 2>&1
    TEST_END=$(date +%s)
    TEST_TIME=$((TEST_END - TEST_START))

    if [ $TEST_TIME -gt 60 ]; then
        log_warning "Test time: ${TEST_TIME}s (target: <60s)"
    else
        log_success "Test time: ${TEST_TIME}s"
    fi

    cd ..
}

# ===============================
# COVERAGE REPORTING
# ===============================
check_coverage() {
    log_info "Checking test coverage..."

    cd nexo-prj

    # Check if coverage directory exists
    if [ -d "coverage" ]; then
        log_info "Coverage report generated"

        # Check coverage thresholds (basic check)
        if [ -f "coverage/coverage-summary.json" ]; then
            COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json 2>/dev/null || echo "0")
            if (( $(echo "$COVERAGE < 80" | bc -l 2>/dev/null || echo "1") )); then
                log_warning "Coverage: ${COVERAGE}% (target: >80%)"
            else
                log_success "Coverage: ${COVERAGE}%"
            fi
        fi
    else
        log_warning "No coverage report found"
    fi

    cd ..
}

# ===============================
# MAIN CI PIPELINE
# ===============================
run_ci_pipeline() {
    log_info "Starting CI/CD pipeline..."

    check_environment
    install_dependencies
    run_lint
    run_typecheck
    run_unit_tests
    run_e2e_tests
    run_build
    run_performance_checks
    check_coverage

    log_success "🎉 CI/CD pipeline completed successfully!"
}

# ===============================
# INDIVIDUAL TEST PHASES
# ===============================
run_lint_only() {
    check_environment
    install_dependencies
    run_lint
}

run_test_only() {
    check_environment
    install_dependencies
    run_unit_tests
}

run_build_only() {
    check_environment
    install_dependencies
    run_build
}

# ===============================
# HELP
# ===============================
show_help() {
    echo "NEXO Frontend - CI/CD Test Script"
    echo "=================================="
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  ci         Run complete CI pipeline (default)"
    echo "  lint       Run only linting checks"
    echo "  test       Run only unit tests"
    echo "  build      Run only build verification"
    echo "  help       Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 ci      # Run full pipeline"
    echo "  $0 test    # Run only tests"
    echo "  $0         # Run full pipeline (default)"
}

# ===============================
# SCRIPT ENTRY POINT
# ===============================
case "${1:-ci}" in
    "ci")
        run_ci_pipeline
        ;;
    "lint")
        run_lint_only
        ;;
    "test")
        run_test_only
        ;;
    "build")
        run_build_only
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac