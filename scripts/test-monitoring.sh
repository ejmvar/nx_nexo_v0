#!/usr/bin/env bash

# ============================================================================
# NEXO CRM - Monitoring Stack Validation Test Script
# ============================================================================
# Tests Prometheus, Grafana, OpenTelemetry, and Jaeger configuration
# Usage: bash scripts/test-monitoring.sh
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

# Service URLs
PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3002"
JAEGER_URL="http://localhost:16686"
OTEL_HEALTH_URL="http://localhost:13133"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}NEXO CRM - Monitoring Stack Tests${NC}"
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
    
    if eval "$test_command" > /tmp/monitoring-test-$TESTS_RUN.log 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo -e "${RED}Error output:${NC}"
        cat /tmp/monitoring-test-$TESTS_RUN.log
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

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}✗ curl is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ curl is installed${NC}"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

echo ""

# ============================================================================
# Configuration File Tests
# ============================================================================

echo -e "${BLUE}Configuration File Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Prometheus config exists" "test -f docker/prometheus.yml"
run_test "Prometheus alerts exist" "test -f monitoring/prometheus/alerts.yml"
run_test "OpenTelemetry config exists" "test -f monitoring/otel/otel-collector-config.yaml"
run_test "Grafana dashboards directory exists" "test -d monitoring/grafana/dashboards"
run_test "System Overview dashboard exists" "test -f monitoring/grafana/dashboards/nexo-overview.json"
run_test "Backend API dashboard exists" "test -f monitoring/grafana/dashboards/nexo-backend.json"
run_test "Database dashboard exists" "test -f monitoring/grafana/dashboards/nexo-database.json"

echo ""

# ============================================================================
# Prometheus Configuration Tests
# ============================================================================

echo -e "${BLUE}Prometheus Configuration Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Prometheus config has global section" "grep -q 'global:' docker/prometheus.yml"
run_test "Prometheus config has scrape_configs" "grep -q 'scrape_configs:' docker/prometheus.yml"
run_test "Prometheus config has rule_files" "grep -q 'rule_files:' docker/prometheus.yml"
run_test "Prometheus has backend scrape job" "grep -q 'job_name:.*backend' docker/prometheus.yml"
run_test "Prometheus has postgres scrape job" "grep -q 'job_name:.*postgres' docker/prometheus.yml"
run_test "Prometheus has redis scrape job" "grep -q 'job_name:.*redis' docker/prometheus.yml"

echo ""

# ============================================================================
# Alert Rules Tests
# ============================================================================

echo -e "${BLUE}Alert Rules Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Alert rules file has groups" "grep -q 'groups:' monitoring/prometheus/alerts.yml"
run_test "Critical alerts group exists" "grep -q 'name: critical_alerts' monitoring/prometheus/alerts.yml"
run_test "Performance alerts group exists" "grep -q 'name: performance_alerts' monitoring/prometheus/alerts.yml"
run_test "Database alerts group exists" "grep -q 'name: database_alerts' monitoring/prometheus/alerts.yml"
run_test "ServiceDown alert exists" "grep -q 'alert: ServiceDown' monitoring/prometheus/alerts.yml"
run_test "HighErrorRate alert exists" "grep -q 'alert: HighErrorRate' monitoring/prometheus/alerts.yml"
run_test "DatabaseConnectionPoolExhausted alert exists" "grep -q 'alert: DatabaseConnectionPoolExhausted' monitoring/prometheus/alerts.yml"

echo ""

# ============================================================================
# OpenTelemetry Configuration Tests
# ============================================================================

echo -e "${BLUE}OpenTelemetry Configuration Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "OTEL config has receivers" "grep -q 'receivers:' monitoring/otel/otel-collector-config.yaml"
run_test "OTEL config has processors" "grep -q 'processors:' monitoring/otel/otel-collector-config.yaml"
run_test "OTEL config has exporters" "grep -q 'exporters:' monitoring/otel/otel-collector-config.yaml"
run_test "OTEL config has service pipelines" "grep -q 'service:' monitoring/otel/otel-collector-config.yaml"
run_test "OTEL has OTLP receiver" "grep -q 'otlp:' monitoring/otel/otel-collector-config.yaml"
run_test "OTEL has Prometheus exporter" "grep -q 'prometheus:' monitoring/otel/otel-collector-config.yaml"
run_test "OTEL has Jaeger exporter" "grep -q 'jaeger:' monitoring/otel/otel-collector-config.yaml"

echo ""

# ============================================================================
# Grafana Dashboard Tests
# ============================================================================

