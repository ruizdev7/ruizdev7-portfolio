#!/bin/bash

# Complete Test Flow - Step by Step
# Backend corre en puerto 8000 (desarrollo)
BACKEND_PORT="8000"
BASE_URL="http://localhost:${BACKEND_PORT}/api/v1"

echo "🧪 TEST COMPLETO - FLUJO PASO A PASO"
echo "====================================="
echo ""

# Step 1: Login
echo "1️⃣ LOGIN"
echo "--------"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Login failed (HTTP $HTTP_CODE)"
    echo ""
    echo "Posibles causas:"
    echo "  - Email o password incorrectos"
    echo "  - Usuario no existe"
    echo "  - Backend no está corriendo"
    exit 1
fi

if ! echo "$BODY" | grep -q "access_token"; then
    echo "❌ Login response no contiene access_token"
    echo "Response completo: $BODY"
    exit 1
fi

TOKEN=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
if [ -z "$TOKEN" ]; then
    TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo extraer el token de la respuesta"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:50}..."
echo ""

# Step 2: Check Permissions
echo "2️⃣ VERIFICAR PERMISOS"
echo "---------------------"
PERMS=$(curl -s -X GET "$BASE_URL/my-permissions" \
  -H "Authorization: Bearer $TOKEN")

echo "$PERMS" | python3 -m json.tool 2>/dev/null | grep -A 2 "ai_agents" || echo "No se encontraron permisos ai_agents"
echo ""

# Step 3: Create Agent
echo "3️⃣ CREAR AI AGENT"
echo "-----------------"
CREATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/ai/agents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Financial Analyzer",
    "agent_type": "financial",
    "description": "Test agent",
    "model_name": "gpt-4",
    "confidence_threshold": 0.75
  }')

HTTP_CODE=$(echo "$CREATE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$CREATE_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ¡AGENT CREADO EXITOSAMENTE!"
    AGENT_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('agent', {}).get('agent_id', ''))" 2>/dev/null)
    if [ -n "$AGENT_ID" ]; then
        echo "   Agent ID: $AGENT_ID"
    fi
else
    echo "❌ Error al crear agent"
    if [ "$HTTP_CODE" = "403" ]; then
        echo ""
        echo "🔧 Posibles soluciones:"
        echo "1. Verifica que tu usuario tenga rol 'admin'"
        echo "2. Ejecuta: docker compose exec backend flask init-roles"
        echo "3. Haz login de NUEVO (el token anterior puede ser viejo)"
    fi
fi

echo ""
echo "====================================="

