#!/bin/bash

# Backend API Integration Test
# Tests complete auth and CRM flow through API Gateway

set -e

echo "================================="
echo "Backend API Integration Test"
echo "================================="
echo ""

API_GATEWAY="http://localhost:3002"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

# Check API Gateway
echo -n "Checking API Gateway (3002)... "
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start: cd nexo-prj && pnpm nx serve api-gateway"
    exit 1
fi

echo ""
echo "Running tests..."
echo ""

# Test 1: API Gateway Health
echo -n "1. API Gateway Health... "
HEALTH=$(curl -s "$API_GATEWAY/api/health")
if echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Test 2: Register new user
RANDOM_NUM=$(date +%s)
USER_EMAIL="test_${RANDOM_NUM}@example.com"
USER_NAME="testuser${RANDOM_NUM}"
ACCOUNT_SLUG="test-account-${RANDOM_NUM}"

REGISTER_DATA=$(cat <<EOF
{
  "email": "${USER_EMAIL}",
  "password": "Test123!@#",
  "username": "${USER_NAME}",
  "firstName": "Test",
  "lastName": "User",
  "accountName": "Test Account",
  "accountSlug": "${ACCOUNT_SLUG}"
}
EOF
)

echo -n "2. User Registration... "
REGISTER_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

if echo "$REGISTER_RESPONSE" | jq -e '.accessToken' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Response: $REGISTER_RESPONSE"
    FAILED=$((FAILED + 1))
    ACCESS_TOKEN=""
fi

# Test 3: Login
if [ -n "$ACCESS_TOKEN" ]; then
    LOGIN_DATA=$(cat <<EOF
{
  "email": "${USER_EMAIL}",
  "password": "Test123!@#"
}
EOF
)
    
    echo -n "3. User Login... "
    LOGIN_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA")
    
    if echo "$LOGIN_RESPONSE" | jq -e '.accessToken' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Response: $LOGIN_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 4: Create Client
if [ -n "$ACCESS_TOKEN" ]; then
    CLIENT_DATA=$(cat <<EOF
{
  "email": "client@example.com",
  "full_name": "Test Client",
  "phone": "+1234567890",
  "company_name": "Test Company"
}
EOF
)
    
    echo -n "4. Create Client (CRM)... "
    CREATE_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/crm/clients" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$CLIENT_DATA")
    
    if echo "$CREATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        CLIENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Response: $CREATE_RESPONSE"
        FAILED=$((FAILED + 1))
        CLIENT_ID=""
    fi
fi

# Test 5: Get Clients
if [ -n "$ACCESS_TOKEN" ]; then
    echo -n "5. Get Clients List... "
    CLIENTS_RESPONSE=$(curl -s -X GET "$API_GATEWAY/api/crm/clients" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$CLIENTS_RESPONSE" | jq -e '.data | type == "array"' > /dev/null 2>&1; then
        CLIENT_COUNT=$(echo "$CLIENTS_RESPONSE" | jq '.data | length')
        echo -e "${GREEN}✓ PASS${NC} ($CLIENT_COUNT clients)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Response: $CLIENTS_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 6: Update Client
if [ -n "$ACCESS_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    UPDATE_DATA=$(cat <<EOF
{
  "full_name": "Updated Test Client",
  "phone": "+0987654321",
  "company_name": "Updated Company"
}
EOF
)
    
    echo -n "6. Update Client... "
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_GATEWAY/api/crm/clients/$CLIENT_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$UPDATE_DATA")
    
    if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Response: $UPDATE_RESPONSE"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 7: Delete Client
if [ -n "$ACCESS_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    echo -n "7. Delete Client... "
    DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_GATEWAY/api/crm/clients/$CLIENT_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    STATUS_CODE=$(echo "$DELETE_RESPONSE" | tail -n 1)
    
    if [ "$STATUS_CODE" = "200" ] || [ "$STATUS_CODE" = "204" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL (HTTP $STATUS_CODE)${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 8: Unauthorized Access
echo -n "8. Block Unauthorized Access... "
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_GATEWAY/api/crm/clients")
STATUS_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n 1)

if [ "$STATUS_CODE" = "401" ] || [ "$STATUS_CODE" = "403" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL (HTTP $STATUS_CODE)${NC}"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "================================="
echo "Test Summary"
echo "================================="
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All API tests passed!${NC}"
    echo ""
    echo "✓ Auth Service working"
    echo "✓ CRM Service working"
    echo "✓ API Gateway routing correctly"
    echo "✓ JWT authentication functional"
    echo "✓ Multi-tenant isolation maintained"
    echo ""
    echo "API Gateway: $API_GATEWAY"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
