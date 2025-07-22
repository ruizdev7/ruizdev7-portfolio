#!/bin/bash

# Script para build, push y despliegue de imágenes Docker versionadas multiplataforma
# Uso: ./build_and_deploy.sh <commit_hash>

set -e

if [ $# -ne 1 ]; then
  echo "Uso: $0 <commit_hash>"
  exit 1
fi

COMMIT_HASH=$1
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-ruizdev7}" # Usa variable de entorno si está definida

# Detectar tag de git (si existe)
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || true)

# Asegurarse de que buildx esté disponible
if ! docker buildx version >/dev/null 2>&1; then
  echo "Docker Buildx no está instalado o habilitado."
  exit 2
fi

# Backend
BACKEND_TAGS="-t $DOCKERHUB_USERNAME/portfolio-backend:$COMMIT_HASH"
if [ -n "$GIT_TAG" ]; then
  BACKEND_TAGS="$BACKEND_TAGS -t $DOCKERHUB_USERNAME/portfolio-backend:$GIT_TAG"
fi

echo "==> Backend: Buildx multiplataforma con tags $COMMIT_HASH${GIT_TAG:+ y $GIT_TAG}"
docker buildx build --platform linux/amd64,linux/arm64 $BACKEND_TAGS --push ./backend

# Frontend
FRONTEND_TAGS="-t $DOCKERHUB_USERNAME/portfolio-frontend:$COMMIT_HASH"
if [ -n "$GIT_TAG" ]; then
  FRONTEND_TAGS="$FRONTEND_TAGS -t $DOCKERHUB_USERNAME/portfolio-frontend:$GIT_TAG"
fi

echo "==> Frontend: Buildx multiplataforma con tags $COMMIT_HASH${GIT_TAG:+ y $GIT_TAG}"
docker buildx build --platform linux/amd64,linux/arm64 $FRONTEND_TAGS --push ./frontend 