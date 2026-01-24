#!/bin/bash
# Auth Service Test Script
# ========================

set -e

API_URL="http://localhost:3001/api/auth"

echo "🧪 Testing NEXO Auth Service"
echo "============================"
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check"
curl -s "${API_URL}/health" | jq
echo ""

# Test 2: Register User
echo "2️⃣  Register New User"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@nexo.com",
    "password": "Test123!@#",
    "username": "testuser",
    "full_name": "Test User"
  }')
echo "$REGISTER_RESPONSE" | jq -c '{email:.user.email,username:.user.username,role:.user.role,status:.user.status}'
echo ""

# Test 3: Login
echo "3️⃣  Login"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@nexo.com",
    "password": "Test123!@#"
  }')
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""

# Test 4: Get Profile
echo "4️⃣  Get User Profile (with JWT)"
curl -s "${API_URL}/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
echo ""

# Test 5: Refresh Token
echo "5️⃣  Refresh Access Token"
NEW_TOKEN=$(curl -s -X POST "${API_URL}/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" | jq -r '.access_token')
echo "New Access Token: ${NEW_TOKEN:0:50}..."
echo ""

# Test 6: Logout
echo "6️⃣  Logout (blacklist token)"
curl -s -X POST "${API_URL}/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" -w "\nStatus: %{http_code}\n"
echo ""

# Test 7: Try to use blacklisted token
echo "7️⃣  Try Using Blacklisted Token (should fail)"
curl -s "${API_URL}/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
echo ""

echo "✅ All tests completed!"
