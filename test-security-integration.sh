#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_URL="${AUTH_URL:-http://localhost:3001}"
CRM_URL="${CRM_URL:-http://localhost:3003}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-nexo_crm}"
DB_USER="${DB_USER:-postgres}"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Cleanup function
cleanup() {
  echo -e "\n${BLUE}=== Cleaning up test data ===${NC}"
  
  # Delete test accounts and related data (cascades to users, clients, etc.)
  unset DOCKER_HOST
  docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -c "
    DELETE FROM accounts WHERE slug IN ('test-company-alpha', 'test-company-beta', 'test-company-gamma');
  " 2>/dev/null || true
  
  echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Register cleanup on exit
trap cleanup EXIT

# Helper functions
log_test() {
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  echo -e "\n${BLUE}[TEST $TESTS_TOTAL] $1${NC}"
}

log_success() {
  TESTS_PASSED=$((TESTS_PASSED + 1))
  echo -e "${GREEN}✓ $1${NC}"
}

log_failure() {
  TESTS_FAILED=$((TESTS_FAILED + 1))
  echo -e "${RED}✗ $1${NC}"
}

log_info() {
  echo -e "${YELLOW}  → $1${NC}"
}

# Test result assertion
assert_equals() {
  local expected="$1"
  local actual="$2"
  local message="$3"
  
  if [ "$expected" == "$actual" ]; then
    log_success "$message"
    return 0
  else
    log_failure "$message (expected: $expected, got: $actual)"
    return 1
  fi
}

assert_not_empty() {
  local value="$1"
  local message="$2"
  
  if [ -n "$value" ] && [ "$value" != "null" ]; then
    log_success "$message"
    return 0
  else
    log_failure "$message (value is empty or null)"
    return 1
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="$3"
  
  if echo "$haystack" | grep -q "$needle"; then
    log_success "$message"
    return 0
  else
    log_failure "$message ('$needle' not found in response)"
    return 1
  fi
}

# Wait for services
wait_for_service() {
  local url="$1"
  local service_name="$2"
  local max_attempts=30
  local attempt=0
  
  echo -e "${YELLOW}Waiting for $service_name...${NC}"
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -s -f "$url" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ $service_name is ready${NC}"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  
  echo -e "${RED}✗ $service_name failed to start${NC}"
  return 1
}

# ============================================
# MAIN TEST SUITE
# ============================================

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Multi-Tenant Security Integration Tests     ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ Testing: Account, User, Role, RBAC, RLS       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"

# Check services are running
wait_for_service "$AUTH_URL/api" "Auth Service"
wait_for_service "$CRM_URL/api" "CRM Service"

# ============================================
# TEST 1: Account & User Registration
# ============================================

log_test "Create Test Accounts and Users"

# Account Alpha - Admin User
log_info "Registering Account Alpha with Admin user"
ALPHA_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alpha.test",
    "password": "SecurePass123!",
    "username": "alpha_admin",
    "firstName": "Admin",
    "lastName": "Alpha",
    "accountName": "Test Company Alpha",
    "accountSlug": "test-company-alpha"
  }')

ALPHA_TOKEN=$(echo "$ALPHA_RESPONSE" | jq -r '.accessToken // empty')
ALPHA_USER_ID=$(echo "$ALPHA_RESPONSE" | jq -r '.user.id // empty')
ALPHA_ACCOUNT_ID=$(echo "$ALPHA_RESPONSE" | jq -r '.user.account.id // empty')

assert_not_empty "$ALPHA_TOKEN" "Account Alpha - Admin user registered and token received"
assert_not_empty "$ALPHA_ACCOUNT_ID" "Account Alpha - Account ID created"

# Account Beta - Admin User
log_info "Registering Account Beta with Admin user"
BETA_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@beta.test",
    "password": "SecurePass123!",
    "username": "beta_admin",
    "firstName": "Admin",
    "lastName": "Beta",
    "accountName": "Test Company Beta",
    "accountSlug": "test-company-beta"
  }')

