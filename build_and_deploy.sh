#!/bin/bash

# Script para build, push y despliegue de imágenes Docker versionadas
# Uso: ./build_and_deploy.sh <version>

set -e

if [ -z "$1" ]; then
  echo "Uso: $0 <version>"
  exit 1
fi

VERSION=$1
DOCKER_USER=ruizdev7

# Crear y usar un builder multi-arquitectura
echo "Configurando buildx para múltiples arquitecturas..."
docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder

# Build backend multi-arquitectura
cd backend

echo "Construyendo backend para múltiples arquitecturas..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $DOCKER_USER/portfolio-backend:$VERSION \
  -f Dockerfile \
  --push \
  .
cd ..

# Build frontend multi-arquitectura
cd frontend

echo "Construyendo frontend para múltiples arquitecturas..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $DOCKER_USER/portfolio-frontend:$VERSION \
  -f Dockerfile \
  --push \
  .
cd ..

echo "Imágenes multi-arquitectura subidas exitosamente:"
echo "  - $DOCKER_USER/portfolio-backend:$VERSION"
echo "  - $DOCKER_USER/portfolio-frontend:$VERSION"
echo ""
echo "Actualiza tu docker-compose.yml con la nueva versión: $VERSION"
echo "Luego en el servidor de producción ejecuta:"
echo "  docker-compose pull"
echo "  docker-compose up -d" 