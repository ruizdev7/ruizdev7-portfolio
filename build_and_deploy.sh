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

# Build backend
cd backend

echo "Construyendo backend..."
docker build -f Dockerfile -t $DOCKER_USER/portfolio-backend:$VERSION .
docker push $DOCKER_USER/portfolio-backend:$VERSION
cd ..

# Build frontend
cd frontend

echo "Construyendo frontend..."
docker build -f Dockerfile -t $DOCKER_USER/portfolio-frontend:$VERSION .
docker push $DOCKER_USER/portfolio-frontend:$VERSION
cd ..

echo "Actualiza tu docker-compose.yml con la nueva versión: $VERSION"
echo "Luego en el servidor de producción ejecuta:"
echo "  docker-compose pull"
echo "  docker-compose up -d" 