#!/bin/bash

# ============================================================================
# Alert Testing Script for NEXO CRM
# ============================================================================
# This script tests Prometheus alerting rules by simulating various failure
# scenarios and verifying that alerts fire and resolve correctly.
#
# Usage:
#   ./test-alerts.sh [test-name]
#
# Available tests:
#   - service-down       Test ServiceDown alert
#   - high-error-rate    Test HighServerErrorRate alert
#   - high-latency       Test HighLatencyP95 alert
#   - high-cpu           Test HighCPUUsage alert
#   - high-memory        Test HighMemoryUsage alert
#   - all                Run all tests
#
# Prerequisites:
#   - All services must be running
#   - Prometheus must be accessible at http://localhost:9090
#   - AlertManager must be accessible at http://localhost:9093
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
ALERTMANAGER_URL="${ALERTMANAGER_URL:-http://localhost:9093}"
CRM_SERVICE_URL="${CRM_SERVICE_URL:-http://localhost:3003}"
AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:3002}"

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if service is reachable
check_service() {
    local url=$1
    local name=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        log_success "$name is reachable at $url"
        return 0
    else
        log_error "$name is not reachable at $url"
        return 1
    fi
}

# Check if alert is firing in Prometheus
check_alert_firing() {
    local alert_name=$1
    local timeout=${2:-120}  # Default 2 minutes
    local elapsed=0
    
    log_info "Waiting for alert '$alert_name' to fire (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        local response=$(curl -s "${PROMETHEUS_URL}/api/v1/alerts" | jq -r ".data.alerts[] | select(.labels.alertname==\"$alert_name\") | .state")
        
        if [ "$response" == "firing" ]; then
            log_success "Alert '$alert_name' is FIRING ✓"
            return 0
        fi
        
        sleep 5
        elapsed=$((elapsed + 5))
        echo -n "."
    done
    
    echo ""
    log_error "Alert '$alert_name' did not fire within ${timeout}s ✗"
    return 1
}

# Check if alert has resolved in Prometheus
check_alert_resolved() {
    local alert_name=$1
    local timeout=${2:-120}  # Default 2 minutes
    local elapsed=0
    
    log_info "Waiting for alert '$alert_name' to resolve (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        local response=$(curl -s "${PROMETHEUS_URL}/api/v1/alerts" | jq -r ".data.alerts[] | select(.labels.alertname==\"$alert_name\") | .state")
        
        if [ -z "$response" ] || [ "$response" == "inactive" ]; then
            log_success "Alert '$alert_name' has RESOLVED ✓"
            return 0
        fi
        
        sleep 5
        elapsed=$((elapsed + 5))
        echo -n "."
    done
    
    echo ""
    log_warning "Alert '$alert_name' did not resolve within ${timeout}s (may need more time)"
    return 1
}

# Check if alert appears in AlertManager
check_alertmanager() {
    local alert_name=$1
    
    local response=$(curl -s "${ALERTMANAGER_URL}/api/v2/alerts" | jq -r ".[] | select(.labels.alertname==\"$alert_name\") | .status.state")
    
    if [ -n "$response" ]; then
        log_success "Alert '$alert_name' is in AlertManager (state: $response) ✓"
        return 0
    else
        log_warning "Alert '$alert_name' not found in AlertManager (may not have reached yet)"
        return 1
    fi
}

# ============================================================================
# Test Cases
# ============================================================================

test_service_down() {
    log_info "=========================================="
    log_info "TEST: ServiceDown Alert"
    log_info "=========================================="
    
    log_info "Step 1: Stopping CRM service..."
    docker stop nexo-crm-service 2>/dev/null || pkill -f "nx:serve:crm-service" || true
    log_success "CRM service stopped"
    
    log_info "Step 2: Waiting for Prometheus to detect service down..."
    sleep 20  # Wait for scrape interval + evaluation
    
    log_info "Step 3: Checking if ServiceDown alert is firing..."
    if check_alert_firing "ServiceDown" 90; then
        log_success "✓ ServiceDown alert test PASSED"
    else
        log_error "✗ ServiceDown alert test FAILED"
    fi
    
    log_info "Step 4: Checking AlertManager..."
    sleep 10  # Wait for alert to reach AlertManager
    check_alertmanager "ServiceDown"
    
    log_info "Step 5: Restarting CRM service..."
    cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj
    nohup pnpm nx serve crm-service > /tmp/crm-service.log 2>&1 &
    log_success "CRM service restarted"
    
    log_info "Step 6: Waiting for service to be healthy..."
    sleep 30
    
    log_info "Step 7: Checking if alert has resolved..."
    if check_alert_resolved "ServiceDown" 90; then
        log_success "✓ Alert resolution test PASSED"
    else
        log_warning "Alert may take longer to resolve"
    fi
    
    log_info "=========================================="
}

