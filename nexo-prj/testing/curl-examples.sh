#!/bin/bash

# NEXO ERP Backend - Curl Testing Examples
# This script tests all available endpoints in the NEXO ERP backend

set -e

echo "🧪 NEXO ERP Backend - Manual Testing with curl"
echo "=============================================="

# Configuration
API_GATEWAY="http://localhost:3001"
AUTH_SERVICE="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make HTTP requests and show results
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4

    echo -e "\n${BLUE}Testing: ${description}${NC}"
    echo -e "${YELLOW}${method} ${url}${NC}"

    if [ -n "$data" ]; then
        echo -e "${YELLOW}Data: ${data}${NC}"
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$url" 2>/dev/null)
    fi

    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS:/d')

    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        echo -e "${GREEN}✅ Status: $http_status${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo -e "${GREEN}Response: $body${NC}"
        fi
    else
        echo -e "${RED}❌ Status: $http_status${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo -e "${RED}Error: $body${NC}"
        fi
    fi
}

# Function to extract JWT token from login response
extract_token() {
    local response=$1
    echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo ""
}

echo -e "\n${BLUE}🔍 Checking service availability...${NC}"

# Test API Gateway health
test_endpoint "GET" "$API_GATEWAY/health" "" "API Gateway Health Check"

# Test Auth Service health (direct)
test_endpoint "GET" "$AUTH_SERVICE/health" "" "Auth Service Health Check (Direct)"

echo -e "\n${BLUE}🔐 Testing Authentication Endpoints${NC}"

# Test login through API Gateway
echo -e "\n${BLUE}Testing Login through API Gateway${NC}"
login_response=$(curl -s -X POST "$API_GATEWAY/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password"}')

echo -e "${YELLOW}POST $API_GATEWAY/api/v1/auth/login${NC}"
echo -e "${YELLOW}Data: {\"username\":\"admin\",\"password\":\"password\"}${NC}"

if echo "$login_response" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo -e "${GREEN}Response: $login_response${NC}"

    # Extract token for subsequent requests
    TOKEN=$(extract_token "$login_response")
    echo -e "${GREEN}Token extracted: ${TOKEN:0:50}...${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    echo -e "${RED}Response: $login_response${NC}"
    TOKEN=""
fi

# Test login directly to auth service
test_endpoint "POST" "$AUTH_SERVICE/auth/login" '{"username":"admin","password":"password"}' "Auth Service Login (Direct)"

# Test profile endpoint if we have a token
if [ -n "$TOKEN" ]; then
    echo -e "\n${BLUE}Testing Profile Endpoint with JWT${NC}"
    test_endpoint "POST" "$API_GATEWAY/api/v1/auth/profile" '{}' "Auth Profile (with JWT)" "$TOKEN"
fi

echo -e "\n${BLUE}🏗️  Testing Planned Service Endpoints (will fail until services are implemented)${NC}"

# Test planned service endpoints (these will fail until services are created)
test_endpoint "GET" "$API_GATEWAY/api/v1/crm/health" "" "CRM Service Health (planned)"
test_endpoint "GET" "$API_GATEWAY/api/v1/stock/health" "" "Stock Service Health (planned)"
test_endpoint "GET" "$API_GATEWAY/api/v1/sales/health" "" "Sales Service Health (planned)"
test_endpoint "GET" "$API_GATEWAY/api/v1/purchases/health" "" "Purchases Service Health (planned)"
test_endpoint "GET" "$API_GATEWAY/api/v1/production/health" "" "Production Service Health (planned)"
test_endpoint "GET" "$API_GATEWAY/api/v1/notifications/health" "" "Notifications Service Health (planned)"

echo -e "\n${GREEN}🎉 Testing completed!${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo -e "- API Gateway: $API_GATEWAY"
echo -e "- Auth Service: $AUTH_SERVICE"
echo -e "- Current working endpoints: auth/login, auth/profile"
echo -e "- Planned services: crm, stock, sales, purchases, production, notifications"

if [ -n "$TOKEN" ]; then
    echo -e "\n${GREEN}💡 Pro tip: Use this JWT token for authenticated requests:${NC}"
    echo -e "${TOKEN}"
fi