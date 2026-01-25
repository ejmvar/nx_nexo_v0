#!/bin/bash
#
# Stop all NEXO backend services
# Usage: ./stop-services.sh
#

echo "🛑 Stopping NEXO Backend Services..."

# Kill processes on ports
for port in 3001 3002 3003; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "   Stopping service on port $port (PID: $PID)"
    kill -9 $PID 2>/dev/null || true
  else
    echo "   No service running on port $port"
  fi
done

echo "✅ All services stopped"
