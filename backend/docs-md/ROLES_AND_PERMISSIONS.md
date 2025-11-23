# Sistema de Roles y Permisos

## Descripción General

Este sistema implementa un control de acceso basado en roles (RBAC - Role-Based Access Control) que permite gestionar permisos de manera granular para diferentes recursos de la aplicación.

## Estructura de la Base de Datos

### Tablas Principales

1. **tbl_roles**: Almacena los roles del sistema
2. **tbl_permissions**: Define los permisos disponibles
3. **tbl_role_permissions**: Relación muchos a muchos entre roles y permisos
4. **tbl_user_roles**: Relación muchos a muchos entre usuarios y roles

### Modelos

- `Roles`: Define los roles del sistema
- `Permissions`: Define los permisos por recurso y acción
- `RolePermissions`: Relación entre roles y permisos
- `UserRoles`: Relación entre usuarios y roles
- `User`: Modelo de usuario con métodos de verificación de permisos

## Roles Predefinidos

### 1. Admin
- **Descripción**: Administrador completo del sistema
- **Permisos**: Todos los permisos disponibles
- **Uso**: Gestión completa del sistema

### 2. Moderator
- **Descripción**: Moderador con permisos limitados
- **Permisos**: 
  - Crear, leer y actualizar posts
  - Leer usuarios
  - Crear, leer y actualizar bombas
  - Leer categorías
  - Crear, leer y actualizar comentarios

### 3. User
- **Descripción**: Usuario básico
- **Permisos**:
  - Crear, leer y actualizar posts
  - Leer bombas
  - Crear, leer y actualizar comentarios

### 4. Guest
- **Descripción**: Usuario invitado
- **Permisos**:
  - Leer posts
  - Leer bombas
  - Leer comentarios

## Permisos Disponibles

### Estructura de Permisos
Cada permiso sigue el formato: `{recurso}_{acción}`

### Recursos Disponibles
- **posts**: Gestión de publicaciones
- **users**: Gestión de usuarios
- **pumps**: Gestión de bombas
- **categories**: Gestión de categorías
- **comments**: Gestión de comentarios
- **roles**: Gestión de roles y permisos

### Acciones Disponibles
- **create**: Crear recursos
- **read**: Leer recursos
- **update**: Actualizar recursos
- **delete**: Eliminar recursos

## Decoradores de Autorización

### 1. require_permission(resource, action)
Verifica que el usuario tenga un permiso específico.

```python
@require_permission("posts", "create")
def create_post():
    # Solo usuarios con permiso posts_create pueden acceder
    pass
```

### 2. require_role(role_name)
Verifica que el usuario tenga un rol específico.

```python
@require_role("admin")
def admin_only_function():
    # Solo administradores pueden acceder
    pass
```

### 3. require_ownership_or_permission(resource, action)
Permite acceso si el usuario es propietario del recurso o tiene el permiso general.

```python
@require_ownership_or_permission("posts", "update")
def update_post(id):
    # Permite acceso si es propietario del post o tiene permiso posts_update
    pass
```

### 4. require_any_permission(permissions)
Requiere al menos uno de los permisos especificados.

```python
@require_any_permission([("posts", "create"), ("posts", "update")])
def post_management():
    # Permite acceso si tiene permiso para crear O actualizar posts
    pass
```

### 5. require_all_permissions(permissions)
Requiere todos los permisos especificados.

```python
@require_all_permissions([("posts", "read"), ("users", "read")])
def admin_dashboard():
    # Permite acceso solo si tiene AMBOS permisos
    pass
```

## Métodos del Modelo User

### has_permission(resource, action)
Verifica si el usuario tiene un permiso específico.

```python
if current_user.has_permission("posts", "delete"):
    # Lógica para eliminar post
    pass
```

### has_role(role_name)
Verifica si el usuario tiene un rol específico.

```python
if current_user.has_role("admin"):
    # Lógica específica para administradores
    pass
```

### get_roles()
Obtiene todos los roles del usuario.

```python
roles = current_user.get_roles()
for role in roles:
    print(f"Rol: {role.role_name}")
```

### get_permissions()
Obtiene todos los permisos del usuario.

```python
permissions = current_user.get_permissions()
for perm in permissions:
    print(f"Permiso: {perm['permission_name']}")
```

## API Endpoints

### Gestión de Roles

#### GET /api/v1/roles
Obtiene todos los roles (requiere permiso: roles.read)

#### POST /api/v1/roles
Crea un nuevo rol (requiere permiso: roles.create)

#### PUT /api/v1/roles/{role_id}
Actualiza un rol (requiere permiso: roles.update)

#### DELETE /api/v1/roles/{role_id}
Elimina un rol (requiere permiso: roles.delete)

### Gestión de Permisos

#### GET /api/v1/permissions
Obtiene todos los permisos (requiere permiso: roles.read)

#### GET /api/v1/roles/{role_id}/permissions
Obtiene permisos de un rol específico (requiere permiso: roles.read)

#### POST /api/v1/roles/{role_id}/permissions
Asigna un permiso a un rol (requiere permiso: roles.update)

#### DELETE /api/v1/roles/{role_id}/permissions/{permission_id}
Remueve un permiso de un rol (requiere permiso: roles.update)

### Gestión de Usuarios

#### GET /api/v1/users/{user_id}/roles
Obtiene roles de un usuario (requiere permiso: users.read)

