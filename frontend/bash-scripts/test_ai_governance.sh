#!/bin/bash

# ==============================================================================
# AI Governance Platform - Complete Test Suite
# ==============================================================================

echo "🚀 AI GOVERNANCE PLATFORM - TEST SUITE"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5000/api/v1"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# ==============================================================================
# Helper Functions
# ==============================================================================

test_passed() {
    echo -e "${GREEN}✅ PASSED${NC}: $1"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "${RED}❌ FAILED${NC}: $1"
    ((TESTS_FAILED++))
}

test_info() {
    echo -e "${YELLOW}ℹ️  INFO${NC}: $1"
}

# ==============================================================================
# Test 1: Backend Health Check
# ==============================================================================

echo "Test 1: Backend Health Check"
echo "-----------------------------"

response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/)
if [ "$response" -eq 200 ] || [ "$response" -eq 404 ]; then
    test_passed "Backend is running"
else
    test_failed "Backend is not responding (HTTP $response)"
fi
echo ""

# ==============================================================================
# Test 2: Database Tables Exist
# ==============================================================================

echo "Test 2: Database Tables Check"
echo "------------------------------"

docker-compose exec -T mysql mysql -u root -proot -e "USE portfolio_db; SHOW TABLES LIKE 'tbl_ai%';" 2>/dev/null > /tmp/ai_tables.txt

if grep -q "tbl_ai_agents" /tmp/ai_tables.txt; then
    test_passed "tbl_ai_agents exists"
else
    test_failed "tbl_ai_agents missing"
fi

if grep -q "tbl_ai_tasks" /tmp/ai_tables.txt; then
    test_passed "tbl_ai_tasks exists"
else
    test_failed "tbl_ai_tasks missing"
fi

if grep -q "tbl_human_approvals" /tmp/ai_tables.txt; then
    test_passed "tbl_human_approvals exists"
else
    test_failed "tbl_human_approvals missing"
fi

if grep -q "tbl_blockchain_audit" /tmp/ai_tables.txt; then
    test_passed "tbl_blockchain_audit exists"
else
    test_failed "tbl_blockchain_audit missing"
fi

echo ""

# ==============================================================================
# Test 3: RBAC Permissions
# ==============================================================================

echo "Test 3: RBAC Permissions Check"
echo "-------------------------------"

docker-compose exec -T mysql mysql -u root -proot -e "
USE portfolio_db; 
SELECT COUNT(*) as count FROM tbl_permissions WHERE resource IN ('ai_agents', 'ai_tasks', 'approvals', 'policies');
" 2>/dev/null | grep -o '[0-9]\+' > /tmp/perm_count.txt

perm_count=$(tail -1 /tmp/perm_count.txt)

if [ "$perm_count" -ge 12 ]; then
    test_passed "AI Governance permissions created ($perm_count found)"
else
    test_failed "Missing AI Governance permissions (only $perm_count found, expected 12)"
fi

echo ""

# ==============================================================================
# Test 4: Login and Get Token
# ==============================================================================

echo "Test 4: Authentication"
echo "----------------------"

