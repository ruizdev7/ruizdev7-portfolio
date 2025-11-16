# 🚀 Guía de Despliegue - Portfolio

## 📋 Descripción General

Este proyecto utiliza **CI/CD automatizado** con GitHub Actions para construir imágenes Docker y desplegarlas en una instancia EC2 de AWS.

## 🏗️ Arquitectura de Despliegue

```
Push a main → Build Images → Push to DockerHub → Deploy to EC2
```

### Componentes:
- **Backend**: Flask + Gunicorn (Puerto 6000)
- **Frontend**: React + Vite + Nginx (Puerto 80)
- **Base de datos**: MySQL (gestionada externamente)
- **Proxy**: Nginx Proxy Manager (Puertos 80, 443, 81)
- **Docs**: Documentación (si aplica)

---

## 🔄 Flujo Automático

### 1. Build y Push (`.github/workflows/build_and_push.yml`)

**Trigger:** Push a rama `main` o tags `v*`

**Acciones:**
- Construye imágenes Docker multiplataforma (AMD64 + ARM64)
- Las sube a Docker Hub con el hash del commit como tag
- Si hay un tag git, también lo usa como tag de imagen
- Usa cache de Docker BuildX para optimizar builds

**Tiempo estimado:** 15-20 minutos

### 2. Deploy a EC2 (`.github/workflows/deploy-ec2.yml`)

**Trigger:** Cuando el workflow de build se completa exitosamente

**Acciones:**
- Se conecta al servidor EC2 vía SSH
- Hace login en Docker Hub
- Actualiza el `docker-compose.yml` con el nuevo tag
- Descarga las nuevas imágenes
- Reinicia los servicios

**Tiempo estimado:** 2-3 minutos

---

## 🔑 Secretos de GitHub Requeridos

Configura estos secretos en: `Settings > Secrets and variables > Actions`

| Secreto | Descripción | Ejemplo |
|---------|-------------|---------|
| `EC2_HOST` | IP pública o dominio de tu EC2 | `54.123.45.67` o `api.tudominio.com` |
| `EC2_USER` | Usuario SSH del servidor | `ubuntu` o `ec2-user` |
| `EC2_SSH_KEY_PORTFOLIO` | Llave privada SSH completa | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub | `ruizdev7` |
| `DOCKERHUB_TOKEN` | Token de acceso de Docker Hub | (generar en Docker Hub) |

### 📝 Notas sobre las llaves SSH:

- Debe incluir los headers `-----BEGIN ... KEY-----` y `-----END ... KEY-----`
- Preservar todos los saltos de línea
- No agregar espacios extra al principio o final

---

## 🛠️ Despliegue Manual

Si necesitas desplegar manualmente (sin usar GitHub Actions):

### Opción 1: Build y Deploy Completo

```bash
# 1. Build y push de imágenes (multiplataforma)
./build_and_deploy.sh $(git rev-parse --short HEAD)

# 2. SSH al servidor y desplegar
ssh -i ~/.ssh/tu_llave.pem ubuntu@TU_IP_EC2 << 'EOF'
  cd /home/ubuntu/Documents/Github/ruizdev7-portfolio
  
  # Login en DockerHub
  echo "TU_DOCKERHUB_TOKEN" | docker login -u ruizdev7 --password-stdin
  
  # Actualizar docker-compose.yml con el nuevo tag
  NEW_TAG=$(git rev-parse --short HEAD)
  sed -i "s|portfolio-backend:.*|portfolio-backend:$NEW_TAG|g" docker-compose.yml
  sed -i "s|portfolio-frontend:.*|portfolio-frontend:$NEW_TAG|g" docker-compose.yml
  
  # Desplegar
  docker compose pull backend frontend
  docker compose up -d backend frontend
  
  # Verificar estado
  docker compose ps
EOF
```

### Opción 2: Build Rápido (solo AMD64)

```bash
# Más rápido para desarrollo (8-12 min vs 15-20 min)
./build_and_deploy_fast.sh $(git rev-parse --short HEAD)
```

---

## 🐳 Comandos Docker Útiles en el Servidor

```bash
# Ver logs en tiempo real
docker compose logs -f backend frontend

# Ver estado de los contenedores
docker compose ps

# Reiniciar un servicio específico
docker compose restart backend

# Ver logs de un servicio específico
docker compose logs backend --tail=100

# Detener todo
docker compose down

# Iniciar todo
docker compose up -d

# Limpiar imágenes antiguas
docker image prune -a
```

