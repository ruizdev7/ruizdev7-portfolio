#!/bin/bash

# Complete Test Script - Create AI Agent
BASE_URL="http://localhost:5000/api/v1"

echo "🧪 TEST COMPLETO - CREAR AI AGENT"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get credentials
echo -e "${BLUE}📝 Paso 1: Login${NC}"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""

echo "Haciendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['access_token'])" 2>/dev/null)
    if [ -z "$TOKEN" ]; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    fi
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "   Token: ${TOKEN:0:30}..."
else
    echo -e "${RED}❌ Login falló${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Paso 2: Verificar Permisos${NC}"
PERMS_RESPONSE=$(curl -s -X GET "$BASE_URL/my-permissions" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PERMS_RESPONSE" | grep -q "ai_agents_create"; then
    echo -e "${GREEN}✅ Tienes el permiso ai_agents_create${NC}"
else
    echo -e "${YELLOW}⚠️  No aparece ai_agents_create en permisos${NC}"
    echo "   Response: $PERMS_RESPONSE" | head -20
    echo ""
    echo -e "${YELLOW}Intentando crear agente de todas formas...${NC}"
fi

echo ""
echo -e "${BLUE}🤖 Paso 3: Crear AI Agent${NC}"
CREATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/ai/agents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Financial Agent",
    "agent_type": "financial",
    "description": "Agent created via test script",
    "model_name": "gpt-4",
    "confidence_threshold": 0.75,
    "status": "active"
  }')

HTTP_CODE=$(echo "$CREATE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$CREATE_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Agent creado exitosamente!${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    
    AGENT_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('agent', {}).get('agent_id', ''))" 2>/dev/null)
    if [ -z "$AGENT_ID" ]; then
        AGENT_ID=$(echo "$BODY" | grep -o '"agent_id":"[^"]*' | cut -d'"' -f4 | head -1)
    fi
    
    if [ -n "$AGENT_ID" ]; then
        echo ""
        echo -e "${BLUE}⚡ Paso 4: Ejecutar Tarea de Prueba${NC}"
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
            echo -e "${GREEN}✅ Tarea ejecutada exitosamente!${NC}"
            echo "$TASK_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
        else
            echo -e "${RED}❌ Error al ejecutar tarea${NC}"
            echo "$TASK_RESPONSE"
        fi
    fi
else
    echo -e "${RED}❌ Error al crear agent${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "403" ]; then
        echo ""
        echo -e "${YELLOW}🔧 Solución sugerida:${NC}"
        echo "1. Verifica que tu usuario tenga rol 'admin'"
        echo "2. Ejecuta: docker compose exec backend flask init-roles"
        echo "3. Haz login de NUEVO para obtener token actualizado"
    fi
fi

echo ""
echo "=================================="
echo "Test completado"

