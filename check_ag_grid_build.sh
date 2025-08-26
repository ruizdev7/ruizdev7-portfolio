#!/bin/bash

# Script para verificar el build de AG Grid
# Uso: ./check_ag_grid_build.sh

echo "🔍 VERIFICACIÓN DEL BUILD DE AG GRID"
echo "===================================="
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ No se encontró frontend/package.json"
    echo "Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

echo "📋 1. VERIFICANDO DEPENDENCIAS EN PACKAGE.JSON:"
echo "----------------------------------------------"
cd frontend
echo "Versiones de AG Grid en package.json:"
grep -A 2 -B 2 "ag-grid" package.json
echo ""

echo "📋 2. VERIFICANDO CONFIGURACIÓN DE AG GRID:"
echo "-------------------------------------------"
if [ -f "src/config/agGridConfig.js" ]; then
    echo "✅ Archivo de configuración AG Grid encontrado"
    echo "Contenido del archivo:"
    cat src/config/agGridConfig.js
else
    echo "❌ Archivo de configuración AG Grid no encontrado"
fi
echo ""

echo "📋 3. VERIFICANDO IMPORTACIÓN EN MAIN.JSX:"
echo "------------------------------------------"
if grep -q "agGridConfig" src/main.jsx; then
    echo "✅ Importación de AG Grid config encontrada en main.jsx"
else
    echo "❌ Importación de AG Grid config no encontrada en main.jsx"
fi
echo ""

echo "📋 4. VERIFICANDO BUILD LOCAL:"
echo "-----------------------------"
echo "Instalando dependencias..."
npm install

echo "Ejecutando build..."
npm run build

echo "Verificando archivos generados..."
if [ -d "dist" ]; then
    echo "✅ Directorio dist creado"
    echo "Archivos en dist/assets/:"
    ls -la dist/assets/
    
    echo ""
    echo "Buscando referencias a AG Grid en archivos JS:"
    find dist/assets -name "*.js" -exec grep -l "ag-grid" {} \;
    
    echo ""
    echo "Verificando si ModuleRegistry está presente:"
    find dist/assets -name "*.js" -exec grep -l "ModuleRegistry" {} \;
else
    echo "❌ Directorio dist no encontrado"
fi

echo ""
echo "📋 5. VERIFICANDO CONFIGURACIÓN DE VITE:"
echo "---------------------------------------"
if [ -f "vite.config.js" ]; then
    echo "✅ Vite config encontrado"
    echo "Contenido:"
    cat vite.config.js
else
    echo "❌ Vite config no encontrado"
fi

echo ""
echo "🎯 RESUMEN:"
echo "==========="
echo "Si el build local funciona pero falla en EC2:"
echo "1. El problema puede ser de cache en Docker"
echo "2. Puede haber diferencias en las versiones de Node.js"
echo "3. El problema puede estar en la configuración de nginx"
echo ""
echo "🔧 SOLUCIONES:"
echo "============="
echo "1. Rebuild sin cache: docker-compose build --no-cache frontend"
echo "2. Verificar logs: docker logs frontend"
echo "3. Verificar configuración de nginx en el contenedor"
echo "4. Comprobar que el proxy manager esté configurado correctamente"

cd ..