---

## 📦 Estructura del docker-compose.yml

```yaml
services:
  backend:
    image: ruizdev7/portfolio-backend:COMMIT_HASH
    # ...
  
  frontend:
    image: ruizdev7/portfolio-frontend:COMMIT_HASH
    # ...
  
  proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    # ...
```

El tag `COMMIT_HASH` se reemplaza automáticamente durante el deploy.

---

## 🔧 Configuración del Servidor EC2

### Requisitos:
- Ubuntu 20.04+ o Amazon Linux 2
- Docker y Docker Compose instalados
- Puerto 22 (SSH) abierto en Security Group
- Puertos 80, 443 (HTTP/HTTPS) abiertos
- Puerto 81 (Nginx Proxy Manager UI) opcional

### Setup inicial:

```bash
# Instalar Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu

# Verificar instalación
docker --version
docker compose version

# Clonar el repositorio
cd ~/Documents/Github
git clone https://github.com/Ruizdev7/ruizdev7-portfolio.git
cd ruizdev7-portfolio

# Crear archivo .env.production
cd backend
cp .env.example .env.production
# Editar .env.production con valores de producción
```

---

## 🧪 Testing del Despliegue

### 1. Verificar que las imágenes existen en Docker Hub:
```bash
# Verificar en: https://hub.docker.com/r/ruizdev7/portfolio-backend/tags
# Verificar en: https://hub.docker.com/r/ruizdev7/portfolio-frontend/tags
```

### 2. Probar conexión SSH desde local:
```bash
ssh -i ~/.ssh/tu_llave.pem ubuntu@TU_IP_EC2 "echo 'SSH OK'"
```

### 3. Verificar servicios en el servidor:
```bash
ssh -i ~/.ssh/tu_llave.pem ubuntu@TU_IP_EC2
docker compose ps
curl localhost:6000/api/health  # Backend health check
curl localhost/  # Frontend
```

---

## 🚨 Troubleshooting

### Problema: Build falla en GitHub Actions

**Solución:**
- Verificar logs en GitHub Actions
- Revisar errores de import en el código
- Verificar que todas las dependencias estén en package.json/requirements.txt

### Problema: Deploy falla con "Permission denied"

**Solución:**
- Verificar que el secreto `EC2_SSH_KEY_PORTFOLIO` tenga el formato correcto
- Probar conexión SSH manualmente
- Verificar Security Group permite conexiones desde GitHub Actions

### Problema: Imágenes no se descargan en EC2

**Solución:**
- Verificar login en Docker Hub: `docker login`
- Verificar que las imágenes existan: `docker pull ruizdev7/portfolio-backend:TAG`
- Verificar conectividad a internet del servidor

### Problema: Contenedores no inician

**Solución:**
- Ver logs: `docker compose logs`
- Verificar variables de entorno en `.env.production`
- Verificar que los puertos no estén en uso: `sudo netstat -tulpn`

---

## 📊 Monitoreo

### Logs centralizados:
```bash
# Ver todos los logs
docker compose logs -f

# Ver logs de los últimos 30 minutos
docker compose logs --since 30m

# Seguir logs de un servicio
docker compose logs -f backend
```

### Métricas:
```bash
# Uso de recursos
docker stats

# Espacio en disco
df -h
docker system df
```

---

## 🔄 Rollback

Si algo sale mal, puedes volver a una versión anterior:

```bash
# En el servidor EC2
cd /home/ubuntu/Documents/Github/ruizdev7-portfolio

# Ver el historial de commits
git log --oneline -10

# Actualizar a un commit anterior
OLD_TAG="abc1234"  # Hash del commit que funcionaba
sed -i "s|portfolio-backend:.*|portfolio-backend:$OLD_TAG|g" docker-compose.yml
sed -i "s|portfolio-frontend:.*|portfolio-frontend:$OLD_TAG|g" docker-compose.yml

# Redesplegar
docker compose pull
docker compose up -d backend frontend
```

---

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)

---

## 📝 Changelog de Despliegue

### v2.0 (Actual)
- ✅ CI/CD completamente automatizado
- ✅ Builds multiplataforma (AMD64 + ARM64)
- ✅ Deploy automático a EC2
- ✅ Cache optimizado (50% más rápido)

### v1.0
- ✅ Deploy manual con scripts bash
- ✅ Builds locales

