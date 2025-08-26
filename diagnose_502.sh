#!/bin/bash

# Script de diagnóstico para problemas 502 Bad Gateway en EC2
# Uso: ./diagnose_502.sh

echo "🔍 DIAGNÓSTICO 502 BAD GATEWAY - SERVIDOR EC2"
echo "=============================================="
echo ""

# 1. Verificar estado de contenedores
echo "📋 1. ESTADO DE CONTENEDORES:"
echo "-----------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Verificar logs del proxy manager
echo "📋 2. LOGS DEL PROXY MANAGER (últimas 20 líneas):"
echo "------------------------------------------------"
docker logs proxy-manager --tail 20
echo ""

# 3. Verificar logs del backend
echo "📋 3. LOGS DEL BACKEND (últimas 20 líneas):"
echo "-------------------------------------------"
docker logs backend --tail 20
echo ""

# 4. Verificar logs del frontend
echo "📋 4. LOGS DEL FRONTEND (últimas 20 líneas):"
echo "--------------------------------------------"
docker logs frontend --tail 20
echo ""

# 5. Verificar conectividad interna
echo "📋 5. PRUEBAS DE CONECTIVIDAD INTERNA:"
echo "-------------------------------------"
echo "Backend (puerto 6000):"
curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" http://backend:6000/api/v1/pumps || echo "❌ Backend no responde"
echo ""

echo "Frontend (puerto 3000):"
curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" http://frontend:3000 || echo "❌ Frontend no responde"
echo ""

# 6. Verificar configuración de red
echo "📋 6. CONFIGURACIÓN DE RED:"
echo "---------------------------"
echo "Redes Docker:"
docker network ls
echo ""

echo "Red local-docker-network:"
docker network inspect local-docker-network --format "{{range .Containers}}{{.Name}} ({{.IPv4Address}}){{end}}"
echo ""

# 7. Verificar puertos expuestos
echo "📋 7. PUERTOS EXPUESTOS:"
echo "-----------------------"
netstat -tlnp | grep -E ':(80|81|443|6000|3000)' || echo "No se encontraron puertos relevantes"
echo ""

# 8. Verificar configuración del proxy manager
echo "📋 8. CONFIGURACIÓN DEL PROXY MANAGER:"
echo "-------------------------------------"
echo "Verificando acceso a la interfaz de administración..."
curl -s -o /dev/null -w "Admin Interface (puerto 81): %{http_code}\n" http://localhost:81 || echo "❌ No se puede acceder a la interfaz de administración"
echo ""

# 9. Verificar certificados SSL
echo "📋 9. CERTIFICADOS SSL:"
echo "----------------------"
if [ -d "/var/lib/docker/volumes/proxy-letsencrypt/_data" ]; then
    echo "Certificados encontrados:"
    ls -la /var/lib/docker/volumes/proxy-letsencrypt/_data/
else
    echo "❌ No se encontraron certificados SSL"
fi
echo ""

# 10. Verificar configuración de dominio
echo "📋 10. CONFIGURACIÓN DE DOMINIO:"
echo "-------------------------------"
echo "Resolución DNS para ruizdev7.com:"
nslookup ruizdev7.com || echo "❌ Error en resolución DNS"
echo ""

echo "IP del servidor:"
curl -s ifconfig.me || echo "❌ No se puede obtener IP pública"
echo ""

# 11. Verificar logs de nginx del proxy manager
echo "📋 11. LOGS DE NGINX (PROXY MANAGER):"
echo "------------------------------------"
if docker exec proxy-manager test -f /var/log/nginx/error.log; then
    echo "Últimas 10 líneas del error.log:"
    docker exec proxy-manager tail -10 /var/log/nginx/error.log
else
    echo "❌ No se encontró el archivo de error.log"
fi
echo ""

# 12. Resumen y recomendaciones
echo "📋 12. RESUMEN Y RECOMENDACIONES:"
echo "--------------------------------"
echo "✅ Verificaciones completadas"
echo ""
echo "🔧 POSIBLES SOLUCIONES:"
echo "1. Si el proxy manager no está configurado:"
echo "   - Acceder a http://TU_IP:81"
echo "   - Usuario: admin@example.com"
echo "   - Contraseña: changeme"
echo "   - Configurar Proxy Host para ruizdev7.com -> frontend:3000"
echo ""
echo "2. Si el backend no responde:"
echo "   - Verificar variables de entorno"
echo "   - Revisar conexión a base de datos"
echo ""
echo "3. Si el frontend no responde:"
echo "   - Verificar build del contenedor"
echo "   - Revisar configuración de nginx"
echo ""
echo "4. Si hay problemas de red:"
echo "   - Verificar grupos de seguridad de EC2"
echo "   - Confirmar que los puertos 80, 443, 81 están abiertos"
echo ""

echo "🎯 PRÓXIMOS PASOS:"
echo "1. Revisar la configuración en el proxy manager"
echo "2. Verificar que el dominio apunte a la IP correcta"
echo "3. Confirmar que los certificados SSL estén válidos"
echo "4. Revisar logs específicos según los errores encontrados"
