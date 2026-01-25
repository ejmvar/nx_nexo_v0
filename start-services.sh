#!/bin/bash
# 
# Start all NEXO backend services
# Usage: ./start-services.sh
#

set -e

PROJECT_DIR="/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj"
LOG_DIR="/tmp/nexo-logs"

# Create log directory
mkdir -p "$LOG_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "   Starting NEXO Backend Services"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Kill existing processes
echo "🔄 Stopping existing services..."
lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
lsof -ti:3002 | xargs -r kill -9 2>/dev/null || true
lsof -ti:3003 | xargs -r kill -9 2>/dev/null || true
sleep 2

cd "$PROJECT_DIR"

# Start Auth Service
echo "🚀 Starting Auth Service (Port 3001)..."
nohup pnpm nx serve auth-service > "$LOG_DIR/auth-service.log" 2>&1 &
AUTH_PID=$!
echo "   PID: $AUTH_PID"

# Start CRM Service
echo "🚀 Starting CRM Service (Port 3003)..."
nohup pnpm nx serve crm-service > "$LOG_DIR/crm-service.log" 2>&1 &
CRM_PID=$!
echo "   PID: $CRM_PID"

# Start API Gateway
echo "🚀 Starting API Gateway (Port 3002)..."
nohup pnpm nx serve api-gateway > "$LOG_DIR/api-gateway.log" 2>&1 &
GATEWAY_PID=$!
echo "   PID: $GATEWAY_PID"

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo ""
echo "📊 Service Status:"
echo "───────────────────────────────────────────────────────────"

check_port() {
  local port=$1
  local name=$2
  if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
    echo "   ✅ $name (Port $port): RUNNING"
    return 0
  else
    echo "   ❌ $name (Port $port): NOT RUNNING"
    return 1
  fi
}

ALL_RUNNING=true
check_port 3001 "Auth Service" || ALL_RUNNING=false
check_port 3002 "API Gateway" || ALL_RUNNING=false
check_port 3003 "CRM Service" || ALL_RUNNING=false

echo "───────────────────────────────────────────────────────────"
echo ""

if [ "$ALL_RUNNING" = true ]; then
  echo "✅ All services started successfully!"
  echo ""
  echo "📡 Service URLs:"
  echo "   • Auth Service: http://localhost:3001/api"
  echo "   • API Gateway:  http://localhost:3002/api"
  echo "   • CRM Service:  http://localhost:3003/api"
  echo ""
  echo "🧪 Quick Tests:"
  echo "   curl http://localhost:3002/api/health | jq ."
  echo "   curl http://localhost:3002/api/auth/health | jq ."
  echo "   curl http://localhost:3002/api/crm/health | jq ."
  echo ""
  echo "📋 View Logs:"
  echo "   tail -f $LOG_DIR/auth-service.log"
  echo "   tail -f $LOG_DIR/api-gateway.log"
  echo "   tail -f $LOG_DIR/crm-service.log"
  echo ""
  echo "🛑 Stop Services:"
  echo "   kill $AUTH_PID $GATEWAY_PID $CRM_PID"
  echo "   # or"
  echo "   ./stop-services.sh"
else
  echo "⚠️  Some services failed to start. Check logs:"
  echo "   tail -f $LOG_DIR/*.log"
  exit 1
fi

echo "═══════════════════════════════════════════════════════════"
