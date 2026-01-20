# NEXO ERP Backend - Manual Testing Examples

This directory contains manual testing examples for the NEXO ERP backend microservices.

## Files:
- `curl-examples.sh` - Bash script with curl commands for testing all endpoints
- `restclient-examples.http` - REST Client (.http) files for VS Code REST Client extension
- `health-checks.py` - Python scripts for automated health checks

## Services:
- API Gateway: http://localhost:3001
- Auth Service: http://localhost:3000 (direct access)
- CRM Service: http://localhost:3002 (planned)
- Stock Service: http://localhost:3003 (planned)
- Sales Service: http://localhost:3004 (planned)
- Purchases Service: http://localhost:3005 (planned)
- Production Service: http://localhost:3006 (planned)
- Notifications Service: http://localhost:3007 (planned)

## Prerequisites:
1. Start the API Gateway: `cd dist/out-tsc && node main.js`
2. Start the Auth Service: `cd dist/apps/auth-service && node src/main.js`
3. Run the test scripts or use the REST Client files

## Usage:
```bash
# Run curl examples
./testing/curl-examples.sh

# Use REST Client in VS Code (open .http files)
# Or run Python health checks
python3 testing/health-checks.py
```