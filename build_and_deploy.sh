#!/bin/bash

# Script para build, push y despliegue de imágenes Docker versionadas
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

echo "==> Backend: Build con tag $COMMIT_HASH"
docker build -t $DOCKERHUB_USERNAME/portfolio-backend:$COMMIT_HASH ./backend

if [ -n "$GIT_TAG" ]; then
  echo "==> Backend: Etiquetando también como $GIT_TAG"
  docker tag $DOCKERHUB_USERNAME/portfolio-backend:$COMMIT_HASH $DOCKERHUB_USERNAME/portfolio-backend:$GIT_TAG
fi

echo "==> Backend: Push $COMMIT_HASH"
docker push $DOCKERHUB_USERNAME/portfolio-backend:$COMMIT_HASH
if [ -n "$GIT_TAG" ]; then
  echo "==> Backend: Push $GIT_TAG"
  docker push $DOCKERHUB_USERNAME/portfolio-backend:$GIT_TAG
fi

echo "==> Frontend: Build con tag $COMMIT_HASH"
docker build -t $DOCKERHUB_USERNAME/portfolio-frontend:$COMMIT_HASH ./frontend

if [ -n "$GIT_TAG" ]; then
  echo "==> Frontend: Etiquetando también como $GIT_TAG"
  docker tag $DOCKERHUB_USERNAME/portfolio-frontend:$COMMIT_HASH $DOCKERHUB_USERNAME/portfolio-frontend:$GIT_TAG
fi

echo "==> Frontend: Push $COMMIT_HASH"
docker push $DOCKERHUB_USERNAME/portfolio-frontend:$COMMIT_HASH
if [ -n "$GIT_TAG" ]; then
  echo "==> Frontend: Push $GIT_TAG"
  docker push $DOCKERHUB_USERNAME/portfolio-frontend:$GIT_TAG
fi 