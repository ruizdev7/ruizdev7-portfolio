# 🚀 Configuración de Producción

## 📋 Descripción

Este proyecto usa **`docker-compose.production.yml`** para el entorno de producción, que incluye:

- ✅ **MySQL 8.0** - Base de datos en contenedor con volumen persistente
- ✅ **Backend** - Flask + Gunicorn (imágenes de DockerHub)
- ✅ **Frontend** - React + Nginx (imágenes de DockerHub)
- ✅ **Nginx Proxy Manager** - Reverse proxy con SSL automático

---

## 🔧 Setup Inicial en el Servidor EC2

### 1. Instalar Docker y Docker Compose

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y docker.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu

# Reiniciar sesión o ejecutar
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### 2. Clonar el repositorio

```bash
mkdir -p ~/Documents/Github
cd ~/Documents/Github
git clone https://github.com/ruizdev7/ruizdev7-portfolio.git
cd ruizdev7-portfolio
```

### 3. Crear archivo de variables de entorno

```bash
cd backend

# Copiar template
cp .env.example .env.production

# Editar con tus valores de producción
nano .env.production
```

**Variables importantes en `.env.production`:**

```bash
# Base de datos (debe coincidir con docker-compose.production.yml)
DATABASE_URI=mysql+pymysql://portfolio_user:SecureProdPass2024!@mysql-prod:3306/portfolio_app_prod

# Flask
FLASK_ENV=production
SECRET_KEY=tu-secret-key-super-segura-aqui

# JWT
JWT_SECRET_KEY=tu-jwt-secret-key-super-segura-aqui

# API Domain (tu dominio real)
API_DOMAIN=https://api.tudominio.com

# Frontend URL
FRONTEND_URL=https://tudominio.com

# Email (configuración de producción)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password
MAIL_DEFAULT_SENDER=tu_email@gmail.com
```

### 4. Configurar credenciales de MySQL (opcional)

Puedes personalizar las credenciales de MySQL creando un archivo `.env` en la raíz:

```bash
cd ~/Documents/Github/ruizdev7-portfolio

# Crear archivo .env
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=TuPasswordRootMuySegura2024!
MYSQL_DATABASE=portfolio_app_prod
MYSQL_USER=portfolio_user
MYSQL_PASSWORD=TuPasswordUsuarioMuySegura2024!
EOF

chmod 600 .env
```

**⚠️ IMPORTANTE:** Si cambias estas credenciales, actualiza también `backend/.env.production` con el `DATABASE_URI` correcto.

---

## 🚀 Desplegar por Primera Vez

### Método 1: Despliegue Automático (Recomendado)

Simplemente haz push a `main` y GitHub Actions se encargará:

```bash
git push origin main
```

Ve a: `https://github.com/ruizdev7/ruizdev7-portfolio/actions`

### Método 2: Despliegue Manual

```bash
cd ~/Documents/Github/ruizdev7-portfolio

# Detener servicios si existen
docker compose -f docker-compose.production.yml down

# Iniciar todos los servicios
docker compose -f docker-compose.production.yml up -d

# Ver estado
docker compose -f docker-compose.production.yml ps

# Ver logs
docker compose -f docker-compose.production.yml logs -f
```

---

## 📊 Verificar que Todo Está Funcionando

### 1. Verificar contenedores

```bash
docker ps
```

Deberías ver:
- ✅ `mysql-prod` - Healthy
- ✅ `backend` - Up
- ✅ `frontend` - Up
- ✅ `proxy-manager` - Up

### 2. Verificar MySQL

```bash
# Entrar al contenedor de MySQL
docker exec -it mysql-prod mysql -u portfolio_user -p

# Password: SecureProdPass2024! (o el que hayas configurado)

# Verificar base de datos
SHOW DATABASES;
USE portfolio_app_prod;
SHOW TABLES;
exit;
```

### 3. Verificar Backend

```bash
# Ver logs del backend
docker logs backend --tail 50

# Test de health check (desde dentro del servidor)
curl http://backend:6000/api/health
```

### 4. Verificar conectividad

```bash
# Verificar que los servicios pueden comunicarse
docker exec backend ping -c 3 mysql-prod
docker exec backend ping -c 3 frontend
```

---

## 🌐 Configurar Nginx Proxy Manager

### 1. Acceder a la UI

Abre en tu navegador:
```
http://TU_IP_EC2:81
```

**Credenciales por defecto:**
- Email: `admin@example.com`
- Password: `changeme`

**⚠️ Cámbialo inmediatamente después del primer login!**

### 2. Crear Proxy Host para Backend

