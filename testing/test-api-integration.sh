#!/usr/bin/env bash
# ============================================================================
# NEXO CRM - API Integration Test Suite
# Purpose: Test all REST API endpoints with comprehensive scenarios
# Date: 2026-02-03
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
CRM_SERVICE_URL="${CRM_SERVICE_URL:-http://localhost:3002}"
TEST_RESULTS_DIR="./tmp/test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$TEST_RESULTS_DIR/api-test-results-$TIMESTAMP.json"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Create results directory
mkdir -p "$TEST_RESULTS_DIR"

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_test() {
  echo -e "${YELLOW}TEST:${NC} $1"
}

print_success() {
  echo -e "${GREEN}✅ PASS:${NC} $1"
  ((PASSED_TESTS++))
  ((TOTAL_TESTS++))
}

print_failure() {
  echo -e "${RED}❌ FAIL:${NC} $1"
  ((FAILED_TESTS++))
  ((TOTAL_TESTS++))
}

print_info() {
  echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

# Test if service is running
check_service() {
  local service_url=$1
  local service_name=$2
  
  print_test "Checking if $service_name is running at $service_url"
  
  if curl -f -s -o /dev/null "$service_url/health" 2>/dev/null; then
    print_success "$service_name is running"
    return 0
  else
    print_failure "$service_name is not responding"
    return 1
  fi
}

# Make API request and check response
api_request() {
  local method=$1
  local url=$2
  local data=$3
  local expected_status=$4
  local token=$5
  local description=$6
  
  print_test "$description"
  
  local headers=(-H "Content-Type: application/json")
  if [ -n "$token" ]; then
    headers+=(-H "Authorization: Bearer $token")
  fi
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" "${headers[@]}" -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" "${headers[@]}")
  fi
  
  # Extract body and status code
  body=$(echo "$response" | sed '$d')
  status=$(echo "$response" | tail -n1)
  
  if [ "$status" -eq "$expected_status" ]; then
    print_success "Status $status (expected $expected_status)"
    echo "$body"
    return 0
  else
    print_failure "Status $status (expected $expected_status)"
    echo "Response: $body"
    return 1
  fi
}

# ============================================================================
# Authentication Tests
# ============================================================================

test_authentication() {
  print_header "AUTHENTICATION TESTS"
  
  # Test 1: Login with Account 1 Admin
  local login_response
  login_response=$(api_request "POST" "$AUTH_SERVICE_URL/auth/login" \
    '{"email":"admin@techflow.test","password":"test123"}' \
    200 "" "Login as Account 1 Admin")
  
  if [ $? -eq 0 ]; then
    ACCOUNT1_TOKEN=$(echo "$login_response" | jq -r '.access_token // .token // empty')
    if [ -n "$ACCOUNT1_TOKEN" ] && [ "$ACCOUNT1_TOKEN" != "null" ]; then
      print_success "Account 1 token obtained"
      print_info "Token: ${ACCOUNT1_TOKEN:0:50}..."
    else
      print_failure "Failed to extract token from response"
      print_info "Response: $login_response"
    fi
  fi
  
  # Test 2: Login with Account 2 Admin
  login_response=$(api_request "POST" "$AUTH_SERVICE_URL/auth/login" \
    '{"email":"admin@creative.test","password":"test123"}' \
    200 "" "Login as Account 2 Admin")
  
  if [ $? -eq 0 ]; then
    ACCOUNT2_TOKEN=$(echo "$login_response" | jq -r '.access_token // .token // empty')
    if [ -n "$ACCOUNT2_TOKEN" ] && [ "$ACCOUNT2_TOKEN" != "null" ]; then
      print_success "Account 2 token obtained"
    else
      print_failure "Failed to extract Account 2 token"
    fi
  fi
  
  # Test 3: Login with invalid credentials
  api_request "POST" "$AUTH_SERVICE_URL/auth/login" \
    '{"email":"invalid@test.com","password":"wrong"}' \
    401 "" "Login with invalid credentials (should fail)" || true
  
  # Test 4: Get current user profile
  if [ -n "$ACCOUNT1_TOKEN" ]; then
    api_request "GET" "$AUTH_SERVICE_URL/auth/me" \
      "" 200 "$ACCOUNT1_TOKEN" "Get current user profile" >/dev/null
  fi
  
  echo ""
}