test_high_error_rate() {
    log_info "=========================================="
    log_info "TEST: HighServerErrorRate Alert"
    log_info "=========================================="
    
    log_info "Step 1: Generating 5xx errors..."
    log_info "Sending 100 requests that will cause 500 errors..."
    
    # Generate errors by hitting a non-existent endpoint or causing errors
    for i in {1..100}; do
        curl -X POST "${CRM_SERVICE_URL}/api/trigger-error" -H "Content-Type: application/json" -d '{"test":true}' > /dev/null 2>&1 || true
        [ $((i % 10)) -eq 0 ] && echo -n "."
    done
    echo ""
    log_success "Generated error requests"
    
    log_info "Step 2: Waiting for metrics to be scraped and alert to evaluate..."
    sleep 30
    
    log_info "Step 3: Checking if HighServerErrorRate alert is firing..."
    if check_alert_firing "HighServerErrorRate" 90; then
        log_success "✓ HighServerErrorRate alert test PASSED"
    else
        log_error "✗ HighServerErrorRate alert test FAILED"
    fi
    
    log_info "Step 4: Checking AlertManager..."
    sleep 10
    check_alertmanager "HighServerErrorRate"
    
    log_info "Step 5: Sending successful requests to clear error rate..."
    for i in {1..200}; do
        curl -s "${CRM_SERVICE_URL}/api/health" > /dev/null 2>&1 || true
        [ $((i % 20)) -eq 0 ] && echo -n "."
    done
    echo ""
    log_success "Sent successful requests"
    
    log_info "Step 6: Waiting for error rate to drop and alert to resolve..."
    sleep 60
    
    if check_alert_resolved "HighServerErrorRate" 120; then
        log_success "✓ Alert resolution test PASSED"
    else
        log_warning "Alert may take longer to resolve (5m evaluation window)"
    fi
    
    log_info "=========================================="
}

test_high_latency() {
    log_info "=========================================="
    log_info "TEST: HighLatencyP95 Alert"
    log_info "=========================================="
    
    log_warning "This test requires application code modification to add artificial delay"
    log_info "Simulating by generating slow requests..."
    
    # In a real scenario, you'd temporarily modify the service to add delay
    # For now, we just document the test
    
    log_info "To test this manually:"
    log_info "1. Add artificial delay to an endpoint (e.g., setTimeout in controller)"
    log_info "2. Send requests to that endpoint"
    log_info "3. Wait for alert to fire"
    log_info "4. Remove delay and verify resolution"
    
    log_info "=========================================="
}

test_high_cpu() {
    log_info "=========================================="
    log_info "TEST: HighCPUUsage Alert"
    log_info "=========================================="
    
    log_warning "This test requires CPU stress testing"
    log_info "To test manually, use stress tool:"
    log_info "  docker run --rm --name cpu-stress -d alpine/stress --cpu 4 --timeout 300s"
    
    log_info "=========================================="
}

test_high_memory() {
    log_info "=========================================="
    log_info "TEST: HighMemoryUsage Alert"
    log_info "=========================================="
    
    log_warning "This test requires memory stress testing"
    log_info "To test manually, use stress tool:"
    log_info "  docker run --rm --name mem-stress -d alpine/stress --vm 1 --vm-bytes 900M --timeout 300s"
    
    log_info "=========================================="
}

test_all_manual_verification() {
    log_info "=========================================="
    log_info "Manual Verification Tests"
    log_info "=========================================="
    
    log_info "1. Checking Prometheus alert rules are loaded..."
    local rules=$(curl -s "${PROMETHEUS_URL}/api/v1/rules" | jq -r '.data.groups[].rules[] | select(.type=="alerting") | .name' | wc -l)
    log_success "Found $rules alerting rules loaded in Prometheus"
    
    log_info "2. Listing all configured alerts:"
    curl -s "${PROMETHEUS_URL}/api/v1/rules" | jq -r '.data.groups[].rules[] | select(.type=="alerting") | "  - \(.name) (severity: \(.labels.severity // "none"))"'
    
    log_info "3. Checking currently firing alerts..."
    local firing=$(curl -s "${PROMETHEUS_URL}/api/v1/alerts" | jq -r '.data.alerts[] | select(.state=="firing") | .labels.alertname')
    if [ -z "$firing" ]; then
        log_success "No alerts currently firing (system healthy)"
    else
        log_warning "Currently firing alerts:"
        echo "$firing" | while read -r alert; do
            log_warning "  - $alert"
        done
    fi
    
    log_info "4. Checking AlertManager status..."
    local am_status=$(curl -s "${ALERTMANAGER_URL}/api/v2/status" | jq -r '.cluster.status')
    log_success "AlertManager status: $am_status"
    
    log_info "5. Checking AlertManager alerts..."
    local am_alerts=$(curl -s "${ALERTMANAGER_URL}/api/v2/alerts" | jq -r 'length')
    log_info "AlertManager has $am_alerts active alerts"
    
    log_info "=========================================="
}

# ============================================================================
# Main Script
# ============================================================================

main() {
    log_info "NEXO CRM - Alert Testing Script"
    log_info "================================"
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    check_service "${PROMETHEUS_URL}/-/healthy" "Prometheus" || exit 1
    check_service "${ALERTMANAGER_URL}/-/healthy" "AlertManager" || exit 1
    
    log_info "Prerequisites check passed ✓"
    echo ""
    
    # Determine which test to run
    local test_name="${1:-manual}"
    
    case "$test_name" in
        service-down)
            test_service_down
            ;;
        high-error-rate)
            test_high_error_rate
            ;;
        high-latency)
            test_high_latency
            ;;
        high-cpu)
            test_high_cpu
            ;;
        high-memory)
            test_high_memory
            ;;
        all)
            test_service_down
            echo ""
            test_high_error_rate
            echo ""
            test_high_latency
            echo ""
            test_high_cpu
            echo ""
            test_high_memory
            ;;
        manual|verify)
            test_all_manual_verification
            ;;
        *)
            log_error "Unknown test: $test_name"
            echo ""
            echo "Usage: $0 [test-name]"
            echo ""
            echo "Available tests:"
            echo "  service-down       Test ServiceDown alert"
            echo "  high-error-rate    Test HighServerErrorRate alert"
            echo "  high-latency       Test HighLatencyP95 alert"
            echo "  high-cpu           Test HighCPUUsage alert"
            echo "  high-memory        Test HighMemoryUsage alert"
            echo "  all                Run all tests"
            echo "  manual|verify      Manual verification (default)"
            exit 1
            ;;
    esac
    
    echo ""
    log_success "Test script completed"
}

# Run main function
main "$@"
