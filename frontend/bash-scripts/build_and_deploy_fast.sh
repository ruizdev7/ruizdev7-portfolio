#!/bin/bash

# Script rápido para desarrollo - solo AMD64
# Uso: ./build_and_deploy_fast.sh <commit_hash>
# Tiempo estimado: 8-12 minutos

set -e

if [ $# -ne 1 ]; then
  echo "Uso: $0 <commit_hash>"
  exit 1
fi

COMMIT_HASH=$1
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-ruizdev7}"

GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || true)

echo "⚡ Iniciando builds rápidos (solo AMD64)..."

# Backend rápido
BACKEND_TAGS="-t $DOCKERHUB_USERNAME/portfolio-backend:$COMMIT_HASH"
if [ -n "$GIT_TAG" ]; then
  BACKEND_TAGS="$BACKEND_TAGS -t $DOCKERHUB_USERNAME/portfolio-backend:$GIT_TAG"
fi

echo "==> Backend: Build rápido - $COMMIT_HASH"
docker buildx build \
  --platform linux/amd64 \
  --cache-from type=registry,ref=$DOCKERHUB_USERNAME/portfolio-backend:cache \
  --cache-to type=registry,ref=$DOCKERHUB_USERNAME/portfolio-backend:cache,mode=max \
  $BACKEND_TAGS \
  --push \
  --progress=plain \
  ./backend

# Frontend rápido
FRONTEND_TAGS="-t $DOCKERHUB_USERNAME/portfolio-frontend:$COMMIT_HASH"
if [ -n "$GIT_TAG" ]; then
  FRONTEND_TAGS="$FRONTEND_TAGS -t $DOCKERHUB_USERNAME/portfolio-frontend:$GIT_TAG"
fi

echo "==> Frontend: Build rápido - $COMMIT_HASH"
docker buildx build \
  --platform linux/amd64 \
  --cache-from type=registry,ref=$DOCKERHUB_USERNAME/portfolio-frontend:cache \
  --cache-to type=registry,ref=$DOCKERHUB_USERNAME/portfolio-frontend:cache,mode=max \
  $FRONTEND_TAGS \
  --push \
  --progress=plain \
  ./frontend

echo "✅ Builds rápidos completados!"
echo "📊 Tiempo estimado ahorrado: ~70%"
