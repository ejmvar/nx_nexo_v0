

TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken') && \
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/clients?limit=2 > /tmp/api-response.json && \
cat /tmp/api-response.json | jq '{dataType: .data | type, dataCount: .data | length, total, page, limit}'


TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken') && \
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/clients?limit=2 > /tmp/api-response.json && \
cat /tmp/api-response.json | jq '{dataType: .data | type, dataCount: .data | length, total, page, limit}'


cd /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend && cat <<'SCRIPT' > /tmp/test-all-endpoints.sh
#!/bin/bash
# Test all CRM endpoints across 3 accounts

echo "═══════════════════════════════════════════════════════"
echo "RLS VERIFICATION - ALL ENDPOINTS"
echo "═══════════════════════════════════════════════════════"

declare -A ACCOUNTS=(
  ["TechFlow"]="admin@techflow.test:11111111-1111-1111-1111-111111111111"
  ["Creative"]="admin@creative.test:22222222-2222-2222-2222-222222222222"
  ["BuildRight"]="admin@buildright.test:33333333-3333-3333-3333-333333333333"
)

for ACCOUNT_NAME in "${!ACCOUNTS[@]}"; do
  IFS=':' read -r EMAIL ACCOUNT_ID <<< "${ACCOUNTS[$ACCOUNT_NAME]}"
  
  echo ""
  echo "─────────────────────────────────────────────────────"
  echo "Testing: $ACCOUNT_NAME ($EMAIL)"
  echo "─────────────────────────────────────────────────────"
  
  # Login
  echo -n "🔐 Authenticating... "
  TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"test123\"}" | jq -r '.accessToken')
  
  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ FAILED"
    continue
  fi
  echo "✅ SUCCESS"
  
  # Test Clients
  echo -n "📊 Testing /api/clients... "
  CLIENTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/clients)
  CLIENTS_TOTAL=$(echo "$CLIENTS" | jq -r '.total // "null"')
  if [ "$CLIENTS_TOTAL" != "null" ]; then
    echo "✅ Total: $CLIENTS_TOTAL"
  else
    echo "❌ FAILED"
  fi
  
  # Test Projects
  echo -n "📁 Testing /api/projects... "
  PROJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/projects)
  PROJECTS_TOTAL=$(echo "$PROJECTS" | jq -r '.total // "null"')
  if [ "$PROJECTS_TOTAL" != "null" ]; then
    echo "✅ Total: $PROJECTS_TOTAL"
    # Show first project name
    FIRST_PROJECT=$(echo "$PROJECTS" | jq -r '.data[0].name // "none"')
    echo "   First project: $FIRST_PROJECT"
  else
    echo "❌ FAILED"
  fi
  
  # Test Tasks
  echo -n "✓ Testing /api/tasks... "
  TASKS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/tasks)
  TASKS_TOTAL=$(echo "$TASKS" | jq -r '.total // "null"')
  if [ "$TASKS_TOTAL" != "null" ]; then
    echo "✅ Total: $TASKS_TOTAL"
    # Show first task title
    FIRST_TASK=$(echo "$TASKS" | jq -r '.data[0].title // "none"')
    echo "   First task: $FIRST_TASK"
  else
    echo "❌ FAILED"
  fi
  
  # Summary for this account
  echo ""
  echo "Summary for $ACCOUNT_NAME:"
  echo "  Clients:  $CLIENTS_TOTAL"
  echo "  Projects: $PROJECTS_TOTAL"
  echo "  Tasks:    $TASKS_TOTAL"
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo "VERIFICATION COMPLETE"
echo "═══════════════════════════════════════════════════════"
SCRIPT

chmod +x /tmp/test-all-endpoints.sh
/tmp/test-all-endpoints.sh


# ::::::::::::::::::::::::::::::



















