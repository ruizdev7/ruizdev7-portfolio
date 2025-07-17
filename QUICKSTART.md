# Quickstart - Ruizdev7 Portfolio

## Requisitos
- Docker y Docker Compose
- Acceso a Docker Hub
- Variables de entorno configuradas

## Pasos rápidos para producción

### 1. Configura las variables de entorno
- Backend: `backend/.env.production`
- Frontend: `frontend/.env.production`

### 2. Build y push de imágenes

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

### 3. Edita `docker-compose.yml` con los tags correctos

### 4. Despliega en el servidor
```sh
docker compose pull
docker compose up -d
```

### 5. Notas
- El backend debe poder conectarse a la base de datos (ver `DB_HOST`).
- El frontend debe tener `VITE_API_URL` apuntando a la API de producción. 