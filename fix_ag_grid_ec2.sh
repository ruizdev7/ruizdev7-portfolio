#!/bin/bash

# Script para diagnosticar y resolver problemas de AG Grid en EC2
# Uso: ./fix_ag_grid_ec2.sh

echo "🔧 DIAGNÓSTICO Y REPARACIÓN DE AG GRID EN EC2"
echo "============================================="
echo ""

# 1. Verificar estado de contenedores
echo "📋 1. VERIFICANDO ESTADO DE CONTENEDORES:"
echo "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Verificar logs del frontend
echo "📋 2. LOGS DEL FRONTEND (últimas 30 líneas):"
echo "--------------------------------------------"
docker logs frontend --tail 30
echo ""

# 3. Verificar si el problema es de dependencias
echo "📋 3. VERIFICANDO DEPENDENCIAS EN EL CONTENEDOR:"
echo "-----------------------------------------------"
echo "Verificando si ag-grid está instalado:"
docker exec frontend npm list ag-grid-community ag-grid-react 2>/dev/null || echo "❌ No se puede verificar dependencias"
echo ""

# 4. Verificar el build de producción
echo "📋 4. VERIFICANDO BUILD DE PRODUCCIÓN:"
echo "-------------------------------------"
echo "Verificando archivos en /usr/share/nginx/html:"
docker exec frontend ls -la /usr/share/nginx/html/ 2>/dev/null || echo "❌ No se puede acceder al directorio"
echo ""

# 5. Verificar configuración de nginx
echo "📋 5. VERIFICANDO CONFIGURACIÓN DE NGINX:"
echo "----------------------------------------"
echo "Configuración de nginx:"
docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "❌ No se puede leer configuración de nginx"
echo ""

# 6. Verificar logs de nginx
echo "📋 6. LOGS DE NGINX:"
echo "-------------------"
echo "Error logs:"
docker exec frontend tail -10 /var/log/nginx/error.log 2>/dev/null || echo "❌ No se puede acceder a error.log"
echo ""

echo "Access logs:"
docker exec frontend tail -10 /var/log/nginx/access.log 2>/dev/null || echo "❌ No se puede acceder a access.log"
echo ""

# 7. Verificar si el problema es de cache
echo "📋 7. VERIFICANDO CACHE Y BUILD:"
echo "-------------------------------"
echo "Verificando si hay problemas de cache en el build..."
echo ""

# 8. Soluciones propuestas
echo "🔧 SOLUCIONES PROPUESTAS:"
echo "========================"
echo ""
echo "1. 🚀 REBUILD COMPLETO DEL FRONTEND:"
echo "   docker-compose down frontend"
echo "   docker-compose build --no-cache frontend"
echo "   docker-compose up -d frontend"
echo ""
echo "2. 🔄 REBUILD CON LIMPIEZA DE CACHE:"
echo "   docker system prune -f"
echo "   docker volume prune -f"
echo "   docker-compose build --no-cache frontend"
echo "   docker-compose up -d frontend"
echo ""
echo "3. 📦 VERIFICAR DEPENDENCIAS:"
echo "   docker exec frontend npm list ag-grid-community"
echo "   docker exec frontend npm list ag-grid-react"
echo ""
echo "4. 🔍 VERIFICAR CONFIGURACIÓN DE AG GRID:"
echo "   - Revisar que agGridConfig.js se esté importando correctamente"
echo "   - Verificar que ModuleRegistry.registerModules se ejecute antes del render"
echo "   - Comprobar que las versiones de ag-grid sean compatibles"
echo ""
echo "5. 🌐 VERIFICAR ACCESO AL FRONTEND:"
echo "   curl -I http://localhost:3000"
echo "   curl -I http://frontend:3000"
echo ""

# 9. Verificar configuración específica de AG Grid
echo "📋 8. VERIFICACIÓN ESPECÍFICA DE AG GRID:"
echo "----------------------------------------"
echo "Verificando si el archivo de configuración existe en el build:"
docker exec frontend find /usr/share/nginx/html -name "*.js" -exec grep -l "ag-grid" {} \; 2>/dev/null || echo "❌ No se encontraron archivos con ag-grid"
echo ""

# 10. Comandos de reparación automática
echo "🔧 COMANDOS DE REPARACIÓN AUTOMÁTICA:"
echo "===================================="
echo ""
echo "¿Deseas ejecutar la reparación automática? (y/N)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🚀 Ejecutando reparación automática..."
    echo ""
    
    echo "1. Deteniendo contenedor frontend..."
    docker-compose down frontend
    
    echo "2. Limpiando cache de Docker..."
    docker system prune -f
    
    echo "3. Rebuild sin cache..."
    docker-compose build --no-cache frontend
    
    echo "4. Iniciando frontend..."
    docker-compose up -d frontend
    
    echo "5. Esperando que el contenedor esté listo..."
    sleep 10
    
    echo "6. Verificando logs..."
    docker logs frontend --tail 20
    
    echo ""
    echo "✅ Reparación automática completada"
    echo "Verifica si el problema de AG Grid se resolvió"
else
    echo "❌ Reparación automática cancelada"
    echo "Ejecuta los comandos manualmente según las soluciones propuestas"
fi

echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "=================="
echo "1. Si el problema persiste, verifica la configuración del proxy manager"
echo "2. Revisa que el dominio apunte correctamente al frontend"
echo "3. Verifica que no haya problemas de CORS o configuración de red"
echo "4. Considera usar el modo de desarrollo temporalmente para debugging"
echo ""
echo "📞 Para debugging adicional:"
echo "- Revisa la consola del navegador en el servidor EC2"
echo "- Verifica los logs de nginx en tiempo real"
echo "- Comprueba que el build incluya todas las dependencias necesarias"
