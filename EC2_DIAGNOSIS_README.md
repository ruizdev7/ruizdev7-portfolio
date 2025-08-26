# 🔍 Diagnóstico de Problemas 502 Bad Gateway en EC2

Este documento contiene scripts y guías para diagnosticar y resolver problemas de 502 Bad Gateway en tu servidor EC2.

## 📋 Scripts Disponibles

### 1. `diagnose_502.sh` - Diagnóstico Completo
```bash
./diagnose_502.sh
```
**Qué hace:**
- Verifica el estado de todos los contenedores
- Revisa logs del proxy manager, backend y frontend
- Prueba conectividad entre servicios
- Verifica configuración de red y puertos
- Comprueba certificados SSL
- Proporciona recomendaciones específicas

### 2. `check_proxy_config.sh` - Verificación del Proxy Manager
```bash
./check_proxy_config.sh
```
**Qué hace:**
- Verifica el estado del proxy manager
- Comprueba acceso a la interfaz de administración
- Revisa configuración de proxy hosts
- Verifica logs de nginx
- Prueba conectividad entre servicios

### 3. `setup_proxy_quick.sh` - Configuración Rápida
```bash
./setup_proxy_quick.sh
```
**Qué hace:**
- Proporciona instrucciones paso a paso para configurar el proxy manager
- Muestra la IP pública del servidor
- Da configuración específica para ruizdev7.com

## 🚨 Problema 502 Bad Gateway - Causas Comunes

### 1. Proxy Manager No Configurado
**Síntoma:** 502 Bad Gateway sin configuración de proxy host
**Solución:**
```bash
# Acceder a la interfaz de administración
http://TU_IP_EC2:81
# Usuario: admin@example.com
# Contraseña: changeme
```

### 2. Contenedores No Ejecutándose
**Síntoma:** Contenedores detenidos o con errores
**Solución:**
```bash
# Verificar estado
docker ps

# Reiniciar servicios
docker-compose restart

# Ver logs específicos
docker logs backend --tail 50
docker logs frontend --tail 50
docker logs proxy-manager --tail 50
```

### 3. Problemas de Red
**Síntoma:** Contenedores no pueden comunicarse entre sí
**Solución:**
```bash
# Verificar red Docker
docker network inspect local-docker-network

# Verificar conectividad
docker exec proxy-manager curl http://frontend:3000
docker exec proxy-manager curl http://backend:6000/api/v1/pumps
```

### 4. Problemas de DNS
**Síntoma:** Dominio no resuelve a la IP correcta
**Solución:**
```bash
# Verificar resolución DNS
nslookup ruizdev7.com

# Verificar IP del servidor
curl ifconfig.me
```

## 🔧 Pasos de Diagnóstico Rápido

### Paso 1: Verificación Básica
```bash
# 1. Verificar contenedores
docker ps

# 2. Verificar logs del proxy manager
docker logs proxy-manager --tail 20

# 3. Verificar conectividad interna
docker exec proxy-manager curl -I http://frontend:3000
```

### Paso 2: Configuración del Proxy Manager
```bash
# 1. Acceder a la interfaz
http://TU_IP_EC2:81

# 2. Configurar Proxy Host:
#    - Domain: ruizdev7.com
#    - Scheme: http
#    - Forward Host: frontend
#    - Forward Port: 3000
```

### Paso 3: Verificación SSL
```bash
# Verificar certificados
docker exec proxy-manager ls -la /etc/letsencrypt/live/

# Verificar configuración SSL
docker exec proxy-manager cat /data/nginx/proxy_host/1.conf
```

## 📊 Comandos de Monitoreo

### Logs en Tiempo Real
```bash
# Proxy Manager
docker logs proxy-manager -f

# Nginx logs
docker exec proxy-manager tail -f /var/log/nginx/error.log
docker exec proxy-manager tail -f /var/log/nginx/access.log

# Backend
docker logs backend -f

# Frontend
docker logs frontend -f
```

### Estado del Sistema
```bash
# Uso de recursos
docker stats

# Espacio en disco
df -h

# Memoria
free -h

# Puertos en uso
netstat -tlnp
```

## 🔒 Configuración de Seguridad EC2

### Grupos de Seguridad Requeridos
- **Puerto 80 (HTTP)**: Acceso público
- **Puerto 443 (HTTPS)**: Acceso público
- **Puerto 81 (Admin)**: Acceso público (o restringido a tu IP)
- **Puerto 22 (SSH)**: Solo tu IP

### Configuración de Firewall
```bash
# Verificar reglas de firewall
sudo ufw status

# Si es necesario, permitir puertos
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 81
```

## 🚀 Resolución Rápida

### Si el problema persiste después de la configuración:

1. **Reiniciar servicios:**
```bash
docker-compose restart
```

2. **Limpiar cache de nginx:**
```bash
docker exec proxy-manager nginx -s reload
```

3. **Verificar configuración:**
```bash
docker exec proxy-manager nginx -t
```

4. **Revisar logs específicos:**
```bash
docker exec proxy-manager tail -f /var/log/nginx/error.log
```

## 📞 Contacto y Soporte

Si los scripts no resuelven el problema:

1. Ejecuta `./diagnose_502.sh` y guarda la salida
2. Ejecuta `./check_proxy_config.sh` y guarda la salida
3. Comparte los logs con el equipo de soporte

## 📝 Notas Importantes

- **Backup:** Siempre haz backup de la configuración antes de cambios
- **Logs:** Los logs son tu mejor amigo para diagnosticar problemas
- **DNS:** Asegúrate de que el DNS esté configurado correctamente
- **SSL:** Los certificados Let's Encrypt se renuevan automáticamente
- **Monitoreo:** Configura alertas para detectar problemas proactivamente