- **Domain Names:** `api.tudominio.com`
- **Scheme:** `http`
- **Forward Hostname/IP:** `backend`
- **Forward Port:** `6000`
- **SSL:** Activar, request certificate (Let's Encrypt)

### 3. Crear Proxy Host para Frontend

- **Domain Names:** `tudominio.com`, `www.tudominio.com`
- **Scheme:** `http`
- **Forward Hostname/IP:** `frontend`
- **Forward Port:** `80`
- **SSL:** Activar, request certificate (Let's Encrypt)

---

## 🔄 Actualizar la Aplicación

### Automático (GitHub Actions)

Simplemente haz push a `main`:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

### Manual

```bash
cd ~/Documents/Github/ruizdev7-portfolio

# Pull del repo
git pull origin main

# Actualizar docker-compose con nuevo tag
# (El tag viene del commit hash)
NEW_TAG=$(git rev-parse HEAD)
sed -i "s|portfolio-backend:.*|portfolio-backend:$NEW_TAG|g" docker-compose.production.yml
sed -i "s|portfolio-frontend:.*|portfolio-frontend:$NEW_TAG|g" docker-compose.production.yml

# Pull de nuevas imágenes
docker compose -f docker-compose.production.yml pull backend frontend

# Reiniciar solo backend y frontend (MySQL sigue corriendo)
docker compose -f docker-compose.production.yml up -d backend frontend

# Verificar
docker compose -f docker-compose.production.yml ps
```

---

## 🗄️ Gestión de Base de Datos

### Backup de MySQL

```bash
# Crear backup
docker exec mysql-prod mysqldump -u portfolio_user -pSecureProdPass2024! portfolio_app_prod > backup_$(date +%Y%m%d).sql

# Comprimir
gzip backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
# Descomprimir
gunzip backup_20240101.sql.gz

# Restaurar
docker exec -i mysql-prod mysql -u portfolio_user -pSecureProdPass2024! portfolio_app_prod < backup_20240101.sql
```

### Migrar desde Desarrollo

Si tienes datos en local que quieres migrar:

```bash
# 1. En tu máquina local, exportar datos
docker exec mysql-dev mysqldump -u portfolio_user -pportfolio_dev_pass portfolio_app_dev > local_data.sql

# 2. Copiar al servidor
scp -i ~/Documents/GitHub/SSHKeys/EC2_Server_Frankfurt.pem \
    local_data.sql \
    ubuntu@TU_IP_EC2:/tmp/

# 3. En el servidor, importar
ssh -i ~/Documents/GitHub/SSHKeys/EC2_Server_Frankfurt.pem ubuntu@TU_IP_EC2
docker exec -i mysql-prod mysql -u portfolio_user -pSecureProdPass2024! portfolio_app_prod < /tmp/local_data.sql
rm /tmp/local_data.sql
```

---

## 🛠️ Comandos Útiles

### Ver logs

```bash
# Todos los servicios
docker compose -f docker-compose.production.yml logs -f

# Un servicio específico
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f mysql
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker compose -f docker-compose.production.yml restart

# Reiniciar un servicio
docker compose -f docker-compose.production.yml restart backend
```

### Detener todo

```bash
docker compose -f docker-compose.production.yml down
```

### Eliminar volúmenes (⚠️ CUIDADO - Borra todos los datos)

```bash
# Detener y eliminar TODO incluyendo volúmenes
docker compose -f docker-compose.production.yml down -v
```

---

## 🔒 Seguridad

### 1. Firewall (Security Groups en AWS)

Asegúrate de que tu EC2 tenga estos puertos abiertos:

- **22** - SSH (solo tu IP)
- **80** - HTTP (0.0.0.0/0)
- **443** - HTTPS (0.0.0.0/0)
- **81** - Nginx Proxy Manager UI (solo tu IP - temporal)

**❌ NO abrir:**
- Puerto 3306 (MySQL) - solo interno
- Puerto 6000 (Backend) - solo interno a través de proxy

### 2. Cambiar Passwords por Defecto

```bash
# Editar .env
nano .env

# Cambiar:
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - SECRET_KEY en backend/.env.production
# - JWT_SECRET_KEY en backend/.env.production
```

### 3. Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot  # Si hay actualizaciones de kernel
```

---

## 🚨 Troubleshooting

### Backend no puede conectar a MySQL

```bash
# Verificar que MySQL está healthy
docker ps
# Debe decir "healthy" en STATUS

# Ver logs de MySQL
docker logs mysql-prod --tail 50

# Verificar conectividad desde backend
docker exec backend ping mysql-prod
```

### MySQL no inicia

```bash
# Ver logs
docker logs mysql-prod

# Problema común: permisos del volumen
docker volume inspect mysql-prod-data

# Solución: recrear volumen
docker compose -f docker-compose.production.yml down
docker volume rm mysql-prod-data
docker compose -f docker-compose.production.yml up -d
```

### Proxy Manager no puede acceder a backend/frontend

```bash
# Verificar que están en la misma red
docker network inspect local-docker-network

# Debe mostrar todos los contenedores conectados
```

---

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Documentation](https://hub.docker.com/_/mysql)
- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/)

---

## 📝 Notas

- Los datos de MySQL persisten en el volumen `mysql-prod-data`
- Los certificados SSL persisten en `proxy-letsencrypt`
- La configuración de Proxy Manager persiste en `proxy_data`
- Hacer backups regularmente de la base de datos

