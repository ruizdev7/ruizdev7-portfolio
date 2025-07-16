# QUICKSTART

## Desarrollo local

1. Copia `.env.example` a `backend/.env.development` y ajusta las variables.
2. Copia `.env.example` a `backend/.env.production` y ajusta las variables para producción.
3. Levanta los servicios de desarrollo con hot reload:
   ```sh
   docker-compose -f docker-compose.development.yml up --build
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## Build y despliegue en producción

1. Elige una versión para tus imágenes, por ejemplo: `1.0.1`.
2. Ejecuta el script de build y push:
   ```sh
   ./build_and_deploy.sh 1.0.1
   ```
3. Actualiza `docker-compose.yml` para usar las nuevas imágenes:
   ```yaml
   backend:
     image: ruizdev7/portfolio-backend:1.0.1
   frontend:
     image: ruizdev7/portfolio-frontend:1.0.1
   ```
4. En el servidor de producción:
   ```sh
   docker-compose pull
   docker-compose up -d
   ```

## Nginx Proxy Manager
- Se recomienda usarlo solo en producción para gestionar dominios y certificados SSL.
- Accede a la interfaz en el puerto 81.

## Notas
- Usa versiones explícitas para tus imágenes, no `latest`.
- El hot reload solo está disponible en desarrollo.
- Para más detalles, revisa el README principal. 