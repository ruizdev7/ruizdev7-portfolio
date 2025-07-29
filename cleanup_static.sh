#!/bin/bash

echo "🧹 Script de Limpieza de Carpeta Static"
echo "========================================"

# Verificar si estamos en el directorio correcto
if [ ! -d "backend" ]; then
    echo "❌ Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

echo "📊 Estado actual de la carpeta static:"
echo "----------------------------------------"

# Contar directorios y archivos
TOTAL_DIRS=$(find backend/portfolio_app/static/pumps -type d | wc -l)
TOTAL_FILES=$(find backend/portfolio_app/static/pumps -type f | wc -l)
EMPTY_DIRS=$(find backend/portfolio_app/static/pumps -type d -empty | wc -l)

echo "📁 Total directorios: $TOTAL_DIRS"
echo "📄 Total archivos: $TOTAL_FILES"
echo "🗂️ Directorios vacíos: $EMPTY_DIRS"

if [ "$EMPTY_DIRS" -gt 0 ]; then
    echo ""
    echo "⚠️ Se encontraron $EMPTY_DIRS directorios vacíos"
    
    read -p "¿Deseas eliminarlos? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🗑️ Eliminando directorios vacíos..."
        
        # Eliminar directorios vacíos
        find backend/portfolio_app/static/pumps -type d -empty -delete
        
        echo "✅ Limpieza completada"
        
        # Mostrar estado final
        echo ""
        echo "📊 Estado final:"
        echo "----------------"
        FINAL_DIRS=$(find backend/portfolio_app/static/pumps -type d | wc -l)
        FINAL_FILES=$(find backend/portfolio_app/static/pumps -type f | wc -l)
        FINAL_EMPTY=$(find backend/portfolio_app/static/pumps -type d -empty | wc -l)
        
        echo "📁 Total directorios: $FINAL_DIRS"
        echo "📄 Total archivos: $FINAL_FILES"
        echo "🗂️ Directorios vacíos: $FINAL_EMPTY"
        
        DIRS_REMOVED=$((TOTAL_DIRS - FINAL_DIRS))
        echo "🎯 Directorios eliminados: $DIRS_REMOVED"
    else
        echo "❌ Operación cancelada"
    fi
else
    echo ""
    echo "✅ No se encontraron directorios vacíos para eliminar"
fi

echo ""
echo "🎉 Proceso completado!" 