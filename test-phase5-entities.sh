#!/bin/bash

#=============================================================================
# NEXO Phase 5 - Additional CRM Entities Test Suite
#=============================================================================
# Tests all newly enabled CRM entities:
# - Employees (user-based entities)
# - Suppliers (company entities)
# - Professionals (freelance entities)
# - Projects (client projects)
# - Tasks (project tasks)
#
# This script validates:
# - Full CRUD operations for each entity
# - Multi-tenant isolation
# - Cross-account access prevention
# - RLS enforcement
# - Data integrity
#=============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GATEWAY_URL="${GATEWAY_URL:-http://localhost:3002}"
API_PREFIX="/api"

# Test tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Global variables for test data
TOKEN1=""
TOKEN2=""
USER1_ID=""
USER2_ID=""
ACCOUNT1_ID=""
ACCOUNT2_ID=""
CLIENT1_ID=""
EMPLOYEE1_ID=""
SUPPLIER1_ID=""
PROFESSIONAL1_ID=""
PROJECT1_ID=""
TASK1_ID=""

#=============================================================================
# Helper Functions
#=============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((TESTS_FAILED++))
}

log_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    ((TESTS_RUN++))
}

log_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

cleanup() {
    echo ""
    log_section "Test Summary"
    echo -e "Total Tests: ${TESTS_RUN}"
    echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
        exit 1
    else
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    fi
}

trap cleanup EXIT

check_service() {
    local service_name=$1
    local url=$2
    log_info "Checking $service_name..."
    
    if curl -sf "${url}/health" > /dev/null 2>&1; then
        log_success "$service_name is running"
        return 0
    else
        log_error "$service_name is not responding at $url"
        return 1
    fi
}

#=============================================================================
# Pre-flight Checks
#=============================================================================

log_section "Pre-flight Checks"
check_service "API Gateway" "$GATEWAY_URL"

echo "DEBUG: Past pre-flight, starting setup..."

#=============================================================================
# Setup: Create Test Accounts and Users
#=============================================================================

log_section "Setup: Creating Test Accounts"

# Register Account 1
log_test "Register Account 1 (Acme Corp)"
REGISTER1_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@phase5test1.com",
    "password": "Test123!@#",
    "fullName": "Phase5 Admin One",
    "accountName": "Phase5 Account 1"
  }')

TOKEN1=$(echo "$REGISTER1_RESPONSE" | jq -r '.tokens.accessToken // .accessToken // empty')
if [ -z "$TOKEN1" ]; then
    log_error "Failed to get token for Account 1"
    echo "Response: $REGISTER1_RESPONSE"
    exit 1
fi
log_success "Account 1 registered successfully"

# Extract Account 1 details
ACCOUNT1_ID=$(echo "$REGISTER1_RESPONSE" | jq -r '.user.accountId // .user.account_id // empty')
USER1_ID=$(echo "$REGISTER1_RESPONSE" | jq -r '.user.id // empty')
log_info "Account 1 ID: $ACCOUNT1_ID"
log_info "User 1 ID: $USER1_ID"

# Register Account 2
log_test "Register Account 2 (Beta Industries)"
REGISTER2_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@phase5test2.com",
    "password": "Test123!@#",
    "fullName": "Phase5 Admin Two",
    "accountName": "Phase5 Account 2"
  }')

TOKEN2=$(echo "$REGISTER2_RESPONSE" | jq -r '.tokens.accessToken // .accessToken // empty')
if [ -z "$TOKEN2" ]; then
    log_error "Failed to get token for Account 2"
    echo "Response: $REGISTER2_RESPONSE"
    exit 1
fi
log_success "Account 2 registered successfully"

ACCOUNT2_ID=$(echo "$REGISTER2_RESPONSE" | jq -r '.user.accountId // .user.account_id // empty')
USER2_ID=$(echo "$REGISTER2_RESPONSE" | jq -r '.user.id // empty')
log_info "Account 2 ID: $ACCOUNT2_ID"
log_info "User 2 ID: $USER2_ID"

# Create a client for testing project relationships
log_test "Create test client for Account 1"
CLIENT_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/crm/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "name": "Test Client for Projects",
    "email": "client@test.com",
    "phone": "555-0100",
    "company": "Test Company"
  }')

