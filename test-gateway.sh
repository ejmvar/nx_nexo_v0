#!/bin/bash
# Test API Gateway Routing
# ========================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_GATEWAY="http://localhost:3002"
AUTH_SERVICE="http://localhost:3001"

echo -e "${BLUE}🧪 Testing API Gateway Routing${NC}"
echo "================================"
echo ""

# Test 1: Gateway Health
echo -e "${YELLOW}Test 1: Gateway Health${NC}"
RESPONSE=$(curl -s "${API_GATEWAY}/api/health")
if echo "$RESPONSE" | jq -e '.service == "api-gateway"' > /dev/null; then
    echo -e "${GREEN}✅ Gateway health check passed${NC}"
else
    echo -e "${RED}❌ Gateway health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Auth Service Health via Gateway
echo -e "${YELLOW}Test 2: Auth Service Health (via Gateway)${NC}"
RESPONSE=$(curl -s "${API_GATEWAY}/api/auth/health")
if echo "$RESPONSE" | jq -e '.service == "auth-service"' > /dev/null; then
    echo -e "${GREEN}✅ Auth service proxying works${NC}"
else
    echo -e "${RED}❌ Auth service proxying failed${NC}"
    exit 1
fi
echo ""

# Test 3: Direct Auth Service (comparison)
echo -e "${YELLOW}Test 3: Direct Auth Service (comparison)${NC}"
RESPONSE=$(curl -s "${AUTH_SERVICE}/api/auth/health")
if echo "$RESPONSE" | jq -e '.service == "auth-service"' > /dev/null; then
    echo -e "${GREEN}✅ Direct auth service works${NC}"
else
    echo -e "${RED}❌ Direct auth service failed${NC}"
    exit 1
fi
echo ""

# Test 4: Register via Gateway
echo -e "${YELLOW}Test 4: Register User (via Gateway)${NC}"
TIMESTAMP=$(date +%s)
EMAIL="test-gateway-${TIMESTAMP}@example.com"
USERNAME="gateway${TIMESTAMP}"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"Password123\",
    \"username\": \"${USERNAME}\",
    \"full_name\": \"Gateway Test User\"
  }")

if echo "$RESPONSE" | jq -e '.user.email' > /dev/null; then
    echo -e "${GREEN}✅ User registration via gateway works${NC}"
    USER_EMAIL=$(echo "$RESPONSE" | jq -r '.user.email')
    echo "   Registered: $USER_EMAIL"
else
    echo -e "${RED}❌ User registration failed${NC}"
    echo "$RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 5: Login via Gateway
echo -e "${YELLOW}Test 5: Login (via Gateway)${NC}"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"Password123\"
  }")

if echo "$RESPONSE" | jq -e '.access_token' > /dev/null; then
    echo -e "${GREEN}✅ Login via gateway works${NC}"
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
    echo "   Access Token: ${ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "$RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 6: Get Profile via Gateway (authenticated)
echo -e "${YELLOW}Test 6: Get Profile (via Gateway, authenticated)${NC}"
RESPONSE=$(curl -s -X GET "${API_GATEWAY}/api/auth/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$RESPONSE" | jq -e '.email' > /dev/null; then
    echo -e "${GREEN}✅ Authenticated request via gateway works${NC}"
    PROFILE_EMAIL=$(echo "$RESPONSE" | jq -r '.email')
    echo "   Profile: $PROFILE_EMAIL"
else
    echo -e "${RED}❌ Profile fetch failed${NC}"
    echo "$RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 7: Refresh Token via Gateway
echo -e "${YELLOW}Test 7: Refresh Token (via Gateway)${NC}"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"${REFRESH_TOKEN}\"}")

if echo "$RESPONSE" | jq -e '.access_token' > /dev/null; then
    echo -e "${GREEN}✅ Token refresh via gateway works${NC}"
    NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    echo "   New Token: ${NEW_ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Token refresh failed${NC}"
    echo "$RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 8: Logout via Gateway
echo -e "${YELLOW}Test 8: Logout (via Gateway)${NC}"
HTTP_CODE=$(curl -s -w "%{http_code}" -o /tmp/logout_response.json -X POST "${API_GATEWAY}/api/auth/logout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Logout via gateway works${NC}"
else
    echo -e "${RED}❌ Logout failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/logout_response.json | jq . 2>/dev/null || cat /tmp/logout_response.json
    exit 1
fi
echo ""

echo "================================"
echo -e "${GREEN}✅ All API Gateway tests passed!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Gateway health check"
echo "  ✅ Auth service proxying"
echo "  ✅ User registration via gateway"
echo "  ✅ User login via gateway"
echo "  ✅ Authenticated requests via gateway"
echo "  ✅ Token refresh via gateway"
echo "  ✅ Logout via gateway"
echo ""
echo "🎉 API Gateway is routing correctly!"