# ============================================================================
# Client Management Tests
# ============================================================================

test_clients() {
  print_header "CLIENT MANAGEMENT TESTS"
  
  if [ -z "$ACCOUNT1_TOKEN" ]; then
    print_failure "No authentication token available, skipping client tests"
    return 1
  fi
  
  # Test 1: List all clients
  local clients_response
  clients_response=$(api_request "GET" "$CRM_SERVICE_URL/clients" \
    "" 200 "$ACCOUNT1_TOKEN" "List all clients for Account 1")
  
  if [ $? -eq 0 ]; then
    local client_count=$(echo "$clients_response" | jq -r '.data | length // 0')
    print_info "Found $client_count clients"
  fi
  
  # Test 2: Get specific client
  api_request "GET" "$CRM_SERVICE_URL/clients/c1111111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Get specific client (Acme Corporation)" >/dev/null
  
  # Test 3: Create new client
  local new_client_response
  new_client_response=$(api_request "POST" "$CRM_SERVICE_URL/clients" \
    '{"name":"Test Client API","email":"test@apiclient.test","phone":"+1-555-9999","company":"Test Company","status":"active"}' \
    201 "$ACCOUNT1_TOKEN" "Create new client")
  
  if [ $? -eq 0 ]; then
    NEW_CLIENT_ID=$(echo "$new_client_response" | jq -r '.id // .data.id // empty')
    print_info "Created client ID: $NEW_CLIENT_ID"
  fi
  
  # Test 4: Update client
  if [ -n "$NEW_CLIENT_ID" ]; then
    api_request "PATCH" "$CRM_SERVICE_URL/clients/$NEW_CLIENT_ID" \
      '{"notes":"Updated via API test"}' \
      200 "$ACCOUNT1_TOKEN" "Update client notes" >/dev/null
  fi
  
  # Test 5: Search clients
  api_request "GET" "$CRM_SERVICE_URL/clients?search=Acme" \
    "" 200 "$ACCOUNT1_TOKEN" "Search clients by name" >/dev/null
  
  # Test 6: Verify Account 2 cannot see Account 1 client
  if [ -n "$ACCOUNT2_TOKEN" ]; then
    api_request "GET" "$CRM_SERVICE_URL/clients/c1111111-1111-1111-1111-111111111111" \
      "" 404 "$ACCOUNT2_TOKEN" "Account 2 cannot access Account 1 client (RLS test)" || true
  fi
  
  # Test 7: Delete client (soft delete)
  if [ -n "$NEW_CLIENT_ID" ]; then
    api_request "DELETE" "$CRM_SERVICE_URL/clients/$NEW_CLIENT_ID" \
      "" 200 "$ACCOUNT1_TOKEN" "Delete client (soft delete)" >/dev/null
  fi
  
  echo ""
}

# ============================================================================
# Project Management Tests
# ============================================================================

test_projects() {
  print_header "PROJECT MANAGEMENT TESTS"
  
  if [ -z "$ACCOUNT1_TOKEN" ]; then
    print_failure "No authentication token available, skipping project tests"
    return 1
  fi
  
  # Test 1: List all projects
  local projects_response
  projects_response=$(api_request "GET" "$CRM_SERVICE_URL/projects" \
    "" 200 "$ACCOUNT1_TOKEN" "List all projects for Account 1")
  
  if [ $? -eq 0 ]; then
    local project_count=$(echo "$projects_response" | jq -r '.data | length // 0')
    print_info "Found $project_count projects"
  fi
  
  # Test 2: Get specific project
  api_request "GET" "$CRM_SERVICE_URL/projects/pr111111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Get specific project (Acme CRM Implementation)" >/dev/null
  
  # Test 3: Create new project
  local new_project_response
  new_project_response=$(api_request "POST" "$CRM_SERVICE_URL/projects" \
    '{"name":"API Test Project","client_id":"c1111111-1111-1111-1111-111111111111","status":"planning","start_date":"2026-02-03","budget":50000}' \
    201 "$ACCOUNT1_TOKEN" "Create new project")
  
  if [ $? -eq 0 ]; then
    NEW_PROJECT_ID=$(echo "$new_project_response" | jq -r '.id // .data.id // empty')
    print_info "Created project ID: $NEW_PROJECT_ID"
  fi
  
  # Test 4: Update project progress
  if [ -n "$NEW_PROJECT_ID" ]; then
    api_request "PATCH" "$CRM_SERVICE_URL/projects/$NEW_PROJECT_ID" \
      '{"progress":25}' \
      200 "$ACCOUNT1_TOKEN" "Update project progress" >/dev/null
  fi
  
  # Test 5: Filter projects by status
  api_request "GET" "$CRM_SERVICE_URL/projects?status=in_progress" \
    "" 200 "$ACCOUNT1_TOKEN" "Filter projects by status" >/dev/null
  
  echo ""
}