# Try to login (adjust credentials as needed)
login_response=$(curl -s -X POST "$BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

if echo "$login_response" | grep -q "access_token"; then
    TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    test_passed "Login successful, token obtained"
else
    test_info "Login failed (may need to create admin user first)"
    TOKEN=""
fi

echo ""

# ==============================================================================
# Test 5: MPC Service Unit Test
# ==============================================================================

echo "Test 5: MPC Service"
echo "-------------------"

mpc_test=$(docker-compose exec -T backend python -c "
from portfolio_app.services.mpc_service import MPCService, classify_sensitivity
import json

# Test 1: Classify sensitivity
data = {'ssn': '123-45-6789', 'name': 'John Doe'}
is_sensitive, types = classify_sensitivity(data)
print(f'SENSITIVE={is_sensitive}')

# Test 2: MPC computation
mpc = MPCService(threshold=3, num_shares=5)
result = mpc.secure_compute({'test': 'data'})
print(f'MPC_NODES={result[\"mpc_metadata\"][\"nodes_used\"]}')
print(f'MPC_THRESHOLD={result[\"mpc_metadata\"][\"threshold\"]}')
print(f'MPC_PROOF={result[\"proof\"][\"type\"]}')
" 2>&1)

if echo "$mpc_test" | grep -q "SENSITIVE=True"; then
    test_passed "MPC detects sensitive data"
else
    test_failed "MPC sensitivity detection not working"
fi

if echo "$mpc_test" | grep -q "MPC_NODES=3"; then
    test_passed "MPC uses correct number of nodes (3/5)"
else
    test_failed "MPC node configuration incorrect"
fi

if echo "$mpc_test" | grep -q "MPC_PROOF=shamir-mpc-zkp"; then
    test_passed "MPC generates Zero-Knowledge Proof"
else
    test_failed "MPC proof generation failed"
fi

echo ""

# ==============================================================================
# Test 6: Blockchain Service Unit Test
# ==============================================================================

echo "Test 6: Blockchain Service"
echo "---------------------------"

blockchain_test=$(docker-compose exec -T backend python -c "
from portfolio_app.services.blockchain_service import BlockchainService

service = BlockchainService()

# Test 1: Genesis block
genesis = service.blockchain.chain[0]
print(f'GENESIS_INDEX={genesis.index}')

# Test 2: Add transaction and mine
tx_id = service.blockchain.add_transaction({
    'event_type': 'test',
    'data': 'test_data'
})
print(f'TX_ADDED={bool(tx_id)}')

block = service.blockchain.mine_pending_transactions()
print(f'BLOCK_MINED={bool(block)}')

# Test 3: Verify chain
is_valid = service.blockchain.is_chain_valid()
print(f'CHAIN_VALID={is_valid}')

# Test 4: Get transaction
tx_data = service.blockchain.get_transaction_by_id(tx_id)
print(f'TX_FOUND={bool(tx_data)}')
" 2>&1)

if echo "$blockchain_test" | grep -q "GENESIS_INDEX=0"; then
    test_passed "Blockchain genesis block created"
else
    test_failed "Blockchain genesis block missing"
fi

if echo "$blockchain_test" | grep -q "TX_ADDED=True"; then
    test_passed "Blockchain accepts transactions"
else
    test_failed "Blockchain transaction failed"
fi

if echo "$blockchain_test" | grep -q "BLOCK_MINED=True"; then
    test_passed "Blockchain mining works (Proof of Work)"
else
    test_failed "Blockchain mining failed"
fi

if echo "$blockchain_test" | grep -q "CHAIN_VALID=True"; then
    test_passed "Blockchain validation works"
else
    test_failed "Blockchain validation failed"
fi

if echo "$blockchain_test" | grep -q "TX_FOUND=True"; then
    test_passed "Blockchain transaction retrieval works"
else
    test_failed "Blockchain transaction not found"
fi

echo ""

# ==============================================================================
# Test 7: API Endpoints (if token available)
# ==============================================================================

if [ -n "$TOKEN" ]; then
    echo "Test 7: API Endpoints"
    echo "---------------------"

    # Test GET /ai/agents
    agents_response=$(curl -s -X GET "$BASE_URL/ai/agents" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$agents_response" | grep -q "success"; then
        test_passed "GET /ai/agents endpoint working"
    else
        test_failed "GET /ai/agents endpoint failed"
    fi

    # Test GET /ai/dashboard/stats
    stats_response=$(curl -s -X GET "$BASE_URL/ai/dashboard/stats" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$stats_response" | grep -q "total_agents"; then
        test_passed "GET /ai/dashboard/stats endpoint working"
    else
        test_failed "GET /ai/dashboard/stats endpoint failed"
    fi

    echo ""
else
    test_info "Skipping API endpoint tests (no auth token)"
    echo ""
fi

# ==============================================================================
# Test 8: Frontend Build Check
# ==============================================================================

echo "Test 8: Frontend Files"
echo "----------------------"

if [ -f "/Users/ruizdev7/Documents/GitHub/ruizdev7-portfolio/frontend/src/RTK_Query_app/services/aiGovernance/aiGovernanceApi.js" ]; then
    test_passed "AI Governance API service exists"
else
    test_failed "AI Governance API service missing"
fi

if [ -f "/Users/ruizdev7/Documents/GitHub/ruizdev7-portfolio/frontend/src/pages/ai-governance/AIGovernanceDashboard.jsx" ]; then
    test_passed "AI Governance Dashboard component exists"
else
    test_failed "AI Governance Dashboard component missing"
fi

echo ""

# ==============================================================================
# Test Summary
# ==============================================================================

echo "======================================"
echo "TEST SUMMARY"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "✅ AI Governance Platform is ready for use!"
    echo ""
    echo "Next steps:"
    echo "1. Create your first AI agent: POST /api/v1/ai/agents"
    echo "2. Execute a task: POST /api/v1/ai/tasks"
    echo "3. View dashboard: http://localhost:5173/ai-governance"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review failed tests and fix issues before deployment."
    echo "Common fixes:"
    echo "1. Run migrations: docker-compose exec backend flask db upgrade"
    echo "2. Initialize roles: docker-compose exec backend flask init-roles"
    echo "3. Restart containers: docker-compose restart"
    exit 1
fi