#### POST /api/v1/users/{user_id}/roles
Asigna un rol a un usuario (requiere permiso: users.update)

#### DELETE /api/v1/users/{user_id}/roles/{role_name}
Remueve un rol de un usuario (requiere permiso: users.update)

#### GET /api/v1/users/{user_id}/permissions
Obtiene permisos de un usuario (requiere permiso: users.read)

### Información del Usuario Actual

#### GET /api/v1/my-permissions
Obtiene roles y permisos del usuario autenticado

## Comandos de Flask

### Inicialización

#### flask init-roles
Inicializa roles y permisos por defecto.

```bash
docker compose exec backend flask init-roles
```

#### flask create-admin
Crea un usuario administrador.

```bash
docker compose exec backend flask create-admin \
  --email admin@example.com \
  --password admin123 \
  --first-name Admin \
  --last-name User
```

#### flask assign-role
Asigna un rol a un usuario existente.

```bash
docker compose exec backend flask assign-role \
  --user-id 1 \
  --role-name admin
```

#### flask list-roles
Lista todos los roles y sus permisos.

```bash
docker compose exec backend flask list-roles
```

## Ejemplos de Uso

### 1. Proteger un Endpoint con Permisos

```python
@blueprint.route("/api/v1/posts", methods=["POST"])
@jwt_required()
@require_permission("posts", "create")
def create_post():
    # Solo usuarios con permiso posts_create pueden crear posts
    pass
```

### 2. Verificar Permisos en el Código

```python
@blueprint.route("/api/v1/posts/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_post(id):
    if current_user.has_permission("posts", "delete"):
        # Eliminar post
        pass
    else:
        return jsonify({"error": "Permiso denegado"}), 403
```

### 3. Verificar Propiedad del Recurso

```python
@blueprint.route("/api/v1/posts/<int:id>", methods=["PUT"])
@jwt_required()
@require_ownership_or_permission("posts", "update")
def update_post(id):
    # Permite acceso si es propietario o tiene permiso general
    pass
```

### 4. Múltiples Permisos

```python
@blueprint.route("/api/v1/admin/dashboard")
@jwt_required()
@require_any_permission([("posts", "read"), ("users", "read")])
def admin_dashboard():
    # Permite acceso si tiene al menos uno de los permisos
    pass
```

## Respuesta del Login

El endpoint de login ahora incluye información de roles y permisos:

```json
{
  "current_user": {
    "user_info": {
      "ccn_user": 1,
      "email": "ruizdev7@outlook.com",
      "first_name": "Admin",
      "last_name": "User"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "account_id": "hash_value",
    "roles": [
      {
        "ccn_role": 1,
        "role_name": "admin"
      }
    ],
    "permissions": [
      {
        "permission_name": "posts_create",
        "resource": "posts",
        "action": "create",
        "description": "Crear posts"
      }
    ]
  }
}
```

## Migración de Base de Datos

Para aplicar los cambios de la base de datos:

```bash
# Crear migración
docker compose exec backend flask db migrate -m "Add permissions and role_permissions tables"

# Aplicar migración
docker compose exec backend flask db upgrade
```

## Consideraciones de Seguridad

1. **Validación de Permisos**: Siempre verificar permisos en el backend, nunca confiar solo en el frontend
2. **Principio de Menor Privilegio**: Asignar solo los permisos necesarios a cada rol
3. **Auditoría**: Los cambios de roles y permisos deberían ser auditados
4. **Tokens JWT**: Los tokens incluyen información de permisos, pero siempre verificar en el servidor

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

1. **Nuevos Recursos**: Agregar nuevos recursos en el servicio de autorización
2. **Nuevos Roles**: Crear roles personalizados según necesidades específicas
3. **Permisos Granulares**: Definir permisos más específicos según requerimientos
4. **Lógica de Negocio**: Implementar lógica específica en los decoradores

## Troubleshooting

### Error: "Usuario no autenticado"
- Verificar que el token JWT sea válido
- Asegurar que el endpoint tenga `@jwt_required()`

### Error: "Permiso denegado"
- Verificar que el usuario tenga el rol correcto
- Confirmar que el rol tenga el permiso asignado
- Usar `flask list-roles` para verificar la configuración

### Error: "Rol requerido no encontrado"
- Verificar que el rol existe en la base de datos
- Usar `flask list-roles` para ver roles disponibles

## Estado Actual del Sistema

✅ **Implementado y Funcionando:**

1. **Modelos de Base de Datos**: Todas las tablas creadas y migradas
2. **Roles Predefinidos**: admin, moderator, user, guest
3. **Permisos Granulares**: 24 permisos para 6 recursos
4. **Decoradores de Autorización**: 5 decoradores diferentes
5. **API Endpoints**: Gestión completa de roles y permisos
6. **Comandos de Flask**: Inicialización y gestión
7. **Usuario Administrador**: ruizdev7@outlook.com asignado como admin
8. **Integración con JWT**: Información de permisos en login

## Próximos Pasos Recomendados

1. **Frontend Integration**: Implementar verificación de permisos en el frontend
2. **Audit Log**: Agregar logging de cambios de roles y permisos
3. **Cache**: Implementar cache para permisos frecuentemente consultados
4. **Testing**: Crear tests unitarios para el sistema de permisos
5. **Documentation**: Documentar casos de uso específicos del negocio
