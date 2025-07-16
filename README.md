# Portfolio - Documentación

## Flujo de desarrollo

- Usa `docker-compose.development.yml` para desarrollo local con hot reload.
- Usa `Dockerfile.dev` en backend y frontend para desarrollo.
- Usa `Dockerfile` en backend y frontend para producción.

## Checklist de despliegue

1. Realiza cambios en el código.
2. Elige una nueva versión (ej: 1.0.2).
3. Ejecuta:
   ```sh
   ./build_and_deploy.sh 1.0.2
   ```
4. Actualiza `docker-compose.yml` con la nueva versión.
5. En el servidor de producción:
   ```sh
   docker-compose pull
   docker-compose up -d
   ```
6. Verifica que los servicios funcionen correctamente.

## Script de build y despliegue
- Usa `build_and_deploy.sh <version>` para automatizar el proceso de build y push de imágenes Docker versionadas.

## Nginx Proxy Manager
- Se recomienda su uso en producción para gestionar dominios y certificados SSL.

## Notas
- No uses la etiqueta `latest` para producción.
- El hot reload solo está disponible en desarrollo.
- Para desarrollo, accede a:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:8000 