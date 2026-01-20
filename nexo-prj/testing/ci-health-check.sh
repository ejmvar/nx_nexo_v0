#!/bin/bash

# NEXO ERP Backend - CI/CD Health Check Script
# This script is designed to be used in CI/CD pipelines to verify service health

set -e

echo "🔄 NEXO ERP Backend - CI/CD Health Checks"
echo "========================================="

# Configuration
API_GATEWAY_URL="${API_GATEWAY_URL:-http://localhost:3001}"
AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3000}"
TIMEOUT="${TIMEOUT:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local method=${2:-GET}
    local expected_status=${3:-200}
    local description=$4
    local data=$5

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "Testing $description... "

    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
            -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" \
            --max-time "$TIMEOUT" 2>/dev/null || echo "HTTPSTATUS:000;TIME:0")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
            -X "$method" "$url" \
            --max-time "$TIMEOUT" 2>/dev/null || echo "HTTPSTATUS:000;TIME:0")
    fi

    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://' -e 's/;TIME.*//')
    response_time=$(echo "$response" | tr -d '\n' | sed -e 's/.*TIME://')

    if [ "$http_status" = "$expected_status" ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}✅ PASS${NC} (${http_status}, ${response_time}s)"
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}❌ FAIL${NC} (expected ${expected_status}, got ${http_status}, ${response_time}s)"
        return 1
    fi
}

# Function to check auth flow
check_auth_flow() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "Testing Auth Flow... "

    # Login
    login_response=$(curl -s -X POST "$API_GATEWAY_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password"}' \
        --max-time "$TIMEOUT" 2>/dev/null)

    if ! echo "$login_response" | grep -q "access_token"; then
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}❌ FAIL${NC} (login failed)"
        return 1
    fi

    # Extract token
    token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$token" ]; then
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}❌ FAIL${NC} (no token)"
        return 1
    fi

    # Test profile
    profile_response=$(curl -s -X POST "$API_GATEWAY_URL/api/v1/auth/profile" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d '{}' \
        --max-time "$TIMEOUT" 2>/dev/null)

    if echo "$profile_response" | grep -q '"userId":1'; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}✅ PASS${NC} (login + profile)"
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}❌ FAIL${NC} (profile failed)"
        return 1
    fi
}

echo "Configuration:"
echo "  API Gateway: $API_GATEWAY_URL"
echo "  Auth Service: $AUTH_SERVICE_URL"
echo "  Timeout: ${TIMEOUT}s"
echo

# Basic health checks
check_endpoint "$API_GATEWAY_URL/health" "GET" "200" "API Gateway Health"
check_endpoint "$AUTH_SERVICE_URL/health" "GET" "200" "Auth Service Health"

# Auth flow test
check_auth_flow

# Service endpoint checks (these may fail if services aren't implemented yet)
echo
echo "Checking planned service endpoints (may fail if not implemented):"

# These will likely fail until services are created
check_endpoint "$API_GATEWAY_URL/api/v1/crm/health" "GET" "200" "CRM Health" || true
check_endpoint "$API_GATEWAY_URL/api/v1/stock/health" "GET" "200" "Stock Health" || true
check_endpoint "$API_GATEWAY_URL/api/v1/sales/health" "GET" "200" "Sales Health" || true
check_endpoint "$API_GATEWAY_URL/api/v1/purchases/health" "GET" "200" "Purchases Health" || true
check_endpoint "$API_GATEWAY_URL/api/v1/production/health" "GET" "200" "Production Health" || true
check_endpoint "$API_GATEWAY_URL/api/v1/notifications/health" "GET" "200" "Notifications Health" || true

# Summary
echo
echo "📊 CI/CD Health Check Summary:"
echo "  Total Checks: $TOTAL_CHECKS"
echo "  Passed: $PASSED_CHECKS"
echo "  Failed: $FAILED_CHECKS"
echo "  Success Rate: $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%"

# Exit with appropriate code for CI/CD
if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All health checks passed!${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some health checks failed!${NC}"
    exit 1
fi