#!/bin/bash

# Interactive Test Script for AI Governance Platform
BASE_URL="http://localhost:5000/api/v1"

echo "🚀 AI GOVERNANCE PLATFORM - INTERACTIVE TEST"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Get credentials
echo -e "${BLUE}📝 Step 1: Login${NC}"
echo "Please enter your credentials:"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""

echo "Attempting login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login successful!${NC}"
    echo ""
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    echo ""
    echo "Please check your credentials and try again."
    exit 1
fi

# Step 2: Test Dashboard Stats
echo -e "${BLUE}📊 Step 2: Testing Dashboard Stats${NC}"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/ai/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q "total_agents"; then
    echo -e "${GREEN}✅ Dashboard stats working!${NC}"
    echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"
else
    echo -e "${RED}❌ Dashboard stats failed${NC}"
    echo "$STATS_RESPONSE"
fi
echo ""

# Step 3: Get Agents
echo -e "${BLUE}🤖 Step 3: Getting AI Agents${NC}"
AGENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/ai/agents" \
  -H "Authorization: Bearer $TOKEN")

if echo "$AGENTS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Get agents endpoint working!${NC}"
    AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('agents', [])))" 2>/dev/null || echo "0")
    echo "   Found $AGENT_COUNT agents"
    
    if [ "$AGENT_COUNT" -eq "0" ]; then
        echo -e "${YELLOW}⚠️  No agents found. Let's create one!${NC}"
        echo ""
        
        # Step 4: Create Agent
        echo -e "${BLUE}➕ Step 4: Creating Test Agent${NC}"
        CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/agents" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "Financial Analyzer",
            "agent_type": "financial",
            "description": "Test agent for financial analysis",
            "model_name": "gpt-4",
            "confidence_threshold": 0.75,
            "status": "active"
          }')
        
        if echo "$CREATE_RESPONSE" | grep -q "agent_id"; then
            AGENT_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['agent']['agent_id'])" 2>/dev/null)
            echo -e "${GREEN}✅ Agent created successfully!${NC}"
            echo "   Agent ID: $AGENT_ID"
            echo ""
            
            # Step 5: Execute Task
            echo -e "${BLUE}⚡ Step 5: Executing Test Task${NC}"
            TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/tasks" \
              -H "Authorization: Bearer $TOKEN" \
              -H "Content-Type: application/json" \
              -d "{
                \"agent_id\": \"$AGENT_ID\",
                \"task_type\": \"financial_analysis\",
                \"task_name\": \"Q4 Revenue Analysis\",
                \"input_data\": {
                  \"revenue\": 150000,
                  \"expenses\": 95000,
                  \"quarter\": \"Q4\",
                  \"year\": 2024
                }
              }")
            
            if echo "$TASK_RESPONSE" | grep -q "task_id"; then
                echo -e "${GREEN}✅ Task executed successfully!${NC}"
                echo "$TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TASK_RESPONSE"
            else
                echo -e "${RED}❌ Task execution failed${NC}"
                echo "$TASK_RESPONSE"
            fi
        else
            echo -e "${RED}❌ Failed to create agent${NC}"
            echo "$CREATE_RESPONSE"
        fi
    else
        echo "$AGENTS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
    fi
else
    echo -e "${RED}❌ Get agents failed${NC}"
    echo "$AGENTS_RESPONSE"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Testing completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:5173/ai-governance to see the dashboard"
echo "2. Create more agents and tasks via API"
echo "3. Test MPC with sensitive data (SSN, credit cards)"
echo "4. Test approval workflow"