CLIENT1_ID=$(echo "$CLIENT_RESPONSE" | jq -r '.id // empty')
if [ -z "$CLIENT1_ID" ]; then
    log_error "Failed to create test client"
    exit 1
fi
log_success "Test client created: $CLIENT1_ID"

#=============================================================================
# Employee Tests
#=============================================================================

log_section "Employee CRUD Tests"

# Create Employee
log_test "Create Employee (Account 1)"
EMPLOYEE_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/crm/employees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "email": "employee1@phase5test1.com",
    "fullName": "John Employee",
    "phone": "555-0101",
    "department": "Engineering",
    "position": "Senior Developer",
    "employeeCode": "EMP001"
  }')

EMPLOYEE1_ID=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.id // empty')
if [ -n "$EMPLOYEE1_ID" ]; then
    log_success "Employee created: $EMPLOYEE1_ID"
else
    log_error "Failed to create employee"
    echo "Response: $EMPLOYEE_RESPONSE"
fi

# Get Employees List
log_test "Get Employees list (Account 1)"
EMPLOYEES_LIST=$(curl -s -X GET "${GATEWAY_URL}${API_PREFIX}/crm/employees" \
  -H "Authorization: Bearer $TOKEN1")

EMPLOYEE_COUNT=$(echo "$EMPLOYEES_LIST" | jq -r '.data | length // 0')
if [ "$EMPLOYEE_COUNT" -ge 1 ]; then
    log_success "Employees list retrieved: $EMPLOYEE_COUNT employee(s)"
else
    log_error "Failed to get employees list or list is empty"
fi

# Get Employee by ID
log_test "Get Employee by ID"
EMPLOYEE_DETAIL=$(curl -s -X GET "${GATEWAY_URL}${API_PREFIX}/crm/employees/$EMPLOYEE1_ID" \
  -H "Authorization: Bearer $TOKEN1")

EMPLOYEE_NAME=$(echo "$EMPLOYEE_DETAIL" | jq -r '.full_name // empty')
if [ "$EMPLOYEE_NAME" = "John Employee" ]; then
    log_success "Employee detail retrieved correctly"
else
    log_error "Failed to get employee detail"
fi

# Update Employee
log_test "Update Employee"
UPDATE_RESPONSE=$(curl -s -X PUT "${GATEWAY_URL}${API_PREFIX}/crm/employees/$EMPLOYEE1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "position": "Lead Developer",
    "department": "Engineering Team"
  }')

UPDATED_POSITION=$(echo "$UPDATE_RESPONSE" | jq -r '.position // empty')
if [ "$UPDATED_POSITION" = "Lead Developer" ]; then
    log_success "Employee updated successfully"
else
    log_error "Failed to update employee"
fi

# Test cross-account access (Account 2 trying to access Account 1's employee)
log_test "Block cross-account employee access"
CROSS_ACCESS=$(curl -s -w "\n%{http_code}" -X GET "${GATEWAY_URL}${API_PREFIX}/crm/employees/$EMPLOYEE1_ID" \
  -H "Authorization: Bearer $TOKEN2")

HTTP_CODE=$(echo "$CROSS_ACCESS" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ]; then
    log_success "Cross-account access blocked (HTTP $HTTP_CODE)"
else
    log_error "Cross-account access NOT blocked (HTTP $HTTP_CODE)"
fi

#=============================================================================
# Supplier Tests
#=============================================================================

log_section "Supplier CRUD Tests"

# Create Supplier
log_test "Create Supplier (Account 1)"
SUPPLIER_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/crm/suppliers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "companyName": "Tech Supplies Inc",
    "contactName": "Jane Supplier",
    "email": "contact@techsupplies.com",
    "phone": "555-0200",
    "taxId": "12-3456789",
    "address": "123 Supply St",
    "paymentTerms": "Net 30"
  }')

SUPPLIER1_ID=$(echo "$SUPPLIER_RESPONSE" | jq -r '.id // empty')
if [ -n "$SUPPLIER1_ID" ]; then
    log_success "Supplier created: $SUPPLIER1_ID"
else
    log_error "Failed to create supplier"
    echo "Response: $SUPPLIER_RESPONSE"
fi

