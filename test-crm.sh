#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3003/api"
PASSED=0
FAILED=0

echo -e "${BLUE}=== CRM Service Testing ===${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Test 2: Get Clients (empty list)
echo -e "${BLUE}Test 2: Get Clients${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/clients")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get clients passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Get clients failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Test 3: Create Client (need to create user first)
echo -e "${BLUE}Test 3: Create Client (with user)${NC}"
TIMESTAMP=$(date +%s%N | cut -b1-13)
CLIENT_DATA=$(cat <<EOF
{
  "full_name": "John Doe",
  "email": "john.doe.$TIMESTAMP@example.com",
  "password": "SecurePass123",
  "company_name": "Doe Industries",
  "tax_id": "12345678A",
  "industry": "Technology",
  "rating": 5
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/clients" \
  -H "Content-Type: application/json" \
  -d "$CLIENT_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Create client passed${NC}"
    echo "$BODY" | jq .
    CLIENT_ID=$(echo "$BODY" | jq -r '.id')
    ((PASSED++))
else
    echo -e "${RED}✗ Create client failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
    CLIENT_ID=""
fi
echo ""

# Test 4: Get Client by ID
if [ -n "$CLIENT_ID" ]; then
    echo -e "${BLUE}Test 4: Get Client by ID${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/clients/$CLIENT_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Get client by ID passed${NC}"
        echo "$BODY" | jq .
        ((PASSED++))
    else
        echo -e "${RED}✗ Get client by ID failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
        ((FAILED++))
    fi
    echo ""
fi

# Test 5: Get Employees
echo -e "${BLUE}Test 5: Get Employees${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/employees")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get employees passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Get employees failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Test 6: Create Employee
echo -e "${BLUE}Test 6: Create Employee${NC}"
TIMESTAMP=$(date +%s%N | cut -b1-13)
EMPLOYEE_DATA=$(cat <<EOF
{
  "full_name": "Jane Smith",
  "email": "jane.smith.$TIMESTAMP@nexo.com",
  "password": "SecurePass123",
  "position": "Senior Developer",
  "department": "Engineering",
  "hourly_rate": 75.50
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d "$EMPLOYEE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Create employee passed${NC}"
    echo "$BODY" | jq .
    EMPLOYEE_ID=$(echo "$BODY" | jq -r '.id')
    ((PASSED++))
else
    echo -e "${RED}✗ Create employee failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
    EMPLOYEE_ID=""
fi
echo ""

# Test 7: Get Projects
echo -e "${BLUE}Test 7: Get Projects${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/projects")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get projects passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Get projects failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Test 8: Create Project (if we have a client)
if [ -n "$CLIENT_ID" ]; then
    echo -e "${BLUE}Test 8: Create Project${NC}"
    PROJECT_DATA='{
      "name": "Website Redesign",
      "description": "Complete website overhaul",
      "client_id": "'$CLIENT_ID'",
      "start_date": "2026-02-01",
      "deadline": "2026-05-01",
      "budget": 50000.00,
      "status": "planning"
    }'
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/projects" \
      -H "Content-Type: application/json" \
      -d "$PROJECT_DATA")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓ Create project passed${NC}"
        echo "$BODY" | jq .
        PROJECT_ID=$(echo "$BODY" | jq -r '.id')
        ((PASSED++))
    else
        echo -e "${RED}✗ Create project failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
        ((FAILED++))
        PROJECT_ID=""
    fi
    echo ""
fi

# Test 9: Get Tasks
echo -e "${BLUE}Test 9: Get Tasks${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get tasks passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Get tasks failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Test 10: Update Client (if exists)
if [ -n "$CLIENT_ID" ]; then
    echo -e "${BLUE}Test 10: Update Client${NC}"
    UPDATE_DATA='{
      "company_name": "Doe Industries Inc.",
      "credit_limit": 100000
    }'
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/clients/$CLIENT_ID" \
      -H "Content-Type: application/json" \
      -d "$UPDATE_DATA")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Update client passed${NC}"
        echo "$BODY" | jq .
        ((PASSED++))
    else
        echo -e "${RED}✗ Update client failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
        ((FAILED++))
    fi
    echo ""
fi

# Test 11: Get Suppliers
echo -e "${BLUE}Test 11: Get Suppliers${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/suppliers")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get suppliers passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Get suppliers failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Test 12: Get Professionals
echo -e "${BLUE}Test 12: Get Professionals${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/professionals")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get professionals passed${NC}"
    echo "$BODY" | jq .
    ((PASSED++))
else
    echo -e "${RED}✗ Get professionals failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    ((FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed${NC}"
    exit 1
fi
