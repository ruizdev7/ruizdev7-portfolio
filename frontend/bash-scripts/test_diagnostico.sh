#!/bin/bash

# Script de Diagnóstico - Identifica el problema exacto
# Backend corre en puerto 8000 (desarrollo) o 5000 (producción)
BACKEND_PORT="8000"
BASE_URL="http://localhost:${BACKEND_PORT}/api/v1"

echo "🔍 DIAGNÓSTICO COMPLETO"
echo "======================="
echo ""

# Test 1: Backend está corriendo?
echo "1️⃣ Verificando que el backend esté corriendo..."
# Verificar que el servidor responde (incluso con 404 está bien, significa que está vivo)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/api/v1/token" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "000" ] && [ "$HTTP_CODE" != "" ]; then
    echo "   ✅ Backend responde en puerto ${BACKEND_PORT} (HTTP $HTTP_CODE)"
else
    # Intentar puerto 5000 también
    HTTP_CODE_5000=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/v1/token" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE_5000" != "000" ] && [ "$HTTP_CODE_5000" != "" ]; then
        BACKEND_PORT="5000"
        BASE_URL="http://localhost:${BACKEND_PORT}/api/v1"
        echo "   ✅ Backend responde en puerto 5000 (HTTP $HTTP_CODE_5000)"
    else
        echo "   ❌ Backend NO responde en puertos 8000 ni 5000"
        echo "   Verifica: docker compose ps"
        echo "   Ejecuta: docker compose -f docker-compose.development.yml up -d"
        exit 1
    fi
fi
echo ""

# Test 2: Login
echo "2️⃣ Test de Login"
echo ""
echo "   Usuarios disponibles en la BD:"
docker compose exec -T mysql mysql -u root -proot -e "USE portfolio_app_dev; SELECT email FROM tbl_users;" 2>/dev/null | grep -v "^email" | grep -v "^$" | sed 's/^/     - /' || echo "     (No se pudieron listar)"
echo ""
echo "   Ingresa tus credenciales:"
read -p "   Email: " EMAIL
read -sp "   Password: " PASSWORD
echo ""
echo ""

LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/token" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_CODE/d')

echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Login exitoso"
    
    if echo "$BODY" | grep -q "access_token"; then
        TOKEN=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
        if [ -z "$TOKEN" ]; then
            TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        fi
        
        if [ -n "$TOKEN" ]; then
            echo "   ✅ Token extraído: ${TOKEN:0:30}..."
            echo ""
            
            # Test 3: Verificar permisos
            echo "3️⃣ Verificando permisos..."
            PERMS_RESPONSE=$(curl -s -X GET "$BASE_URL/my-permissions" \
              -H "Authorization: Bearer $TOKEN")
            
            if echo "$PERMS_RESPONSE" | grep -q "ai_agents_create"; then
                echo "   ✅ Tienes el permiso ai_agents_create"
            else
                echo "   ❌ NO tienes el permiso ai_agents_create"
                echo "   Response: $PERMS_RESPONSE" | head -10
                echo ""
                echo "   🔧 Solución:"
                echo "   docker compose exec backend flask init-roles"
                echo "   Luego haz login de nuevo"
                exit 1
            fi
            echo ""
            
            # Test 4: Crear agent
            echo "4️⃣ Intentando crear agent..."
            CREATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/ai/agents" \
              -H "Authorization: Bearer $TOKEN" \
              -H "Content-Type: application/json" \
              -d '{
                "name": "Test Financial Agent",
                "agent_type": "financial",
                "description": "Test agent",
                "model_name": "gpt-4",
                "confidence_threshold": 0.75
              }')
            
            CREATE_HTTP=$(echo "$CREATE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
            CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed '/HTTP_CODE/d')
            
            echo "   HTTP Status: $CREATE_HTTP"
            
            if [ "$CREATE_HTTP" = "201" ] || [ "$CREATE_HTTP" = "200" ]; then
                echo "   ✅ ¡AGENT CREADO EXITOSAMENTE!"
                echo "$CREATE_BODY" | python3 -m json.tool 2>/dev/null | head -20
            else
                echo "   ❌ Error al crear agent"
                echo "   Response:"
                echo "$CREATE_BODY" | python3 -m json.tool 2>/dev/null || echo "$CREATE_BODY"
                
                if [ "$CREATE_HTTP" = "403" ]; then
                    echo ""
                    echo "   🔍 El problema es 403 Forbidden"
                    echo "   Esto significa que el decorador está rechazando el permiso"
                    echo ""
                    echo "   Verifica los logs del backend:"
                    echo "   docker compose logs backend --tail 20"
                fi
            fi
        else
            echo "   ❌ No se pudo extraer el token"
            echo "   Response: $BODY"
        fi
    else
        echo "   ❌ La respuesta no contiene access_token"
        echo "   Response: $BODY"
    fi
else
    echo "   ❌ Login falló (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
    echo ""
    echo "   Posibles causas:"
    echo "   - Email o password incorrectos"
    echo "   - Usuario no existe en la base de datos"
    echo "   - Backend tiene un error"
fi

echo ""
echo "======================="