echo -e "${BLUE}Grafana Dashboard Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Overview dashboard is valid JSON" "python3 -m json.tool monitoring/grafana/dashboards/nexo-overview.json > /dev/null"
run_test "Backend dashboard is valid JSON" "python3 -m json.tool monitoring/grafana/dashboards/nexo-backend.json > /dev/null"
run_test "Database dashboard is valid JSON" "python3 -m json.tool monitoring/grafana/dashboards/nexo-database.json > /dev/null"
run_test "Overview dashboard has panels" "grep -q 'panels' monitoring/grafana/dashboards/nexo-overview.json"
run_test "Backend dashboard has panels" "grep -q 'panels' monitoring/grafana/dashboards/nexo-backend.json"
run_test "Database dashboard has panels" "grep -q 'panels' monitoring/grafana/dashboards/nexo-database.json"

echo ""

# ============================================================================
# Docker Compose Configuration Tests
# ============================================================================

echo -e "${BLUE}Docker Compose Configuration Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "docker-compose has prometheus service" "grep -q 'prometheus:' docker/docker-compose.yml"
run_test "docker-compose has grafana service" "grep -q 'grafana:' docker/docker-compose.yml"
run_test "docker-compose has otel-collector service" "grep -q 'otel-collector:' docker/docker-compose.yml"
run_test "docker-compose has jaeger service" "grep -q 'jaeger:' docker/docker-compose.yml"
run_test "Prometheus has alert rules volume" "grep -A10 'prometheus:' docker/docker-compose.yml | grep -q 'monitoring/prometheus/alerts.yml'"
run_test "Grafana has dashboards volume" "grep -A20 'grafana:' docker/docker-compose.yml | grep -q 'monitoring/grafana/dashboards'"
run_test "OTEL has config volume" "grep -A10 'otel-collector:' docker/docker-compose.yml | grep -q 'monitoring/otel/otel-collector-config.yaml'"

echo ""

# ============================================================================
# Service Health Tests (if services are running)
# ============================================================================

echo -e "${BLUE}Service Health Tests (Optional)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if services are running
if docker compose -f docker/docker-compose.yml ps | grep -q prometheus; then
    echo -e "${BLUE}Services are running, testing endpoints...${NC}"
    
    # Prometheus health
    if curl -sf "$PROMETHEUS_URL/-/healthy" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Prometheus is healthy${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Prometheus health check failed (service may not be ready)${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Grafana health
    if curl -sf "$GRAFANA_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Grafana is healthy${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Grafana health check failed (service may not be ready)${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # OTEL Collector health
    if curl -sf "$OTEL_HEALTH_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OpenTelemetry Collector is healthy${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ OTEL health check failed (service may not be ready)${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Jaeger health
    if curl -sf "$JAEGER_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Jaeger is healthy${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Jaeger health check failed (service may not be ready)${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Check Prometheus targets
    if curl -sf "$PROMETHEUS_URL/api/v1/targets" | grep -q '"health":"up"'; then
        echo -e "${GREEN}✓ Prometheus has healthy targets${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Some Prometheus targets may be down${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Check Prometheus alerts are loaded
    if curl -sf "$PROMETHEUS_URL/api/v1/rules" | grep -q 'groups'; then
        echo -e "${GREEN}✓ Prometheus alert rules are loaded${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Prometheus alert rules may not be loaded${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Check Grafana datasources
    if curl -sf -u admin:admin "$GRAFANA_URL/api/datasources" | grep -q 'Prometheus'; then
        echo -e "${GREEN}✓ Grafana has Prometheus datasource${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Grafana Prometheus datasource not found${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Check Grafana dashboards
    if curl -sf -u admin:admin "$GRAFANA_URL/api/search?type=dash-db" | grep -q 'NEXO'; then
        echo -e "${GREEN}✓ Grafana has NEXO dashboards${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠ NEXO dashboards not found in Grafana${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
else
    echo -e "${YELLOW}⚠ Services not running. Start with: docker compose -f docker/docker-compose.yml up -d${NC}"
    echo -e "${YELLOW}  Skipping live service tests...${NC}"
fi

echo ""

# ============================================================================
# Documentation Tests
# ============================================================================

echo -e "${BLUE}Documentation Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Advanced monitoring documentation exists" "test -f docs/ADVANCED_MONITORING.md"
run_test "Documentation has Architecture section" "grep -q '## Architecture' docs/ADVANCED_MONITORING.md"
run_test "Documentation has Dashboards section" "grep -q '## Dashboards' docs/ADVANCED_MONITORING.md"
run_test "Documentation has Alerts section" "grep -q '## Alerts' docs/ADVANCED_MONITORING.md"
run_test "Documentation has APM section" "grep -q '## APM' docs/ADVANCED_MONITORING.md"
run_test "Documentation has Troubleshooting section" "grep -q '## Troubleshooting' docs/ADVANCED_MONITORING.md"

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
rm -f /tmp/monitoring-test-*.log

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All monitoring validation tests passed!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Start services: docker compose -f docker/docker-compose.yml up -d"
    echo "  2. Open Grafana: http://localhost:3002 (admin/admin)"
    echo "  3. Open Prometheus: http://localhost:9090"
    echo "  4. Open Jaeger: http://localhost:16686"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
