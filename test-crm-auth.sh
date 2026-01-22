#!/bin/bash

# ============================================================================
# CRM Service Authentication Test Script
# ============================================================================
# Tests CRM endpoints with JWT authentication
# Run from project root directory
# ============================================================================

set -e

API_URL="http://localhost:3002/api"
AUTH_URL="$API_URL/auth"
CRM_URL="$API_URL/crm"

echo "🔐 Testing CRM Service Authentication..."
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# ============================================================================
# STEP 1: Register and Login to get JWT token
# ============================================================================

echo "📝 Step 1: Creating test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "crm.test@example.com",
    "password": "Test123!@#",
    "username": "crmtester",
    "full_name": "CRM Tester"
  }' || echo '{"error": "registration failed"}')

echo "Registration response: $REGISTER_RESPONSE"
echo ""

echo "🔑 Step 2: Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "crm.test@example.com",
    "password": "Test123!@#"
  }' || echo '{"error": "login failed"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to obtain access token${NC}"
    echo "Login response was: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Got access token${NC}"
echo ""

# ============================================================================
# STEP 3: Test CRM endpoints WITHOUT authentication (should fail with 401)
# ============================================================================

echo "🚫 Step 3: Testing CRM endpoints WITHOUT authentication..."
echo "========================================="

# Test GET clients without auth
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/clients" || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "401" ] && echo 0 || echo 1) "GET /clients without auth returns 401 (got $HTTP_CODE)"

# Test POST client without auth
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CRM_URL/clients" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@test.com"}' || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "401" ] && echo 0 || echo 1) "POST /clients without auth returns 401 (got $HTTP_CODE)"

echo ""

# ============================================================================
# STEP 4: Test CRM endpoints WITH authentication (should succeed)
# ============================================================================

echo "✅ Step 4: Testing CRM endpoints WITH authentication..."
echo "========================================="

# Test GET clients with auth
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1) "GET /clients with auth returns 200 (got $HTTP_CODE)"

# Test POST client with auth
CLIENT_RESPONSE=$(curl -s -X POST "$CRM_URL/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auth Test Client",
    "email": "authtest@client.com",
    "phone": "+1234567890",
    "address": "123 Auth St"
  }')

CLIENT_ID=$(echo "$CLIENT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")
test_result $([ -n "$CLIENT_ID" ] && echo 0 || echo 1) "POST /clients with auth creates client"

if [ -n "$CLIENT_ID" ]; then
    echo "  Created client ID: $CLIENT_ID"
    
    # Test GET specific client
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/clients/$CLIENT_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_result $([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1) "GET /clients/:id with auth returns 200 (got $HTTP_CODE)"
    
    # Test PUT update client
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$CRM_URL/clients/$CLIENT_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Updated Auth Client"
      }' || echo -e "\n000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_result $([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1) "PUT /clients/:id with auth returns 200 (got $HTTP_CODE)"
    
    # Test DELETE client
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$CRM_URL/clients/$CLIENT_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_result $([ "$HTTP_CODE" = "204" ] && echo 0 || echo 1) "DELETE /clients/:id with auth returns 204 (got $HTTP_CODE)"
fi

echo ""

# Test other CRM entities with auth
echo "📋 Testing other CRM endpoints..."

# Test employees
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/employees" \
  -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1) "GET /employees with auth returns 200 (got $HTTP_CODE)"

# Test projects
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/projects" \
  -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1) "GET /projects with auth returns 200 (got $HTTP_CODE)"

# Test tasks
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/tasks" \
  -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1) "GET /tasks with auth returns 200 (got $HTTP_CODE)"

echo ""

# ============================================================================
# STEP 5: Test token expiration and logout
# ============================================================================

echo "🔒 Step 5: Testing logout and token revocation..."
echo "========================================="

# Logout
LOGOUT_RESPONSE=$(curl -s -X POST "$AUTH_URL/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Logout response: $LOGOUT_RESPONSE"

# Try to use token after logout (should fail)
sleep 1
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_result $([ "$HTTP_CODE" = "401" ] && echo 0 || echo 1) "GET /clients with revoked token returns 401 (got $HTTP_CODE)"

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "========================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