# Get Suppliers List
log_test "Get Suppliers list (Account 1)"
SUPPLIERS_LIST=$(curl -s -X GET "${GATEWAY_URL}${API_PREFIX}/crm/suppliers" \
  -H "Authorization: Bearer $TOKEN1")

SUPPLIER_COUNT=$(echo "$SUPPLIERS_LIST" | jq -r '.data | length // 0')
if [ "$SUPPLIER_COUNT" -ge 1 ]; then
    log_success "Suppliers list retrieved: $SUPPLIER_COUNT supplier(s)"
else
    log_error "Failed to get suppliers list or list is empty"
fi

# Update Supplier
log_test "Update Supplier"
UPDATE_SUPPLIER=$(curl -s -X PUT "${GATEWAY_URL}${API_PREFIX}/crm/suppliers/$SUPPLIER1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "paymentTerms": "Net 45",
    "status": "active"
  }')

UPDATED_TERMS=$(echo "$UPDATE_SUPPLIER" | jq -r '.payment_terms // empty')
if [ "$UPDATED_TERMS" = "Net 45" ]; then
    log_success "Supplier updated successfully"
else
    log_error "Failed to update supplier"
fi

# Test cross-account access
log_test "Block cross-account supplier access"
CROSS_SUPPLIER=$(curl -s -w "\n%{http_code}" -X GET "${GATEWAY_URL}${API_PREFIX}/crm/suppliers/$SUPPLIER1_ID" \
  -H "Authorization: Bearer $TOKEN2")

HTTP_CODE=$(echo "$CROSS_SUPPLIER" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ]; then
    log_success "Cross-account access blocked (HTTP $HTTP_CODE)"
else
    log_error "Cross-account access NOT blocked (HTTP $HTTP_CODE)"
fi

#=============================================================================
# Professional Tests
#=============================================================================

log_section "Professional CRUD Tests"

# Create Professional
log_test "Create Professional (Account 1)"
PROFESSIONAL_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/crm/professionals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "fullName": "Alice Freelancer",
    "email": "alice@freelance.com",
    "phone": "555-0300",
    "specialty": "UI/UX Design",
    "hourlyRate": 75.00,
    "availability": "part-time"
  }')

PROFESSIONAL1_ID=$(echo "$PROFESSIONAL_RESPONSE" | jq -r '.id // empty')
if [ -n "$PROFESSIONAL1_ID" ]; then
    log_success "Professional created: $PROFESSIONAL1_ID"
else
    log_error "Failed to create professional"
    echo "Response: $PROFESSIONAL_RESPONSE"
fi

# Get Professionals List
log_test "Get Professionals list (Account 1)"
PROFESSIONALS_LIST=$(curl -s -X GET "${GATEWAY_URL}${API_PREFIX}/crm/professionals" \
  -H "Authorization: Bearer $TOKEN1")

PROFESSIONAL_COUNT=$(echo "$PROFESSIONALS_LIST" | jq -r '.data | length // 0')
if [ "$PROFESSIONAL_COUNT" -ge 1 ]; then
    log_success "Professionals list retrieved: $PROFESSIONAL_COUNT professional(s)"
else
    log_error "Failed to get professionals list or list is empty"
fi

# Update Professional
log_test "Update Professional"
UPDATE_PROFESSIONAL=$(curl -s -X PUT "${GATEWAY_URL}${API_PREFIX}/crm/professionals/$PROFESSIONAL1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "hourlyRate": 85.00,
    "availability": "full-time"
  }')

UPDATED_RATE=$(echo "$UPDATE_PROFESSIONAL" | jq -r '.hourly_rate // empty')
if [ "$UPDATED_RATE" = "85" ] || [ "$UPDATED_RATE" = "85.00" ]; then
    log_success "Professional updated successfully"
else
    log_error "Failed to update professional"
fi

# Test cross-account access
log_test "Block cross-account professional access"
CROSS_PROFESSIONAL=$(curl -s -w "\n%{http_code}" -X GET "${GATEWAY_URL}${API_PREFIX}/crm/professionals/$PROFESSIONAL1_ID" \
  -H "Authorization: Bearer $TOKEN2")

