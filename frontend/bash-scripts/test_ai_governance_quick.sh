#!/bin/bash

# Quick Test Script for AI Governance Platform
BASE_URL="http://localhost:5000/api/v1"

echo "🧪 AI GOVERNANCE PLATFORM - QUICK TEST"
echo "========================================"
echo ""

# Step 1: Login
echo "1️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "✅ Login successful"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    echo ""
    echo "⚠️  Please check your credentials or create an admin user first"
    exit 1
fi

echo ""

# Step 2: Get Dashboard Stats
echo "2️⃣ Testing Dashboard Stats..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/ai/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q "total_agents"; then
    echo "✅ Dashboard stats endpoint working"
    echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15
else
    echo "❌ Dashboard stats failed"
    echo "   Response: $STATS_RESPONSE"
fi

echo ""

# Step 3: Get Agents
echo "3️⃣ Testing Get Agents..."
AGENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/ai/agents" \
  -H "Authorization: Bearer $TOKEN")

if echo "$AGENTS_RESPONSE" | grep -q "success"; then
    echo "✅ Get agents endpoint working"
    AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | grep -o '"agents":\[.*\]' | grep -o 'agent_id' | wc -l | tr -d ' ')
    echo "   Found $AGENT_COUNT agents"
else
    echo "❌ Get agents failed"
    echo "   Response: $AGENTS_RESPONSE"
fi

echo ""

# Step 4: Create Agent (if we have permission)
echo "4️⃣ Testing Create Agent..."
CREATE_AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/agents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Financial Agent",
    "agent_type": "financial",
    "description": "Test agent for quick testing",
    "model_name": "gpt-4",
    "confidence_threshold": 0.75
  }')

if echo "$CREATE_AGENT_RESPONSE" | grep -q "agent_id"; then
    AGENT_ID=$(echo "$CREATE_AGENT_RESPONSE" | grep -o '"agent_id":"[^"]*' | cut -d'"' -f4)
    echo "✅ Agent created successfully"
    echo "   Agent ID: $AGENT_ID"
    
    # Step 5: Execute Task
    echo ""
    echo "5️⃣ Testing Execute Task..."
    TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/tasks" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"agent_id\": \"$AGENT_ID\",
        \"task_type\": \"financial_analysis\",
        \"task_name\": \"Test Q4 Analysis\",
        \"input_data\": {
          \"revenue\": 150000,
          \"expenses\": 95000
        }
      }")
    
    if echo "$TASK_RESPONSE" | grep -q "task_id"; then
        echo "✅ Task executed successfully"
        echo "$TASK_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
    else
        echo "❌ Task execution failed"
        echo "   Response: $TASK_RESPONSE"
    fi
else
    echo "⚠️  Could not create agent (may need permissions)"
    echo "   Response: $CREATE_AGENT_RESPONSE"
fi

echo ""
echo "========================================"
echo "✅ Quick test completed!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:5173/ai-governance"
echo "2. Check dashboard stats"
echo "3. Create more agents via API or UI"

