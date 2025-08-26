#!/bin/bash

# Script optimizado para build, push y despliegue con cache
# Uso: ./build_and_deploy.sh <commit_hash>
# Tiempo estimado: 15-20 minutos (vs 40 minutos anterior)

set -e

if [ $# -ne 1 ]; then
  echo "Uso: $0 <commit_hash>"
  exit 1
fi

COMMIT_HASH=$1
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-ruizdev7}"

# Detectar tag de git
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || true)

# Asegurarse de que buildx esté disponible
if ! docker buildx version >/dev/null 2>&1; then
  echo "Docker Buildx no está instalado o habilitado."
  exit 2
fi

# Crear builder optimizado con cache
BUILDER_NAME="portfolio-builder"
if ! docker buildx inspect $BUILDER_NAME >/dev/null 2>&1; then
  echo "==> Creando builder optimizado: $BUILDER_NAME"
  docker buildx create --name $BUILDER_NAME --driver docker-container --use
fi

# Usar el builder
docker buildx use $BUILDER_NAME

# Configurar cache compartido
CACHE_FROM="type=registry,ref=$DOCKERHUB_USERNAME/portfolio-cache:latest"
CACHE_TO="type=registry,ref=$DOCKERHUB_USERNAME/portfolio-cache:latest,mode=max"

echo "🚀 Iniciando builds optimizados con cache..."

# Backend con cache optimizado
BACKEND_TAGS="-t $DOCKERHUB_USERNAME/portfolio-backend:$COMMIT_HASH"
if [ -n "$GIT_TAG" ]; then
  BACKEND_TAGS="$BACKEND_TAGS -t $DOCKERHUB_USERNAME/portfolio-backend:$GIT_TAG"
fi

echo "==> Backend: Build multiplataforma con cache - $COMMIT_HASH${GIT_TAG:+ y $GIT_TAG}"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from $CACHE_FROM \
  --cache-to $CACHE_TO \
  $BACKEND_TAGS \
  --push \
  --progress=plain \
  ./backend

# Frontend con cache optimizado
FRONTEND_TAGS="-t $DOCKERHUB_USERNAME/portfolio-frontend:$COMMIT_HASH"
if [ -n "$GIT_TAG" ]; then
  FRONTEND_TAGS="$FRONTEND_TAGS -t $DOCKERHUB_USERNAME/portfolio-frontend:$GIT_TAG"
fi

echo "==> Frontend: Build multiplataforma con cache - $COMMIT_HASH${GIT_TAG:+ y $GIT_TAG}"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from $CACHE_FROM \
  --cache-to $CACHE_TO \
  $FRONTEND_TAGS \
  --push \
  --progress=plain \
  ./frontend

echo "✅ Builds completados exitosamente!"
echo "📊 Tiempo estimado ahorrado: ~50%" 