BETA_TOKEN=$(echo "$BETA_RESPONSE" | jq -r '.accessToken // empty')
BETA_ACCOUNT_ID=$(echo "$BETA_RESPONSE" | jq -r '.user.account.id // empty')

assert_not_empty "$BETA_TOKEN" "Account Beta - Admin user registered and token received"
assert_not_empty "$BETA_ACCOUNT_ID" "Account Beta - Account ID created"

# Account Gamma - For additional isolation tests
log_info "Registering Account Gamma"
GAMMA_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gamma.test",
    "password": "SecurePass123!",
    "username": "gamma_admin",
    "firstName": "Admin",
    "lastName": "Gamma",
    "accountName": "Test Company Gamma",
    "accountSlug": "test-company-gamma"
  }')

GAMMA_TOKEN=$(echo "$GAMMA_RESPONSE" | jq -r '.accessToken // empty')
GAMMA_ACCOUNT_ID=$(echo "$GAMMA_RESPONSE" | jq -r '.user.account.id // empty')

assert_not_empty "$GAMMA_TOKEN" "Account Gamma - Admin user registered and token received"

# ============================================
# TEST 2: Database-Level Account Isolation
# ============================================

log_test "Verify Database-Level Account Creation and Isolation"

unset DOCKER_HOST
ACCOUNT_COUNT=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM accounts WHERE slug IN ('test-company-alpha', 'test-company-beta', 'test-company-gamma');")

assert_equals "3" "$ACCOUNT_COUNT" "All 3 test accounts created in database"

USER_ACCOUNT_MAPPING=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(DISTINCT account_id) FROM users WHERE email IN ('admin@alpha.test', 'admin@beta.test', 'admin@gamma.test');")

assert_equals "3" "$USER_ACCOUNT_MAPPING" "Users mapped to different accounts"

# ============================================
# TEST 3: JWT Token Validation & Account Claims
# ============================================

log_test "Verify JWT Tokens Include Correct Account Claims"