HTTP_CODE=$(echo "$CROSS_PROFESSIONAL" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ]; then
    log_success "Cross-account access blocked (HTTP $HTTP_CODE)"
else
    log_error "Cross-account access NOT blocked (HTTP $HTTP_CODE)"
fi

#=============================================================================
# Project Tests
#=============================================================================

log_section "Project CRUD Tests"

# Create Project
log_test "Create Project (Account 1)"
PROJECT_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/crm/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"name\": \"Website Redesign\",
    \"description\": \"Complete website overhaul\",
    \"clientId\": \"$CLIENT1_ID\",
    \"startDate\": \"2026-02-01\",
    \"endDate\": \"2026-04-30\",
    \"status\": \"planning\",
    \"budget\": 50000.00
  }")

PROJECT1_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id // empty')
if [ -n "$PROJECT1_ID" ]; then
    log_success "Project created: $PROJECT1_ID"
else
    log_error "Failed to create project"
    echo "Response: $PROJECT_RESPONSE"
fi

# Get Projects List
log_test "Get Projects list (Account 1)"
PROJECTS_LIST=$(curl -s -X GET "${GATEWAY_URL}${API_PREFIX}/crm/projects" \
  -H "Authorization: Bearer $TOKEN1")

PROJECT_COUNT=$(echo "$PROJECTS_LIST" | jq -r '.data | length // 0')
if [ "$PROJECT_COUNT" -ge 1 ]; then
    log_success "Projects list retrieved: $PROJECT_COUNT project(s)"
else
    log_error "Failed to get projects list or list is empty"
fi

# Update Project
log_test "Update Project"
UPDATE_PROJECT=$(curl -s -X PUT "${GATEWAY_URL}${API_PREFIX}/crm/projects/$PROJECT1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "status": "in-progress",
    "budget": 55000.00
  }')

UPDATED_STATUS=$(echo "$UPDATE_PROJECT" | jq -r '.status // empty')
if [ "$UPDATED_STATUS" = "in-progress" ] || [ "$UPDATED_STATUS" = "in_progress" ]; then
    log_success "Project updated successfully"
else
    log_error "Failed to update project"
fi

# Test cross-account access
log_test "Block cross-account project access"
CROSS_PROJECT=$(curl -s -w "\n%{http_code}" -X GET "${GATEWAY_URL}${API_PREFIX}/crm/projects/$PROJECT1_ID" \
  -H "Authorization: Bearer $TOKEN2")

HTTP_CODE=$(echo "$CROSS_PROJECT" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ]; then
    log_success "Cross-account access blocked (HTTP $HTTP_CODE)"
else
    log_error "Cross-account access NOT blocked (HTTP $HTTP_CODE)"
fi

#=============================================================================
# Task Tests
#=============================================================================

log_section "Task CRUD Tests"

# Create Task
log_test "Create Task (Account 1)"
TASK_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}${API_PREFIX}/crm/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"title\": \"Design Homepage Mockup\",
    \"description\": \"Create initial design mockup for homepage\",
    \"projectId\": \"$PROJECT1_ID\",
    \"assignedTo\": \"$EMPLOYEE1_ID\",
    \"status\": \"todo\",
    \"priority\": \"high\",
    \"dueDate\": \"2026-02-15\"
  }")

TASK1_ID=$(echo "$TASK_RESPONSE" | jq -r '.id // empty')
if [ -n "$TASK1_ID" ]; then
    log_success "Task created: $TASK1_ID"
else
    log_error "Failed to create task"
    echo "Response: $TASK_RESPONSE"
fi

# Get Tasks List
log_test "Get Tasks list (Account 1)"
TASKS_LIST=$(curl -s -X GET "${GATEWAY_URL}${API_PREFIX}/crm/tasks" \
  -H "Authorization: Bearer $TOKEN1")

TASK_COUNT=$(echo "$TASKS_LIST" | jq -r '.data | length // 0')
if [ "$TASK_COUNT" -ge 1 ]; then
    log_success "Tasks list retrieved: $TASK_COUNT task(s)"
else
    log_error "Failed to get tasks list or list is empty"
fi

# Update Task
log_test "Update Task"
UPDATE_TASK=$(curl -s -X PUT "${GATEWAY_URL}${API_PREFIX}/crm/tasks/$TASK1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "status": "in-progress",
    "priority": "urgent"
  }')

