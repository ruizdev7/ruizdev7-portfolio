# Fix para 404 en rutas de React Router en Producción (Nginx Proxy Manager)

## Problema
Cuando se accede directamente a rutas como `https://ruizdev7.com/projects/pump-crud` en producción, se recibe un error 404 Not Found.

## Causa del Problema
El frontend es una SPA (Single Page Application) que usa React Router para el client-side routing. En desarrollo, el servidor de desarrollo de Vite maneja automáticamente todas las rutas redirigiendo al `index.html`. Sin embargo, en producción, Nginx busca archivos físicos en las rutas especificadas.

Cuando accedes a `/projects/pump-crud`, Nginx busca un archivo físico en esa ruta, pero como es una SPA, todas las rutas deben ser manejadas por el archivo `index.html`.

## Solución para Nginx Proxy Manager

### Configuración en Nginx Proxy Manager

1. **Acceder a Nginx Proxy Manager:**
   - URL: `http://tu-servidor:81`
   - Login con tus credenciales

2. **Configurar Proxy Host para el Frontend:**

   **Configuración Básica:**
   - **Domain Names:** `ruizdev7.com` (o tu dominio)
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `frontend` (nombre del contenedor)
   - **Forward Port:** `80`
   - **Block Common Exploits:** ✅ Activado
   - **Websocket Support:** ✅ Activado

   **Configuración Avanzada (CRÍTICA):**
   En la sección "Advanced" del Proxy Host, agrega esta configuración:

   ```nginx
   # Configuración para SPA (React Router)
   location / {
       try_files $uri $uri/ /index.html;
   }

   # Configuración para archivos estáticos
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }

   # Configuración para API calls (si necesitas proxy al backend)
   location /api/ {
       proxy_pass http://backend:6000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

3. **Guardar la configuración y reiniciar el Proxy Host**

## Verificación
Después de aplicar la configuración en Nginx Proxy Manager, las siguientes rutas deberían funcionar correctamente:
- `https://ruizdev7.com/projects/pump-crud`
- `https://ruizdev7.com/projects/pump-details/123`
- `https://ruizdev7.com/auth/login`
- `https://ruizdev7.com/home-blog`

## Notas Importantes
- Esta solución es específica para Nginx Proxy Manager
- La configuración avanzada es **CRÍTICA** para que funcione el client-side routing
- No se necesitan cambios en el Dockerfile del frontend
- Los archivos estáticos (JS, CSS, imágenes) se sirven directamente sin pasar por React Router

## Troubleshooting
Si después de aplicar la configuración sigue dando 404:
1. Verifica que la configuración avanzada se haya guardado correctamente
2. Reinicia el Proxy Host desde la interfaz
3. Limpia el cache del navegador
4. Verifica los logs del contenedor `proxy-manager` 