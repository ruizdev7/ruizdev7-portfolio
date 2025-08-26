# 🔧 Solución para Problemas de AG Grid en EC2

Este documento contiene la solución específica para el error de AG Grid que solo ocurre en el servidor EC2.

## 🚨 Problema

```
AG Grid: error #272 No AG Grid modules are registered! 
It is recommended to start with all Community features via the AllCommunityModule:
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([ AllCommunityModule ]);
```

## 🔍 Diagnóstico

### Síntomas
- ✅ AG Grid funciona correctamente en desarrollo local
- ❌ AG Grid falla en el servidor EC2 con error #272
- ❌ Los módulos de AG Grid no se registran correctamente

### Causas Probables
1. **Cache de Docker**: El build usa cache que no incluye la configuración actualizada
2. **Diferencias de Build**: El build de producción vs desarrollo
3. **Configuración de Nginx**: Problemas en el servido de archivos estáticos
4. **Versiones Incompatibles**: Diferentes versiones entre ag-grid-community y ag-grid-react

## 🛠️ Solución Paso a Paso

### Paso 1: Verificar Configuración Local
```bash
# Ejecutar verificación local
./check_ag_grid_build.sh
```

### Paso 2: Rebuild Completo en EC2
```bash
# Detener contenedor frontend
docker-compose down frontend

# Limpiar cache de Docker
docker system prune -f
docker volume prune -f

# Rebuild sin cache
docker-compose build --no-cache frontend

# Iniciar contenedor
docker-compose up -d frontend
```

### Paso 3: Verificar Logs
```bash
# Ver logs del frontend
docker logs frontend --tail 50

# Verificar que AG Grid se incluya en el build
docker exec frontend find /usr/share/nginx/html -name "*.js" -exec grep -l "ag-grid" {} \;
```

### Paso 4: Verificar Configuración de Nginx
```bash
# Verificar configuración de nginx
docker exec frontend cat /etc/nginx/conf.d/default.conf

# Verificar logs de nginx
docker exec frontend tail -f /var/log/nginx/error.log
```

## 🔧 Scripts de Reparación

### Script Automático Completo
```bash
./fix_ag_grid_ec2.sh
```

### Verificación Rápida
```bash
# Verificar estado de contenedores
docker ps

# Verificar logs específicos
docker logs frontend --tail 20

# Verificar dependencias
docker exec frontend npm list ag-grid-community ag-grid-react
```

## 📋 Configuración Implementada

### 1. Configuración Global de AG Grid
```javascript
// frontend/src/config/agGridConfig.js
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register all Community features globally
ModuleRegistry.registerModules([AllCommunityModule]);
```

### 2. Importación en Main.jsx
```javascript
// frontend/src/main.jsx
import "./config/agGridConfig.js";
```

### 3. Versiones Compatibles
```json
{
  "ag-grid-community": "^34.1.2",
  "ag-grid-react": "^34.1.2"
}
```

### 4. Dockerfile Mejorado
```dockerfile
# Verificación de AG Grid en el build
RUN npm run build && \
    echo "🔍 Verificando configuración de AG Grid..." && \
    if grep -q "ag-grid" dist/assets/*.js; then \
        echo "✅ AG Grid encontrado en el build"; \
    else \
        echo "❌ AG Grid no encontrado en el build"; \
        exit 1; \
    fi
```

## 🚀 Comandos de Despliegue

### Despliegue con Verificación
```bash
# 1. Build y push con verificación
./build_and_deploy.sh <commit_hash>

# 2. En EC2, rebuild sin cache
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Verificar logs
docker logs frontend --tail 30
```

### Verificación Post-Despliegue
```bash
# Verificar que AG Grid esté funcionando
curl -I http://ruizdev7.com

# Verificar logs en tiempo real
docker logs frontend -f

# Verificar configuración del proxy manager
./check_proxy_config.sh
```

## 🔍 Debugging Adicional

### Si el Problema Persiste

1. **Verificar Console del Navegador**
   - Abrir DevTools en el navegador
   - Revisar errores en la consola
   - Verificar que los archivos JS se carguen correctamente

2. **Verificar Network Tab**
   - Comprobar que todos los archivos se descarguen
   - Verificar que no haya errores 404 o 500

3. **Verificar Build Assets**
   ```bash
   # Verificar archivos generados
   docker exec frontend ls -la /usr/share/nginx/html/assets/
   
   # Buscar referencias a AG Grid
   docker exec frontend grep -r "ag-grid" /usr/share/nginx/html/
   ```

4. **Verificar Configuración de Vite**
   ```bash
   # Verificar configuración de build
   cat frontend/vite.config.js
   ```

## 📞 Contacto

Si el problema persiste después de aplicar todas las soluciones:

1. Ejecuta `./fix_ag_grid_ec2.sh` y guarda la salida completa
2. Ejecuta `./check_ag_grid_build.sh` y guarda la salida
3. Comparte los logs con el equipo de soporte

## 📝 Notas Importantes

- **Cache**: Siempre usa `--no-cache` cuando hagas rebuild en EC2
- **Versiones**: Mantén las versiones de ag-grid-community y ag-grid-react sincronizadas
- **Configuración**: La configuración global debe importarse antes del render de React
- **Nginx**: Verifica que nginx sirva correctamente los archivos estáticos
- **Proxy Manager**: Asegúrate de que el proxy manager esté configurado correctamente
