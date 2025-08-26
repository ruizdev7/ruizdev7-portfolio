#!/bin/bash

# Script de configuración rápida del proxy manager
# Uso: ./setup_proxy_quick.sh

echo "⚡ CONFIGURACIÓN RÁPIDA DEL PROXY MANAGER"
echo "========================================="
echo ""

# Verificar que el proxy manager esté ejecutándose
if ! docker ps | grep -q proxy-manager; then
    echo "❌ Proxy Manager no está ejecutándose"
    echo "Ejecutando: docker-compose up -d proxy-manager"
    docker-compose up -d proxy-manager
    sleep 10
fi

echo "✅ Proxy Manager está ejecutándose"
echo ""

# Obtener IP pública del servidor
echo "📋 OBTENIENDO INFORMACIÓN DEL SERVIDOR:"
echo "----------------------------------------"
PUBLIC_IP=$(curl -s ifconfig.me)
echo "IP Pública: $PUBLIC_IP"
echo ""

# Verificar si ya existe configuración
if docker exec proxy-manager test -f /data/nginx/proxy_host/1.conf; then
    echo "⚠️  Ya existe una configuración de proxy host"
    echo "¿Deseas sobrescribirla? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Configuración cancelada"
        exit 0
    fi
fi

echo "🔧 CONFIGURACIÓN REQUERIDA:"
echo "==========================="
echo ""
echo "Para configurar el proxy manager, sigue estos pasos:"
echo ""
echo "1. 🌐 Accede a la interfaz de administración:"
echo "   http://$PUBLIC_IP:81"
echo ""
echo "2. 🔑 Inicia sesión con las credenciales por defecto:"
echo "   Usuario: admin@example.com"
echo "   Contraseña: changeme"
echo ""
echo "3. 📝 Configura el Proxy Host:"
echo "   - Ve a 'Proxy Hosts' en el menú lateral"
echo "   - Haz clic en 'Add Proxy Host'"
echo "   - Completa los siguientes campos:"
echo ""
echo "   📋 CONFIGURACIÓN DEL PROXY HOST:"
echo "   ================================"
echo "   Domain Names: ruizdev7.com"
echo "   Scheme: http"
echo "   Forward Hostname/IP: frontend"
echo "   Forward Port: 3000"
echo "   Cache Assets: ✅ Habilitado"
echo "   Block Common Exploits: ✅ Habilitado"
echo "   Websockets Support: ✅ Habilitado"
echo ""
echo "4. 🔒 Configuración SSL (opcional pero recomendado):"
echo "   - En la misma página, ve a la pestaña 'SSL'"
echo "   - Selecciona 'Request a new SSL Certificate'"
echo "   - Marca 'Force SSL' y 'HTTP/2 Support'"
echo "   - Haz clic en 'Save'"
echo ""
echo "5. ✅ Guarda la configuración"
echo ""
echo "🔍 VERIFICACIÓN POSTERIOR:"
echo "=========================="
echo "Después de configurar, ejecuta:"
echo "./check_proxy_config.sh"
echo ""
echo "📋 COMANDOS ÚTILES:"
echo "==================="
echo "Ver logs del proxy manager:"
echo "docker logs proxy-manager --tail 50"
echo ""
echo "Ver logs de nginx:"
echo "docker exec proxy-manager tail -f /var/log/nginx/error.log"
echo ""
echo "Reiniciar proxy manager:"
echo "docker restart proxy-manager"
echo ""
echo "🎯 NOTAS IMPORTANTES:"
echo "===================="
echo "• Asegúrate de que el dominio ruizdev7.com apunte a $PUBLIC_IP"
echo "• Verifica que los grupos de seguridad de EC2 permitan tráfico en puertos 80, 443, 81"
echo "• Si usas SSL, el certificado se generará automáticamente con Let's Encrypt"
echo "• El proxy manager redirigirá el tráfico de ruizdev7.com hacia el contenedor frontend:3000"
