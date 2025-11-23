# Documentación de la API - Portfolio RuizDev7

## 📖 Descripción General

La API del Portfolio de RuizDev7 proporciona endpoints para gestionar posts, bombas, usuarios, categorías, comentarios y un sistema completo de autorización basado en roles y permisos.

## 🚀 Acceso a la Documentación

### 1. Swagger UI (Interfaz Interactiva)
```
http://localhost:8000/api/v1/docs
```

### 2. ReDoc (Documentación Alternativa)
```
http://localhost:8000/api/v1/docs/redoc
```

### 3. Archivo JSON de Especificación
```
http://localhost:8000/api/v1/swagger.json
```

## 🔐 Autenticación

La API utiliza autenticación JWT (JSON Web Tokens). Para acceder a endpoints protegidos:

1. **Obtener token**: POST `/api/v1/token`
2. **Usar token**: Incluir en header: `Authorization: Bearer <token>`
3. **Refrescar token**: GET `/api/v1/refresh-token`
4. **Cerrar sesión**: DELETE `/api/v1/logout`

### Ejemplo de Login
```bash
curl -X POST http://localhost:8000/api/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ruizdev7@outlook.com",
    "password": "tu_password"
  }'
```

## 👥 Roles y Permisos

### Roles Disponibles
- **admin**: Acceso completo (24 permisos)
- **moderator**: Permisos limitados (11 permisos)
- **user**: Usuario básico (7 permisos)
- **guest**: Solo lectura (3 permisos)

### Permisos por Recurso
- **posts**: create, read, update, delete
- **users**: create, read, update, delete
- **pumps**: create, read, update, delete
- **categories**: create, read, update, delete
- **comments**: create, read, update, delete
- **roles**: create, read, update, delete

## 📋 Endpoints Principales

### 🔐 Autenticación
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/v1/token` | Iniciar sesión | No |
| GET | `/api/v1/refresh-token` | Refrescar token | Sí |
| DELETE | `/api/v1/logout` | Cerrar sesión | Sí |
| GET | `/api/v1/whoami` | Información del usuario | Sí |
| GET | `/api/v1/my-permissions` | Mis permisos | Sí |

### 👥 Gestión de Roles y Permisos
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/roles` | Obtener todos los roles | roles.read |
| POST | `/api/v1/roles` | Crear nuevo rol | roles.create |
| PUT | `/api/v1/roles/{id}` | Actualizar rol | roles.update |
| DELETE | `/api/v1/roles/{id}` | Eliminar rol | roles.delete |
| GET | `/api/v1/permissions` | Obtener todos los permisos | roles.read |
| POST | `/api/v1/initialize-roles` | Inicializar roles | roles.create |

### 📝 Posts
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/posts` | Obtener posts aleatorios | No |
| POST | `/api/v1/posts` | Crear nuevo post | posts.create |
| GET | `/api/v1/posts-table` | Obtener tabla de posts | posts.read |
| GET | `/posts/{id}` | Obtener post por ID | No |

### ⚙️ Bombas
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/api/v1/pumps` | Crear nueva bomba | pumps.create |

## 🛠️ Uso con Swagger UI

### 1. Acceder a la Documentación
Abre tu navegador y ve a: `http://localhost:8000/api/v1/docs`

### 2. Autenticarse
1. Busca el endpoint `/api/v1/token`
2. Haz clic en "Try it out"
3. Ingresa tus credenciales:
   ```json
   {
     "email": "ruizdev7@outlook.com",
     "password": "tu_password"
   }
   ```
4. Ejecuta la petición
5. Copia el token de la respuesta

### 3. Configurar Autorización
1. Haz clic en el botón "Authorize" (🔒) en la parte superior
2. En el campo "Value", ingresa: `Bearer <tu_token>`
3. Haz clic en "Authorize"
4. Cierra el modal

### 4. Probar Endpoints
Ahora puedes probar todos los endpoints protegidos. El token se incluirá automáticamente en las peticiones.

## 📝 Ejemplos de Uso

### Crear un Post
```bash
curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi nuevo post",
    "content": "Contenido del post...",
    "ccn_author": 1,
    "ccn_category": 1
  }'
```

### Obtener Roles
```bash
curl -X GET http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer <tu_token>"
```

### Crear una Bomba
```bash
curl -X POST http://localhost:8000/api/v1/pumps \
  -H "Authorization: Bearer <tu_token>" \
  -F "model=Bomba Centrífuga X100" \
  -F "serial_number=SN123456789" \
  -F "location=Sala de máquinas A" \
  -F "purchase_date=2023-01-15" \
  -F "status=active" \
  -F "flow_rate=100.5" \
  -F "pressure=2.5" \
  -F "power=5.5" \
  -F "efficiency=85.5" \
  -F "voltage=220" \
  -F "current=15.5" \
  -F "power_factor=0.95" \
  -F "last_maintenance=2024-01-15" \
  -F "next_maintenance=2024-07-15" \
  -F "user_id=1"
```

## 🔧 Configuración del Entorno

### Variables de Entorno
```bash
# Desarrollo
FLASK_ENV=development
FLASK_DEBUG=1
JWT_SECRET_KEY=default-jwt-secret-development

# Base de datos
DB_USER=root
DB_PASSWORD=root
DB_HOST=host.docker.internal
DB_PORT=3306
DB_NAME=portfolio_app_dev
```

### Comandos Útiles
```bash
# Inicializar roles y permisos
docker compose exec backend flask init-roles

# Crear usuario administrador
docker compose exec backend flask create-admin \
  --email admin@example.com \
  --password admin123 \
  --first-name Admin \
  --last-name User

# Asignar rol a usuario existente
docker compose exec backend flask assign-role \
  --user-id 1 \
  --role-name admin

# Listar roles y permisos
docker compose exec backend flask list-roles
```

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Permiso denegado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## 🔒 Seguridad

### Mejores Prácticas
1. **Nunca compartas tokens JWT**
2. **Usa HTTPS en producción**
3. **Valida siempre los datos de entrada**
4. **Implementa rate limiting**
5. **Mantén los tokens actualizados**

### Validación de Permisos
- Los permisos se verifican en el backend
- No confíes solo en la validación del frontend
- Usa los decoradores de autorización en todos los endpoints protegidos

## 📚 Recursos Adicionales

- [Documentación del Sistema de Roles y Permisos](./ROLES_AND_PERMISSIONS.md)
- [Especificación OpenAPI](./portfolio_app/static/swagger.json)
- [Comandos de Flask](./commands.py)

## 🤝 Contribución

Para contribuir a la documentación:

1. Actualiza el archivo `swagger.json` con nuevos endpoints
2. Actualiza este README con ejemplos adicionales
3. Verifica que todos los endpoints estén documentados
4. Prueba los ejemplos antes de commitear

## 📞 Soporte

Si tienes problemas con la API:

1. Verifica que el servidor esté corriendo
2. Revisa los logs del backend
3. Confirma que las credenciales sean correctas
4. Verifica que tengas los permisos necesarios

**Contacto**: ruizdev7@outlook.com
