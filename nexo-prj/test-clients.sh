#!/bin/bash
# Test CRM Service Multi-Tenant Isolation

ACME_TOKEN=$(cat /tmp/acme-token.json | jq -r '.accessToken')
TECH_TOKEN=$(cat /tmp/techcorp-token.json | jq -r '.accessToken')

echo "=== Creating Clients for ACME Corp ===" > /tmp/test-results.txt
curl -s -X POST http://localhost:3003/api/clients \
  -H "Authorization: Bearer $ACME_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","full_name":"Alice Johnson","company_name":"Johnson Enterprises"}' \
  | jq '.' >> /tmp/test-results.txt

curl -s -X POST http://localhost:3003/api/clients \
  -H "Authorization: Bearer $ACME_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@acme.com","full_name":"Bob Williams","company_name":"Williams LLC"}' \
  | jq '.' >> /tmp/test-results.txt

echo "\n=== Creating Clients for TechCorp ===" >> /tmp/test-results.txt
curl -s -X POST http://localhost:3003/api/clients \
  -H "Authorization: Bearer $TECH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie@tech.com","full_name":"Charlie Brown","company_name":"Brown Industries"}' \
  | jq '.' >> /tmp/test-results.txt

echo "\n=== Getting ACME Clients ===" >> /tmp/test-results.txt
curl -s -X GET http://localhost:3003/api/clients \
  -H "Authorization: Bearer $ACME_TOKEN" \
  | jq '.' >> /tmp/test-results.txt

echo "\n=== Getting TechCorp Clients ===" >> /tmp/test-results.txt
curl -s -X GET http://localhost:3003/api/clients \
  -H "Authorization: Bearer $TECH_TOKEN" \
  | jq '.' >> /tmp/test-results.txt

echo "\nTest completed! Results in /tmp/test-results.txt"
