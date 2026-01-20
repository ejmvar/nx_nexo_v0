#!/bin/bash
# ============================================================================
# Backend Database Connection Test Script
# ============================================================================
# Tests database connectivity and query functionality from backend
# Usage: bash scripts/test-backend-database.sh
# ============================================================================

set -e

COMPOSE_FILE="docker/docker-compose.yml"

echo "🔗 Testing Backend-to-Database connectivity..."

# Check if services are running
if ! docker compose -f "$COMPOSE_FILE" ps backend | grep -q "Up"; then
    echo "❌ Backend service is not running"
    exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL service is not running"
    exit 1
fi

echo "✓ Both services are running"

# Function to test connection
test_connection() {
    echo "Testing PostgreSQL connection..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T backend \
        sh -c 'node -e "const {Pool}=require(\"pg\");new Pool({connectionString:process.env.DATABASE_URL}).connect().then(c=>{console.log(\"Connected\");c.release();process.exit(0)}).catch(e=>{console.error(e);process.exit(1)})"' \
        2>&1 | grep -q "Connected"; then
        echo "✓ Backend can connect to PostgreSQL"
        return 0
    else
        echo "❌ Backend cannot connect to PostgreSQL"
        return 1
    fi
}

# Function to test query execution
test_query() {
    echo "Testing database query execution..."
    
    result=$(docker compose -f "$COMPOSE_FILE" exec -T backend \
        sh -c 'node -e "const {Pool}=require(\"pg\");new Pool({connectionString:process.env.DATABASE_URL}).query(\"SELECT version()\").then(r=>{console.log(r.rows[0].version);process.exit(0)}).catch(e=>{console.error(e);process.exit(1)})"' \
        2>&1)
    
    if echo "$result" | grep -q "PostgreSQL"; then
        echo "✓ Backend can execute queries"
        echo "  Database: $(echo "$result" | grep PostgreSQL | cut -d' ' -f1-2)"
        return 0
    else
        echo "❌ Backend cannot execute queries"
        echo "  Error: $result"
        return 1
    fi
}

# Function to test connection pool
test_connection_pool() {
    echo "Testing connection pool..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T backend \
        sh -c 'node -e "const {Pool}=require(\"pg\");const p=new Pool({connectionString:process.env.DATABASE_URL,max:5});Promise.all([1,2,3].map(()=>p.query(\"SELECT 1\"))).then(()=>{console.log(\"Pool OK\");p.end();process.exit(0)}).catch(e=>{console.error(e);process.exit(1)})"' \
        2>&1 | grep -q "Pool OK"; then
        echo "✓ Connection pooling works"
        return 0
    else
        echo "❌ Connection pooling failed"
        return 1
    fi
}

# Function to test transaction support
test_transactions() {
    echo "Testing transaction support..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T backend \
        sh -c 'node -e "const {Pool}=require(\"pg\");const p=new Pool({connectionString:process.env.DATABASE_URL});(async()=>{const c=await p.connect();try{await c.query(\"BEGIN\");await c.query(\"SELECT 1\");await c.query(\"COMMIT\");console.log(\"Transaction OK\");c.release();p.end();process.exit(0)}catch(e){await c.query(\"ROLLBACK\");c.release();p.end();throw e}})()"' \
        2>&1 | grep -q "Transaction OK"; then
        echo "✓ Transactions work correctly"
        return 0
    else
        echo "❌ Transaction test failed"
        return 1
    fi
}

# Function to test prepared statements
test_prepared_statements() {
    echo "Testing prepared statements..."
    
    if docker compose -f "$COMPOSE_FILE" exec -T backend \
        sh -c 'node -e "const {Pool}=require(\"pg\");new Pool({connectionString:process.env.DATABASE_URL}).query(\"SELECT \$1::text as value\",[\"test\"]).then(r=>{if(r.rows[0].value===\"test\")console.log(\"Prepared OK\");process.exit(0)}).catch(e=>{console.error(e);process.exit(1)})"' \
        2>&1 | grep -q "Prepared OK"; then
        echo "✓ Prepared statements work"
        return 0
    else
        echo "❌ Prepared statements failed"
        return 1
    fi
}

# Run all tests
FAILED=0

if ! test_connection; then
    FAILED=$((FAILED + 1))
fi

if ! test_query; then
    FAILED=$((FAILED + 1))
fi

if ! test_connection_pool; then
    FAILED=$((FAILED + 1))
fi

if ! test_transactions; then
    FAILED=$((FAILED + 1))
fi

if ! test_prepared_statements; then
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All database connectivity tests passed!"
    echo ""
    echo "Database Connection Details:"
    echo "  Host: postgres:5432"
    echo "  Database: nexo"
    echo "  User: nexo_user"
    exit 0
else
    echo "❌ $FAILED database test(s) failed"
    echo "💡 Check backend logs: mise run logs:backend"
    echo "💡 Check postgres logs: mise run logs:postgres"
    exit 1
fi
