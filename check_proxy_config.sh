#!/bin/bash

# Script para verificar y configurar el proxy manager
# Uso: ./check_proxy_config.sh

echo "🔧 VERIFICACIÓN Y CONFIGURACIÓN DEL PROXY MANAGER"
echo "================================================="
echo ""

# Verificar si el proxy manager está ejecutándose
echo "📋 1. VERIFICANDO ESTADO DEL PROXY MANAGER:"
echo "-------------------------------------------"
if docker ps | grep -q proxy-manager; then
    echo "✅ Proxy Manager está ejecutándose"
    echo "Puertos expuestos:"
    docker port proxy-manager
else
    echo "❌ Proxy Manager no está ejecutándose"
    echo "Ejecutando: docker-compose up -d proxy-manager"
    docker-compose up -d proxy-manager
fi
echo ""

# Verificar acceso a la interfaz de administración
echo "📋 2. VERIFICANDO INTERFAZ DE ADMINISTRACIÓN:"
echo "---------------------------------------------"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:81)
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Interfaz de administración accesible en http://localhost:81"
    echo "Credenciales por defecto:"
    echo "  Usuario: admin@example.com"
    echo "  Contraseña: changeme"
else
    echo "❌ No se puede acceder a la interfaz de administración (Status: $ADMIN_STATUS)"
fi
echo ""

# Verificar configuración de proxy hosts
echo "📋 3. VERIFICANDO CONFIGURACIÓN DE PROXY HOSTS:"
echo "-----------------------------------------------"
if docker exec proxy-manager test -f /data/nginx/proxy_host/1.conf; then
    echo "✅ Configuración de proxy host encontrada"
    echo "Contenido de la configuración:"
    docker exec proxy-manager cat /data/nginx/proxy_host/1.conf
else
    echo "❌ No se encontró configuración de proxy host"
    echo ""
    echo "🔧 CONFIGURACIÓN MANUAL REQUERIDA:"
    echo "1. Acceder a http://TU_IP_EC2:81"
    echo "2. Iniciar sesión con admin@example.com / changeme"
    echo "3. Ir a 'Proxy Hosts' -> 'Add Proxy Host'"
    echo "4. Configurar:"
    echo "   - Domain Names: ruizdev7.com"
    echo "   - Scheme: http"
    echo "   - Forward Hostname/IP: frontend"
    echo "   - Forward Port: 3000"
    echo "   - Habilitar SSL si es necesario"
fi
echo ""

# Verificar logs de nginx
echo "📋 4. LOGS DE NGINX:"
echo "-------------------"
echo "Últimas 20 líneas del access.log:"
docker exec proxy-manager tail -20 /var/log/nginx/access.log 2>/dev/null || echo "No se puede acceder al access.log"
echo ""

echo "Últimas 20 líneas del error.log:"
docker exec proxy-manager tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No se puede acceder al error.log"
echo ""

# Verificar conectividad entre servicios
echo "📋 5. VERIFICANDO CONECTIVIDAD ENTRE SERVICIOS:"
echo "-----------------------------------------------"
echo "Desde proxy-manager hacia frontend:"
docker exec proxy-manager curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://frontend:3000 || echo "❌ No se puede conectar al frontend"
echo ""

echo "Desde proxy-manager hacia backend:"
docker exec proxy-manager curl -s -o /dev/null -w "Backend: %{http_code}\n" http://backend:6000/api/v1/pumps || echo "❌ No se puede conectar al backend"
echo ""

# Verificar configuración de red
echo "📋 6. CONFIGURACIÓN DE RED:"
echo "---------------------------"
echo "Contenedores en la red local-docker-network:"
docker network inspect local-docker-network --format "{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{\"\n\"}}{{end}}"
echo ""

# Verificar certificados SSL
echo "📋 7. CERTIFICADOS SSL:"
echo "----------------------"
if docker exec proxy-manager test -d /etc/letsencrypt/live/ruizdev7.com; then
    echo "✅ Certificado SSL encontrado para ruizdev7.com"
    echo "Fecha de expiración:"
    docker exec proxy-manager openssl x509 -in /etc/letsencrypt/live/ruizdev7.com/fullchain.pem -noout -dates
else
    echo "❌ No se encontró certificado SSL para ruizdev7.com"
    echo "💡 Considera habilitar SSL en la configuración del proxy host"
fi
echo ""

echo "🎯 RESUMEN:"
echo "==========="
echo "Si ves errores 502, probablemente necesites:"
echo "1. Configurar el proxy host en la interfaz de administración"
echo "2. Verificar que el dominio apunte a la IP correcta de EC2"
echo "3. Confirmar que los grupos de seguridad permitan tráfico en puertos 80, 443, 81"
echo "4. Verificar que los contenedores estén en la misma red"
echo ""
echo "Para configurar manualmente:"
echo "http://TU_IP_EC2:81 -> Proxy Hosts -> Add Proxy Host"
