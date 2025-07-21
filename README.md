# Ruizdev7 Portfolio testing actions
# Prueba actions number 2

## Despliegue en Producción (Docker)

### 1. Variables de entorno

- **Backend:**
  - Archivo: `backend/.env.production`
  - Ejemplo:
    ```
    DB_HOST=172.17.0.1
    DB_USER=ruizdba7
    DB_PASSWORD=tu_password
    DB_NAME=portfolio_app_prod
    ...
    ```
- **Frontend:**
  - Archivo: `frontend/.env.production`
  - Ejemplo:
    ```
    VITE_API_URL=https://api.ruizdev7.com/api/v1
    ```

### 2. Build y push de imágenes Docker

#### Backend
```sh
docker build -t ruizdev7/portfolio-backend:1.0.X ./backend
docker push ruizdev7/portfolio-backend:1.0.X
```

#### Frontend
```sh
cd frontend
npm install
npm run build
docker build -t ruizdev7/portfolio-frontend:1.0.X .
docker push ruizdev7/portfolio-frontend:1.0.X
```

### 3. Actualiza el tag en `docker-compose.yml`

```
services:
  backend:
    image: ruizdev7/portfolio-backend:1.0.X
  frontend:
    image: ruizdev7/portfolio-frontend:1.0.X
```

### 4. Despliegue en el servidor

```sh
docker compose pull
docker compose up -d
```

### 5. Notas importantes
- El backend debe tener permisos de conexión a la base de datos.
- El frontend debe tener correctamente seteada la variable `VITE_API_URL`.
- No uses `localhost` ni `host.docker.internal` en producción para conexiones entre contenedores o desde contenedor a host en Linux. 