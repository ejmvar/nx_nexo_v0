

TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken') && \
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/clients?limit=2 > /tmp/api-response.json && \
cat /tmp/api-response.json | jq '{dataType: .data | type, dataCount: .data | length, total, page, limit}'


TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@techflow.test","password":"test123"}' | jq -r '.accessToken') && \
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/clients?limit=2 > /tmp/api-response.json && \
cat /tmp/api-response.json | jq '{dataType: .data | type, dataCount: .data | length, total, page, limit}'























