#!/bin/bash
# Quick Phase 5 endpoint test
set -e

TIMESTAMP=$(date +%s)
EMAIL="p5test${TIMESTAMP}@nexo.com"
USERNAME="p5test${TIMESTAMP}"
SLUG="p5test-${TIMESTAMP}"

echo "=== Phase 5 Endpoint Tests ==="
echo ""

# 1. Register and get token
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"TestPass123!\",\"username\":\"${USERNAME}\",\"firstName\":\"Test\",\"lastName\":\"User\",\"accountName\":\"Test Account\",\"accountSlug\":\"${SLUG}\"}")

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.tokens.accessToken // .accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Registration failed"
  echo "$REGISTER_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Registration successful"
echo ""

# 2. Create Employee
echo "2. Testing Employee endpoint..."
EMP_RESPONSE=$(curl -s -X POST http://localhost:3002/api/crm/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"emp@test.com","full_name":"John Employee","position":"Developer","department":"Engineering"}')

EMP_ID=$(echo "$EMP_RESPONSE" | jq -r '.id // empty')
if [ -n "$EMP_ID" ]; then
  echo "✅ Employee created: $EMP_ID"
else
  echo "⚠️  Employee creation response:"
  echo "$EMP_RESPONSE" | jq '.'
fi
echo ""

# 3. Create Professional
echo "3. Testing Professional endpoint..."
PROF_RESPONSE=$(curl -s -X POST http://localhost:3002/api/crm/professionals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"full_name":"Jane Professional","email":"jane@pro.com","phone":"555-0100","specialty":"Design","hourly_rate":85}')

PROF_ID=$(echo "$PROF_RESPONSE" | jq -r '.id // empty')
if [ -n "$PROF_ID" ]; then
  echo "✅ Professional created: $PROF_ID"
else
  echo "⚠️  Professional creation response:"
  echo "$PROF_RESPONSE" | jq '.'
fi
echo ""

# 4. Create Client (for project test)
echo "4. Creating test client..."
CLIENT_RESPONSE=$(curl -s -X POST http://localhost:3002/api/crm/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"client@test.com","full_name":"Test Client","company_name":"Test Corp"}')

CLIENT_ID=$(echo "$CLIENT_RESPONSE" | jq -r '.id // empty')
if [ -n "$CLIENT_ID" ]; then
  echo "✅ Client created: $CLIENT_ID"
else
  echo "⚠️  Client creation failed"
fi
echo ""

# 5. Create Project
echo "5. Testing Project endpoint..."
if [ -n "$CLIENT_ID" ]; then
  PROJ_RESPONSE=$(curl -s -X POST http://localhost:3002/api/crm/projects \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\":\"Test Project\",\"description\":\"Test description\",\"client_id\":\"${CLIENT_ID}\",\"status\":\"planning\",\"budget\":50000}")

  PROJ_ID=$(echo "$PROJ_RESPONSE" | jq -r '.id // empty')
  if [ -n "$PROJ_ID" ]; then
    echo "✅ Project created: $PROJ_ID"
  else
    echo "⚠️  Project creation response:"
    echo "$PROJ_RESPONSE" | jq '.'
  fi
else
  echo "⏭️  Skipping project (no client)"
fi
echo ""

# 6. Create Task
echo "6. Testing Task endpoint..."
if [ -n "$PROJ_ID" ] && [ -n "$EMP_ID" ]; then
  TASK_RESPONSE=$(curl -s -X POST http://localhost:3002/api/crm/tasks \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"title\":\"Test Task\",\"description\":\"Test description\",\"project_id\":\"${PROJ_ID}\",\"assigned_to\":\"${EMP_ID}\",\"status\":\"todo\",\"priority\":\"high\"}")

  TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.id // empty')
  if [ -n "$TASK_ID" ]; then
    echo "✅ Task created: $TASK_ID"
  else
    echo "⚠️  Task creation response:"
    echo "$TASK_RESPONSE" | jq '.'
  fi
else
  echo "⏭️  Skipping task (no project or employee)"
fi
echo ""

# 7. List entities
echo "7. Testing list endpoints..."
echo "  - Employees:"
curl -s -X GET "http://localhost:3002/api/crm/employees" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data | length | " Found: \(.) employees"'

echo "  - Professionals:"
curl -s -X GET "http://localhost:3002/api/crm/professionals" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data | length | "    Found: \(.) professionals"'

echo "  - Projects:"
curl -s -X GET "http://localhost:3002/api/crm/projects" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data | length | "    Found: \(.) projects"'

echo "  - Tasks:"
curl -s -X GET "http://localhost:3002/api/crm/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data | length | "    Found: \(.) tasks"'

echo ""
echo "=== Phase 5 Tests Complete ==="
