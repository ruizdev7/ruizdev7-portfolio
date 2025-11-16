# Configuración de Variables de Entorno

## Desarrollo Local

Crea el archivo `backend/.env.development` con el siguiente contenido:

```bash
# Flask Configuration
FLASK_APP=app.py
FLASK_DEBUG=True
FLASK_ENV=development

# Database Configuration (MySQL en Docker)
DB_USER=portfolio_user
DB_PASSWORD=portfolio_dev_pass
DB_HOST=mysql
DB_PORT=3306
DB_NAME=portfolio_app_dev

# JWT Configuration
JWT_SECRET_KEY=default-jwt-secret-development
SECRET_KEY=default-secret-key-development

# API Domain
API_DOMAIN=http://localhost:8000

# OpenAI Configuration
OPENAI_API_KEY=tu-api-key-de-openai-aqui
```

**Cambio importante:** `DB_HOST=mysql` (ya no es `host.docker.internal`)

---

## Producción

Crea el archivo `backend/.env.production` con el siguiente contenido:

```bash
# Flask Configuration
FLASK_APP=app.py
FLASK_DEBUG=False
FLASK_ENV=production

# Database Configuration (MySQL en Docker)
DB_USER=portfolio_user
DB_PASSWORD=CAMBIAR_POR_PASSWORD_SEGURO
DB_HOST=mysql
DB_PORT=3306
DB_NAME=portfolio_app_prod

# JWT Configuration (Generar con: openssl rand -hex 32)
JWT_SECRET_KEY=GENERAR_CLAVE_SEGURA_AQUI
SECRET_KEY=GENERAR_CLAVE_SEGURA_AQUI

# API Domain
API_DOMAIN=https://api.tu-dominio.com

# OpenAI Configuration
OPENAI_API_KEY=tu-api-key-de-openai-aqui
```

**Generar claves seguras:**
```bash
openssl rand -hex 32
```