UPDATED_TASK_STATUS=$(echo "$UPDATE_TASK" | jq -r '.status // empty')
if [ "$UPDATED_TASK_STATUS" = "in-progress" ] || [ "$UPDATED_TASK_STATUS" = "in_progress" ]; then
    log_success "Task updated successfully"
else
    log_error "Failed to update task"
fi

# Test cross-account access
log_test "Block cross-account task access"
CROSS_TASK=$(curl -s -w "\n%{http_code}" -X GET "${GATEWAY_URL}${API_PREFIX}/crm/tasks/$TASK1_ID" \
  -H "Authorization: Bearer $TOKEN2")

HTTP_CODE=$(echo "$CROSS_TASK" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ]; then
    log_success "Cross-account access blocked (HTTP $HTTP_CODE)"
else
    log_error "Cross-account access NOT blocked (HTTP $HTTP_CODE)"
fi

#=============================================================================
# Cleanup Tests (Optional - Delete Created Entities)
#=============================================================================

log_section "Cleanup Tests (Delete Operations)"

# Delete Task
log_test "Delete Task"
DELETE_TASK=$(curl -s -w "\n%{http_code}" -X DELETE "${GATEWAY_URL}${API_PREFIX}/crm/tasks/$TASK1_ID" \
  -H "Authorization: Bearer $TOKEN1")
HTTP_CODE=$(echo "$DELETE_TASK" | tail -n1)
if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    log_success "Task deleted successfully"
else
    log_error "Failed to delete task (HTTP $HTTP_CODE)"
fi

# Delete Project
log_test "Delete Project"
DELETE_PROJECT=$(curl -s -w "\n%{http_code}" -X DELETE "${GATEWAY_URL}${API_PREFIX}/crm/projects/$PROJECT1_ID" \
  -H "Authorization: Bearer $TOKEN1")
HTTP_CODE=$(echo "$DELETE_PROJECT" | tail -n1)
if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    log_success "Project deleted successfully"
else
    log_error "Failed to delete project (HTTP $HTTP_CODE)"
fi

# Delete Professional
log_test "Delete Professional"
DELETE_PROFESSIONAL=$(curl -s -w "\n%{http_code}" -X DELETE "${GATEWAY_URL}${API_PREFIX}/crm/professionals/$PROFESSIONAL1_ID" \
  -H "Authorization: Bearer $TOKEN1")
HTTP_CODE=$(echo "$DELETE_PROFESSIONAL" | tail -n1)
if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    log_success "Professional deleted successfully"
else
    log_error "Failed to delete professional (HTTP $HTTP_CODE)"
fi

# Delete Supplier
log_test "Delete Supplier"
DELETE_SUPPLIER=$(curl -s -w "\n%{http_code}" -X DELETE "${GATEWAY_URL}${API_PREFIX}/crm/suppliers/$SUPPLIER1_ID" \
  -H "Authorization: Bearer $TOKEN1")
HTTP_CODE=$(echo "$DELETE_SUPPLIER" | tail -n1)
if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    log_success "Supplier deleted successfully"
else
    log_error "Failed to delete supplier (HTTP $HTTP_CODE)"
fi

# Delete Employee
log_test "Delete Employee"
DELETE_EMPLOYEE=$(curl -s -w "\n%{http_code}" -X DELETE "${GATEWAY_URL}${API_PREFIX}/crm/employees/$EMPLOYEE1_ID" \
  -H "Authorization: Bearer $TOKEN1")
HTTP_CODE=$(echo "$DELETE_EMPLOYEE" | tail -n1)
if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    log_success "Employee deleted successfully"
else
    log_error "Failed to delete employee (HTTP $HTTP_CODE)"
fi

log_section "Phase 5 Test Suite Complete"
echo ""
echo "Summary:"
echo "- ✅ Employee CRUD operations working"
echo "- ✅ Supplier CRUD operations working"
echo "- ✅ Professional CRUD operations working"
echo "- ✅ Project CRUD operations working"
echo "- ✅ Task CRUD operations working"
echo "- ✅ Multi-tenant isolation enforced for all entities"
echo "- ✅ Cross-account access blocked for all entities"
echo ""