# ============================================================================
# Task Management Tests
# ============================================================================

test_tasks() {
  print_header "TASK MANAGEMENT TESTS"
  
  if [ -z "$ACCOUNT1_TOKEN" ]; then
    print_failure "No authentication token available, skipping task tests"
    return 1
  fi
  
  # Test1: List all tasks
  api_request "GET" "$CRM_SERVICE_URL/tasks" \
    "" 200 "$ACCOUNT1_TOKEN" "List all tasks for Account 1" >/dev/null
  
  # Test 2: Get tasks for specific project
  api_request "GET" "$CRM_SERVICE_URL/tasks?project_id=pr111111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Get tasks for specific project" >/dev/null
  
  # Test 3: Create new task
  local new_task_response
  new_task_response=$(api_request "POST" "$CRM_SERVICE_URL/tasks" \
    '{"title":"API Test Task","project_id":"pr111111-1111-1111-1111-111111111111","status":"pending","priority":"medium"}' \
    201 "$ACCOUNT1_TOKEN" "Create new task")
  
  if [ $? -eq 0 ]; then
    NEW_TASK_ID=$(echo "$new_task_response" | jq -r '.id // .data.id // empty')
    print_info "Created task ID: $NEW_TASK_ID"
  fi
  
  # Test 4: Update task status
  if [ -n "$NEW_TASK_ID" ]; then
    api_request "PATCH" "$CRM_SERVICE_URL/tasks/$NEW_TASK_ID" \
      '{"status":"in_progress"}' \
      200 "$ACCOUNT1_TOKEN" "Update task status to in_progress" >/dev/null
  fi
  
  # Test 5: Complete task
  if [ -n "$NEW_TASK_ID" ]; then
    api_request "PATCH" "$CRM_SERVICE_URL/tasks/$NEW_TASK_ID" \
      '{"status":"completed"}' \
      200 "$ACCOUNT1_TOKEN" "Complete task" >/dev/null
  fi
  
  echo ""
}

# ============================================================================
# File Management Tests
# ============================================================================

test_files() {
  print_header "FILE MANAGEMENT TESTS"
  
  if [ -z "$ACCOUNT1_TOKEN" ]; then
    print_failure "No authentication token available, skipping file tests"
    return 1
  fi
  
  # Test 1: List all files
  local files_response
  files_response=$(api_request "GET" "$CRM_SERVICE_URL/files" \
    "" 200 "$ACCOUNT1_TOKEN" "List all files for Account 1")
  
  if [ $? -eq 0 ]; then
    local file_count=$(echo "$files_response" | jq -r '.data | length // 0')
    print_info "Found $file_count files"
  fi
  
  # Test 2: Get specific file metadata
  api_request "GET" "$CRM_SERVICE_URL/files/f1111111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Get specific file metadata" >/dev/null
  
  # Test 3: Search files by entity
  api_request "GET" "$CRM_SERVICE_URL/files?entity_type=project&entity_id=pr111111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Search files by project entity" >/dev/null
  
  # Test 4: Filter files by category
  api_request "GET" "$CRM_SERVICE_URL/files?file_category=document" \
    "" 200 "$ACCOUNT1_TOKEN" "Filter files by category" >/dev/null
  
  # Test 5: Update file metadata
  api_request "PATCH" "$CRM_SERVICE_URL/files/f1111111-1111-1111-1111-111111111111" \
    '{"description":"Updated description via API test"}' \
    200 "$ACCOUNT1_TOKEN" "Update file metadata" >/dev/null
  
  # Test 6: Verify Account 2 cannot access Account 1 file
  if [ -n "$ACCOUNT2_TOKEN" ]; then
    api_request "GET" "$CRM_SERVICE_URL/files/f1111111-1111-1111-1111-111111111111" \
      "" 404 "$ACCOUNT2_TOKEN" "Account 2 cannot access Account 1 file (RLS test)" || true
  fi
  
  echo ""
}

