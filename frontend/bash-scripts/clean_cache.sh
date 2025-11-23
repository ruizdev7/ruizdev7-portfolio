#!/bin/bash

# Script para limpiar cache de Docker
# Uso: ./clean_cache.sh

set -e

DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-ruizdev7}"

echo "🧹 Limpiando cache de Docker..."

# Eliminar builder
BUILDER_NAME="portfolio-builder"
if docker buildx inspect $BUILDER_NAME >/dev/null 2>&1; then
  echo "==> Eliminando builder: $BUILDER_NAME"
  docker buildx rm $BUILDER_NAME
fi

# Eliminar imágenes de cache
echo "==> Eliminando imágenes de cache..."
docker rmi $DOCKERHUB_USERNAME/portfolio-cache:latest 2>/dev/null || true
docker rmi $DOCKERHUB_USERNAME/portfolio-backend:cache 2>/dev/null || true
docker rmi $DOCKERHUB_USERNAME/portfolio-frontend:cache 2>/dev/null || true

# Limpiar cache de buildx
echo "==> Limpiando cache de buildx..."
docker buildx prune -f

echo "✅ Cache limpiado exitosamente!"
