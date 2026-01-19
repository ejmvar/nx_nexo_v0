#!/bin/bash
# ============================================================================
# CI/CD Test Pipeline Script
# ============================================================================
# Comprehensive test suite for CI/CD environments
# Usage: bash scripts/ci-test.sh
# ============================================================================

set -e

echo "🚀 Starting CI/CD Test Pipeline..."
echo "============================================"

EXIT_CODE=0

# Function to run test with error handling
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo ""
    echo "📋 Running: $test_name"
    echo "============================================"
    
    if eval "$test_command"; then
        echo "✅ PASSED: $test_name"
    else
        echo "❌ FAILED: $test_name"
        EXIT_CODE=1
    fi
}

# 1. Validate Docker Compose configuration
run_test "Docker Compose Validation" \
    "docker compose -f docker/docker-compose.yml config > /dev/null"

# 2. Validate Kubernetes manifests
run_test "Kubernetes Manifests Validation" \
    "bash scripts/validate-k8s.sh"

# 3. Check if Nx is installed (if nexo-prj exists)
if [ -d "nexo-prj" ]; then
    run_test "Nx Installation Check" \
        "cd nexo-prj && nx --version"
    
    # 4. Install dependencies
    run_test "Install Dependencies" \
        "cd nexo-prj && pnpm install --frozen-lockfile"
    
    # 5. Lint all projects
    run_test "Lint All Projects" \
        "cd nexo-prj && nx run-many --target=lint --all"
    
    # 6. Test all projects
    run_test "Test All Projects" \
        "cd nexo-prj && nx run-many --target=test --all"
    
    # 7. Build all projects
    run_test "Build All Projects" \
        "cd nexo-prj && nx run-many --target=build --all"
else
    echo "⚠️  nexo-prj directory not found, skipping application tests"
fi

# Summary
echo ""
echo "============================================"
echo "📊 CI/CD Test Pipeline Summary"
echo "============================================"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "🎉 Ready for deployment"
else
    echo "❌ Some tests failed"
    echo "🔍 Please review the errors above"
fi

exit $EXIT_CODE