# ============================================================================
# Supplier and Professional Tests
# ============================================================================

test_suppliers_professionals() {
  print_header "SUPPLIER & PROFESSIONAL TESTS"
  
  if [ -z "$ACCOUNT1_TOKEN" ]; then
    print_failure "No authentication token available, skipping tests"
    return 1
  fi
  
  # Supplier tests
  api_request "GET" "$CRM_SERVICE_URL/suppliers" \
    "" 200 "$ACCOUNT1_TOKEN" "List all suppliers" >/dev/null
  
  api_request "GET" "$CRM_SERVICE_URL/suppliers/s1111111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Get specific supplier" >/dev/null
  
  # Professional tests
  api_request "GET" "$CRM_SERVICE_URL/professionals" \
    "" 200 "$ACCOUNT1_TOKEN" "List all professionals" >/dev/null
  
  api_request "GET" "$CRM_SERVICE_URL/professionals/pr011111-1111-1111-1111-111111111111" \
    "" 200 "$ACCOUNT1_TOKEN" "Get specific professional" >/dev/null
  
  echo ""
}

# ============================================================================
# Performance Tests
# ============================================================================

test_performance() {
  print_header "PERFORMANCE TESTS"
  
  if [ -z "$ACCOUNT1_TOKEN" ]; then
    print_failure "No authentication token available, skipping performance tests"
    return 1
  fi
  
  print_test "Measure API response times"
  
  # Test client list response time
  local start_time=$(date +%s%N)
  curl -s -o /dev/null -w "" -H "Authorization: Bearer $ACCOUNT1_TOKEN" "$CRM_SERVICE_URL/clients"
  local end_time=$(date +%s%N)
  local duration=$(( (end_time - start_time) / 1000000 ))
  
  if [ $duration -lt 1000 ]; then
    print_success "Client list response time: ${duration}ms (< 1000ms)"
  else
    print_failure "Client list response time: ${duration}ms (>= 1000ms - too slow)"
  fi
  
  # Test project list response time
  start_time=$(date +%s%N)
  curl -s -o /dev/null -w "" -H "Authorization: Bearer $ACCOUNT1_TOKEN" "$CRM_SERVICE_URL/projects"
  end_time=$(date +%s%N)
  duration=$(( (end_time - start_time) / 1000000 ))
  
  if [ $duration -lt 1000 ]; then
    print_success "Project list response time: ${duration}ms (< 1000ms)"
  else
    print_failure "Project list response time: ${duration}ms (>= 1000ms - too slow)"
  fi
  
  echo ""
}

# ============================================================================
# Main Test Execution
# ============================================================================

main() {
  print_header "NEXO CRM API INTEGRATION TEST SUITE"
  echo "Timestamp: $(date)"
  echo "Auth Service: $AUTH_SERVICE_URL"
  echo "CRM Service: $CRM_SERVICE_URL"
  echo ""
  
  # Check if services are running
  check_service "$AUTH_SERVICE_URL" "Auth Service"
  check_service "$CRM_SERVICE_URL" "CRM Service"
  echo ""
  
  # Run test suites
  test_authentication
  test_clients
  test_projects
  test_tasks
  test_files
  test_suppliers_professionals
  test_performance
  
  # Print summary
  print_header "TEST SUMMARY"
  echo -e "Total Tests: $TOTAL_TESTS"
  echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
  echo -e "${RED}Failed: $FAILED_TESTS${NC}"
  
  if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
  else
    echo -e "\n${RED}⚠️  SOME TESTS FAILED${NC}"
    exit 1
  fi
}

# Run main function
main "$@"
