#!/bin/bash

# Frontend Integration Test Script
# Tests the complete flow through API Gateway to backend services

set -e

echo "================================="
echo "  Frontend Integration Test"
echo "================================="
echo ""

API_GATEWAY="http://localhost:3002"
FRONTEND="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $status_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check services are running
echo "Checking services..."
echo ""

# Check API Gateway
echo -n "API Gateway (3002)... "
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start API Gateway: cd nexo-prj && pnpm nx serve api-gateway"
    exit 1
fi

# Check Frontend
echo -n "Frontend (3000)... "
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start Frontend: cd nexo-prj && pnpm nx serve nexo-prj"
    exit 1
fi

echo ""
echo "Running API tests..."
echo ""

# Test 1: API Gateway Health
test_endpoint "API Gateway Health" "GET" "$API_GATEWAY/api/health" "" "200"

# Test 2: Register new user (use random email to avoid conflicts)
RANDOM_EMAIL="test_$(date +%s)@example.com"
REGISTER_DATA='{
  "email": "'$RANDOM_EMAIL'",
  "password": "Test123!@#",
  "username": "testuser'$(date +%s)'",
  "full_name": "Test User"
}'

echo "Registering new user: $RANDOM_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

if echo "$REGISTER_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Registration FAILED${NC}"
    echo "Response: $REGISTER_RESPONSE"
    FAILED=$((FAILED + 1))
    ACCESS_TOKEN=""
fi

# Test 3: Login with new user
if [ -n "$ACCESS_TOKEN" ]; then
    echo ""
    LOGIN_DATA='{
      "email": "'$RANDOM_EMAIL'",
      "password": "Test123!@#"
    }'
    
    echo "Testing login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA")
    
    if echo "$LOGIN_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Login successful${NC}"
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Login FAILED${NC}"
        echo "Response: $LOGIN_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 4: Create a client (CRM through Gateway)
if [ -n "$ACCESS_TOKEN" ]; then
    echo ""
    CLIENT_DATA='{
      "name": "Test Client",
      "email": "client@example.com",
      "phone": "+1234567890",
      "company": "Test Company",
      "status": "active"
    }'
    
    echo "Creating client through API Gateway..."
    CREATE_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/crm/clients" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$CLIENT_DATA")
    
    if echo "$CREATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Client creation successful${NC}"
        CLIENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Client creation FAILED${NC}"
        echo "Response: $CREATE_RESPONSE"
        FAILED=$((FAILED + 1))
        CLIENT_ID=""
    fi
fi

# Test 5: Get clients list
if [ -n "$ACCESS_TOKEN" ]; then
    echo ""
    echo "Fetching clients list..."
    CLIENTS_RESPONSE=$(curl -s -X GET "$API_GATEWAY/api/crm/clients" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$CLIENTS_RESPONSE" | jq -e 'type == "array"' > /dev/null 2>&1; then
        CLIENT_COUNT=$(echo "$CLIENTS_RESPONSE" | jq 'length')
        echo -e "${GREEN}✓ Clients list retrieved ($CLIENT_COUNT clients)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Clients list retrieval FAILED${NC}"
        echo "Response: $CLIENTS_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 6: Update client
if [ -n "$ACCESS_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    echo ""
    UPDATE_DATA='{
      "name": "Updated Test Client",
      "email": "updated@example.com",
      "phone": "+1234567890",
      "company": "Updated Company",
      "status": "active"
    }'
    
    echo "Updating client..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_GATEWAY/api/crm/clients/$CLIENT_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$UPDATE_DATA")
    
    if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Client update successful${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Client update FAILED${NC}"
        echo "Response: $UPDATE_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 7: Delete client
if [ -n "$ACCESS_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    echo ""
    echo "Deleting client..."
    DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_GATEWAY/api/crm/clients/$CLIENT_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    STATUS_CODE=$(echo "$DELETE_RESPONSE" | tail -n 1)
    
    if [ "$STATUS_CODE" = "200" ] || [ "$STATUS_CODE" = "204" ]; then
        echo -e "${GREEN}✓ Client deletion successful${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Client deletion FAILED (HTTP $STATUS_CODE)${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 8: Verify unauthorized access is blocked
echo ""
echo "Testing unauthorized access protection..."
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_GATEWAY/api/crm/clients")
STATUS_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n 1)

if [ "$STATUS_CODE" = "401" ] || [ "$STATUS_CODE" = "403" ]; then
    echo -e "${GREEN}✓ Unauthorized access properly blocked${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Unauthorized access NOT blocked (HTTP $STATUS_CODE)${NC}"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "================================="
echo "  Test Summary"
echo "================================="
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Frontend is ready at: $FRONTEND"
    echo "API Gateway is ready at: $API_GATEWAY"
    echo ""
    echo "You can now:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Register a new account"
    echo "  3. Login and access the dashboard"
    echo "  4. Manage clients through the UI"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