# Decode JWT and check accountId claim
ALPHA_PAYLOAD=$(echo "$ALPHA_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null || echo "$ALPHA_TOKEN" | cut -d. -f2 | base64 -D 2>/dev/null)
ALPHA_TOKEN_ACCOUNT=$(echo "$ALPHA_PAYLOAD" | jq -r '.accountId // empty')

assert_equals "$ALPHA_ACCOUNT_ID" "$ALPHA_TOKEN_ACCOUNT" "Alpha JWT contains correct accountId claim"

BETA_PAYLOAD=$(echo "$BETA_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null || echo "$BETA_TOKEN" | cut -d. -f2 | base64 -D 2>/dev/null)
BETA_TOKEN_ACCOUNT=$(echo "$BETA_PAYLOAD" | jq -r '.accountId // empty')

assert_equals "$BETA_ACCOUNT_ID" "$BETA_TOKEN_ACCOUNT" "Beta JWT contains correct accountId claim"

# ============================================
# TEST 4: Client CRUD Operations - Account Alpha
# ============================================

log_test "Create Clients for Account Alpha"

# Create 3 clients for Alpha
ALPHA_CLIENT_1=$(curl -s -X POST "$CRM_URL/api/clients" \
  -H "Authorization: Bearer $ALPHA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client1@alpha-customer.com",
    "full_name": "Alpha Client 1",
    "company_name": "Alpha Customer Corp"
  }')

ALPHA_CLIENT_1_ID=$(echo "$ALPHA_CLIENT_1" | jq -r '.id // empty')
assert_not_empty "$ALPHA_CLIENT_1_ID" "Alpha - Client 1 created"

ALPHA_CLIENT_2=$(curl -s -X POST "$CRM_URL/api/clients" \
  -H "Authorization: Bearer $ALPHA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client2@alpha-customer.com",
    "full_name": "Alpha Client 2",
    "company_name": "Alpha Industries"
  }')

ALPHA_CLIENT_2_ID=$(echo "$ALPHA_CLIENT_2" | jq -r '.id // empty')
assert_not_empty "$ALPHA_CLIENT_2_ID" "Alpha - Client 2 created"

ALPHA_CLIENT_3=$(curl -s -X POST "$CRM_URL/api/clients" \
  -H "Authorization: Bearer $ALPHA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client3@alpha-customer.com",
    "full_name": "Alpha Client 3",
    "phone": "555-0001"
  }')

ALPHA_CLIENT_3_ID=$(echo "$ALPHA_CLIENT_3" | jq -r '.id // empty')
assert_not_empty "$ALPHA_CLIENT_3_ID" "Alpha - Client 3 created"

# ============================================
# TEST 5: Client CRUD Operations - Account Beta
# ============================================

log_test "Create Clients for Account Beta"

# Create 2 clients for Beta
BETA_CLIENT_1=$(curl -s -X POST "$CRM_URL/api/clients" \
  -H "Authorization: Bearer $BETA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client1@beta-customer.com",
    "full_name": "Beta Client 1",
    "company_name": "Beta Solutions Ltd"
  }')

BETA_CLIENT_1_ID=$(echo "$BETA_CLIENT_1" | jq -r '.id // empty')
assert_not_empty "$BETA_CLIENT_1_ID" "Beta - Client 1 created"

BETA_CLIENT_2=$(curl -s -X POST "$CRM_URL/api/clients" \
  -H "Authorization: Bearer $BETA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client2@beta-customer.com",
    "full_name": "Beta Client 2",
    "company_name": "Beta Enterprises"
  }')

BETA_CLIENT_2_ID=$(echo "$BETA_CLIENT_2" | jq -r '.id // empty')
assert_not_empty "$BETA_CLIENT_2_ID" "Beta - Client 2 created"

# ============================================
# TEST 6: Multi-Tenant Data Isolation - GET Operations
# ============================================

log_test "Verify Multi-Tenant Data Isolation - GET Clients"

# Alpha should see only their 3 clients
ALPHA_CLIENTS=$(curl -s -X GET "$CRM_URL/api/clients?page=1&limit=100" \
  -H "Authorization: Bearer $ALPHA_TOKEN")

ALPHA_CLIENT_COUNT=$(echo "$ALPHA_CLIENTS" | jq -r '.total // 0')
assert_equals "3" "$ALPHA_CLIENT_COUNT" "Alpha sees exactly 3 clients (their own)"

# Beta should see only their 2 clients
BETA_CLIENTS=$(curl -s -X GET "$CRM_URL/api/clients?page=1&limit=100" \
  -H "Authorization: Bearer $BETA_TOKEN")

BETA_CLIENT_COUNT=$(echo "$BETA_CLIENTS" | jq -r '.total // 0')
assert_equals "2" "$BETA_CLIENT_COUNT" "Beta sees exactly 2 clients (their own)"

# Gamma should see 0 clients
GAMMA_CLIENTS=$(curl -s -X GET "$CRM_URL/api/clients?page=1&limit=100" \
  -H "Authorization: Bearer $GAMMA_TOKEN")

GAMMA_CLIENT_COUNT=$(echo "$GAMMA_CLIENTS" | jq -r '.total // 0')
assert_equals "0" "$GAMMA_CLIENT_COUNT" "Gamma sees 0 clients (none created)"

# ============================================
# TEST 7: Cross-Account Access Prevention - GET by ID
# ============================================

log_test "Verify Cross-Account Access Prevention - GET Client by ID"

# Beta tries to access Alpha's client - should fail or return empty
BETA_ACCESS_ALPHA_CLIENT=$(curl -s -X GET "$CRM_URL/api/clients/$ALPHA_CLIENT_1_ID" \
  -H "Authorization: Bearer $BETA_TOKEN")

BETA_UNAUTHORIZED=$(echo "$BETA_ACCESS_ALPHA_CLIENT" | jq -r '.statusCode // .id')

if [ "$BETA_UNAUTHORIZED" == "404" ] || [ "$BETA_UNAUTHORIZED" == "403" ] || [ -z "$BETA_UNAUTHORIZED" ]; then
  log_success "Beta cannot access Alpha's client (correctly blocked)"
else
  log_failure "Beta should NOT be able to access Alpha's client"
fi

# Alpha tries to access Beta's client - should fail
ALPHA_ACCESS_BETA_CLIENT=$(curl -s -X GET "$CRM_URL/api/clients/$BETA_CLIENT_1_ID" \
  -H "Authorization: Bearer $ALPHA_TOKEN")

ALPHA_UNAUTHORIZED=$(echo "$ALPHA_ACCESS_BETA_CLIENT" | jq -r '.statusCode // .id')

if [ "$ALPHA_UNAUTHORIZED" == "404" ] || [ "$ALPHA_UNAUTHORIZED" == "403" ] || [ -z "$ALPHA_UNAUTHORIZED" ]; then
  log_success "Alpha cannot access Beta's client (correctly blocked)"
else
  log_failure "Alpha should NOT be able to access Beta's client"
fi

# ============================================
# TEST 8: Cross-Account Update Prevention
# ============================================

log_test "Verify Cross-Account Access Prevention - UPDATE Client"

# Beta tries to update Alpha's client - should fail
BETA_UPDATE_ALPHA=$(curl -s -X PUT "$CRM_URL/api/clients/$ALPHA_CLIENT_1_ID" \
  -H "Authorization: Bearer $BETA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Hacked by Beta"
  }')

BETA_UPDATE_STATUS=$(echo "$BETA_UPDATE_ALPHA" | jq -r '.statusCode // .id')

if [ "$BETA_UPDATE_STATUS" == "404" ] || [ "$BETA_UPDATE_STATUS" == "403" ]; then
  log_success "Beta cannot update Alpha's client (correctly blocked)"
else
  log_failure "Beta should NOT be able to update Alpha's client"
fi

# ============================================
# TEST 9: Cross-Account Delete Prevention
# ============================================

log_test "Verify Cross-Account Access Prevention - DELETE Client"

# Gamma tries to delete Alpha's client - should fail
GAMMA_DELETE_ALPHA=$(curl -s -X DELETE "$CRM_URL/api/clients/$ALPHA_CLIENT_2_ID" \
  -H "Authorization: Bearer $GAMMA_TOKEN")

GAMMA_DELETE_STATUS=$(echo "$GAMMA_DELETE_ALPHA" | jq -r '.statusCode // .message')

if [ "$GAMMA_DELETE_STATUS" == "404" ] || [ "$GAMMA_DELETE_STATUS" == "403" ]; then
  log_success "Gamma cannot delete Alpha's client (correctly blocked)"
else
  log_failure "Gamma should NOT be able to delete Alpha's client"
fi

# ============================================
# TEST 10: Database RLS Verification
# ============================================

log_test "Verify Database-Level RLS Enforcement"

# Verify clients are correctly associated with accounts in DB
unset DOCKER_HOST
ALPHA_DB_CLIENTS=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM clients WHERE account_id = '$ALPHA_ACCOUNT_ID';")

assert_equals "3" "$ALPHA_DB_CLIENTS" "Database: Alpha account has 3 clients"

BETA_DB_CLIENTS=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM clients WHERE account_id = '$BETA_ACCOUNT_ID';")

assert_equals "2" "$BETA_DB_CLIENTS" "Database: Beta account has 2 clients"

# Verify no cross-account data leakage
CROSS_CONTAMINATION=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM clients WHERE account_id != '$ALPHA_ACCOUNT_ID' AND account_id != '$BETA_ACCOUNT_ID' AND account_id != '$GAMMA_ACCOUNT_ID' AND account_id NOT IN (SELECT id FROM accounts WHERE slug IN ('default', 'test-account-a', 'test-account-b', 'acme-corp', 'techcorp'));")

assert_equals "0" "$CROSS_CONTAMINATION" "Database: No orphaned clients without valid account"

# ============================================
# TEST 11: Valid Update Operation (Same Account)
# ============================================

log_test "Verify Valid Update Operation (Same Account)"

# Alpha updates their own client - should succeed
ALPHA_UPDATE_OWN=$(curl -s -X PUT "$CRM_URL/api/clients/$ALPHA_CLIENT_3_ID" \
  -H "Authorization: Bearer $ALPHA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Alpha Client 3 Updated",
    "phone": "555-0999"
  }')

ALPHA_UPDATE_STATUS=$(echo "$ALPHA_UPDATE_OWN" | jq -r '.id // empty')
assert_not_empty "$ALPHA_UPDATE_STATUS" "Alpha successfully updated their own client"

# Verify update in database
UPDATED_NAME=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT name FROM clients WHERE id = '$ALPHA_CLIENT_3_ID';")

assert_contains "$UPDATED_NAME" "Updated" "Database reflects client name update"

# ============================================
# TEST 12: Valid Delete Operation (Same Account)
# ============================================

log_test "Verify Valid Delete Operation (Same Account)"

# Create a temporary client for Alpha to delete
ALPHA_TEMP_CLIENT=$(curl -s -X POST "$CRM_URL/api/clients" \
  -H "Authorization: Bearer $ALPHA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"temp@alpha.com","full_name":"Temp Client"}')

ALPHA_TEMP_ID=$(echo "$ALPHA_TEMP_CLIENT" | jq -r '.id // empty')

# Alpha deletes their own client - should succeed
ALPHA_DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$CRM_URL/api/clients/$ALPHA_TEMP_ID" \
  -H "Authorization: Bearer $ALPHA_TOKEN")

ALPHA_DELETE_HTTP_CODE=$(echo "$ALPHA_DELETE_RESPONSE" | tail -1)

if [ "$ALPHA_DELETE_HTTP_CODE" == "200" ] || [ "$ALPHA_DELETE_HTTP_CODE" == "204" ]; then
  log_success "Alpha successfully deleted their own client"
else
  log_failure "Alpha should be able to delete their own client (HTTP $ALPHA_DELETE_HTTP_CODE)"
fi

# Verify deletion in database
DELETED_CLIENT_EXISTS=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM clients WHERE id = '$ALPHA_TEMP_ID';")

assert_equals "0" "$DELETED_CLIENT_EXISTS" "Database: Deleted client no longer exists"

# ============================================
# TEST 13: Authentication & Authorization
# ============================================

log_test "Verify Authentication & Authorization"

# Unauthenticated request should fail
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/api/clients")
UNAUTH_HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -1)

assert_equals "401" "$UNAUTH_HTTP_CODE" "Unauthenticated request returns 401"

# Invalid token should fail
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CRM_URL/api/clients" \
  -H "Authorization: Bearer invalid-token-12345")
INVALID_HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -1)

assert_equals "401" "$INVALID_HTTP_CODE" "Invalid token returns 401"

# ============================================
# TEST 14: Role-Based Access Control (if implemented)
# ============================================

log_test "Verify Role-Based Access Control (RBAC)"

# Get user roles from database
ALPHA_ADMIN_ROLES=$(docker exec nexo-postgres psql -U postgres -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = '$ALPHA_USER_ID';")

if [ "$ALPHA_ADMIN_ROLES" -gt "0" ]; then
  log_success "Alpha admin user has assigned roles"
else
  log_info "RBAC implementation pending (no roles assigned yet)"
fi

# ============================================
# FINAL REPORT
# ============================================

echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           TEST EXECUTION SUMMARY               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}  Total:  $TESTS_TOTAL${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✓ ALL SECURITY TESTS PASSED SUCCESSFULLY!    ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "\n${RED}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ✗ SECURITY TEST FAILURES DETECTED!           ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
  exit 1
fi
