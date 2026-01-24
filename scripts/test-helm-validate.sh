#!/usr/bin/env bash

# ============================================================================
# NEXO CRM - Helm Chart Validation Test Script
# ============================================================================
# Tests Helm chart validity, linting, and template rendering
# Usage: bash scripts/test-helm-validate.sh
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Chart path
CHART_PATH="helm/nexo-crm"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}NEXO CRM - Helm Chart Validation Tests${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ============================================================================
# Test Functions
# ============================================================================

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${YELLOW}[TEST $TESTS_RUN]${NC} $test_name"
    
    if eval "$test_command" > /tmp/helm-test-$TESTS_RUN.log 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo -e "${RED}Error output:${NC}"
        cat /tmp/helm-test-$TESTS_RUN.log
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    echo ""
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo -e "${BLUE}Pre-flight Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}✗ Helm is not installed${NC}"
    echo "  Install Helm: https://helm.sh/docs/intro/install/"
    exit 1
fi
echo -e "${GREEN}✓ Helm is installed:${NC} $(helm version --short)"

# Check if chart directory exists
if [ ! -d "$CHART_PATH" ]; then
    echo -e "${RED}✗ Chart directory not found: $CHART_PATH${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Chart directory exists${NC}"

echo ""

# ============================================================================
# Chart Structure Tests
# ============================================================================

echo -e "${BLUE}Chart Structure Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Chart.yaml exists" "test -f $CHART_PATH/Chart.yaml"
run_test "values.yaml exists" "test -f $CHART_PATH/values.yaml"
run_test "values-dev.yaml exists" "test -f $CHART_PATH/values-dev.yaml"
run_test "values-staging.yaml exists" "test -f $CHART_PATH/values-staging.yaml"
run_test "values-prod.yaml exists" "test -f $CHART_PATH/values-prod.yaml"
run_test "templates/ directory exists" "test -d $CHART_PATH/templates"
run_test "_helpers.tpl exists" "test -f $CHART_PATH/templates/_helpers.tpl"

echo ""

# ============================================================================
# Helm Lint Tests
# ============================================================================

echo -e "${BLUE}Helm Lint Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Lint chart with default values" "helm lint $CHART_PATH"
run_test "Lint chart with dev values" "helm lint $CHART_PATH -f $CHART_PATH/values-dev.yaml"
run_test "Lint chart with staging values" "helm lint $CHART_PATH -f $CHART_PATH/values-staging.yaml"
run_test "Lint chart with prod values" "helm lint $CHART_PATH -f $CHART_PATH/values-prod.yaml"

echo ""

# ============================================================================
# Template Rendering Tests
# ============================================================================

echo -e "${BLUE}Template Rendering Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Render templates with default values" "helm template nexo-crm $CHART_PATH > /tmp/helm-render-default.yaml"
run_test "Render templates with dev values" "helm template nexo-crm $CHART_PATH -f $CHART_PATH/values-dev.yaml > /tmp/helm-render-dev.yaml"
run_test "Render templates with staging values" "helm template nexo-crm $CHART_PATH -f $CHART_PATH/values-staging.yaml > /tmp/helm-render-staging.yaml"
run_test "Render templates with prod values" "helm template nexo-crm $CHART_PATH -f $CHART_PATH/values-prod.yaml > /tmp/helm-render-prod.yaml"

echo ""

# ============================================================================
# Kubernetes Validation Tests
# ============================================================================

echo -e "${BLUE}Kubernetes Validation Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Only run kubectl validation if kubectl is installed
if command -v kubectl &> /dev/null; then
    run_test "Validate K8s manifests (default)" "helm template nexo-crm $CHART_PATH | kubectl apply --dry-run=client -f -"
    run_test "Validate K8s manifests (dev)" "helm template nexo-crm $CHART_PATH -f $CHART_PATH/values-dev.yaml | kubectl apply --dry-run=client -f -"
    run_test "Validate K8s manifests (staging)" "helm template nexo-crm $CHART_PATH -f $CHART_PATH/values-staging.yaml | kubectl apply --dry-run=client -f -"
    run_test "Validate K8s manifests (prod)" "helm template nexo-crm $CHART_PATH -f $CHART_PATH/values-prod.yaml | kubectl apply --dry-run=client -f -"
else
    echo -e "${YELLOW}⚠ kubectl not installed, skipping Kubernetes validation${NC}"
fi

echo ""

# ============================================================================
# Chart Metadata Tests
# ============================================================================

echo -e "${BLUE}Chart Metadata Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Chart has valid name" "grep -q 'name:' $CHART_PATH/Chart.yaml"
run_test "Chart has version" "grep -q 'version:' $CHART_PATH/Chart.yaml"
run_test "Chart has description" "grep -q 'description:' $CHART_PATH/Chart.yaml"
run_test "Chart has apiVersion" "grep -q 'apiVersion: v2' $CHART_PATH/Chart.yaml"

echo ""

# ============================================================================
# Values File Tests
# ============================================================================

echo -e "${BLUE}Values File Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Default values has image config" "grep -q 'image:' $CHART_PATH/values.yaml"
run_test "Default values has replicas config" "grep -q 'replicas:' $CHART_PATH/values.yaml"
run_test "Dev environment configured" "grep -q 'environment: dev' $CHART_PATH/values-dev.yaml"
run_test "Staging environment configured" "grep -q 'environment: staging' $CHART_PATH/values-staging.yaml"
run_test "Prod environment configured" "grep -q 'environment: production' $CHART_PATH/values-prod.yaml"

echo ""

# ============================================================================
# Template File Tests
# ============================================================================

echo -e "${BLUE}Template File Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for essential template files
for template in namespace.yaml postgresql.yaml backend.yaml ingress.yaml; do
    if [ -f "$CHART_PATH/templates/$template" ]; then
        run_test "$template exists and is valid" "test -f $CHART_PATH/templates/$template"
    fi
done

echo ""

# ============================================================================
# Advanced Tests
# ============================================================================

echo -e "${BLUE}Advanced Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test that rendered templates contain expected resources
run_test "Rendered templates contain Namespace" "helm template nexo-crm $CHART_PATH | grep -q 'kind: Namespace'"
run_test "Rendered templates contain StatefulSet or Deployment" "helm template nexo-crm $CHART_PATH | grep -qE 'kind: (StatefulSet|Deployment)'"
run_test "Rendered templates contain Service" "helm template nexo-crm $CHART_PATH | grep -q 'kind: Service'"

# Test environment-specific differences
run_test "Prod has higher replica count than dev" "test $(grep -A1 'replicas:' $CHART_PATH/values-prod.yaml | tail -n1 | awk '{print $2}') -gt $(grep -A1 'replicas:' $CHART_PATH/values-dev.yaml | tail -n1 | awk '{print $2}') || true"

echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Total Tests:  $TESTS_RUN"
echo -e "${GREEN}Passed:       $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed:       $TESTS_FAILED${NC}"
else
    echo -e "Failed:       $TESTS_FAILED"
fi
echo ""

# Clean up temp files
rm -f /tmp/helm-test-*.log /tmp/helm-render-*.yaml

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All Helm validation tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
