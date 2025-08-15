# 👁️ Guía del Usuario Guest - Modo Solo Lectura

## 📋 **Información del Usuario Guest**

### **Credenciales de Acceso:**
- **Email:** `guest@example.com`
- **Contraseña:** `guest123`
- **Rol:** `guest`
- **Permisos:** Solo lectura

### **Permisos Disponibles:**
- ✅ **posts.read** - Ver publicaciones del blog
- ✅ **pumps.read** - Ver proyectos de bombas
- ✅ **comments.read** - Ver comentarios

### **Permisos NO Disponibles:**
- ❌ **Crear** contenido (posts, pumps, comments)
- ❌ **Editar** contenido existente
- ❌ **Eliminar** contenido
- ❌ **Gestionar** roles y permisos
- ❌ **Gestionar** usuarios

## 🎯 **Funcionalidades Disponibles**

### **1. Navegación Básica**
- **Inicio** - Página principal del portfolio
- **Blog** - Ver publicaciones del blog (solo lectura)
- **Proyectos** - Ver proyectos de bombas (solo lectura)

### **2. Interfaz Adaptada**
- **Indicador de Rol:** Muestra "👁️ Usuario Guest (Solo Lectura)"
- **Panel Informativo:** Explica el modo solo lectura
- **Navegación Limitada:** Solo muestra opciones accesibles

### **3. Experiencia de Usuario**
- **Sin Botones de Acción:** No aparecen botones de crear, editar o eliminar
- **Vista de Solo Lectura:** Puede explorar todo el contenido
- **Sin Acceso a Admin:** No puede acceder a gestión de roles o usuarios

## 🔒 **Seguridad y Restricciones**

### **Frontend (React)**
- Los componentes `PermissionGuard` y `RoleGuard` ocultan funcionalidades
- El hook `usePermissions` controla qué se muestra
- El sidebar se adapta automáticamente

### **Backend (Flask)**
- Los decoradores `@require_permission` protegen los endpoints
- El rol `guest` solo tiene permisos de lectura
- Cualquier intento de modificación será rechazado

## 🧪 **Casos de Uso**

### **Escenario 1: Exploración de Contenido**
```
1. Iniciar sesión como guest@example.com
2. Navegar por el blog
3. Ver proyectos de bombas
4. Leer comentarios existentes
```

### **Escenario 2: Intentar Modificar (Será Bloqueado)**
```
1. Intentar crear una nueva publicación → ❌ Error 403
2. Intentar editar un proyecto → ❌ Error 403
3. Intentar eliminar un comentario → ❌ Error 403
```

## 🛠️ **Implementación Técnica**

### **Creación del Usuario Guest**
```bash
# Comando para crear usuario guest
docker compose exec backend flask create-guest \
  --email guest@example.com \
  --password guest123 \
  --first-name Usuario \
  --last-name Guest
```

### **Asignación de Rol**
```bash
# El comando automáticamente asigna el rol "guest"
# que incluye solo permisos de lectura:
# - posts.read
# - pumps.read  
# - comments.read
```

### **Verificación de Usuarios**
```bash
# Listar todos los usuarios y sus roles
docker compose exec backend flask list-users
```

## 📱 **Interfaz de Usuario**

### **Sidebar Adaptativo**
- **Usuario Admin:** Ve todas las opciones
- **Usuario Guest:** Ve solo opciones de lectura
- **Indicador Visual:** Muestra el rol actual

### **Componentes Protegidos**
- `PermissionGuard` - Oculta elementos según permisos
- `RoleGuard` - Oculta elementos según roles
- `usePermissions` - Hook para verificar permisos

## 🔄 **Flujo de Autenticación**

1. **Login:** Usuario guest inicia sesión
2. **Token:** Recibe JWT con roles y permisos
3. **Redux:** Se almacena en el estado global
4. **UI:** Se adapta automáticamente
5. **API:** Las peticiones incluyen el token

## 🚀 **Próximos Pasos**

### **Mejoras Sugeridas:**
1. **Página de Bienvenida:** Mensaje específico para usuarios guest
2. **Tutorial:** Guía interactiva para nuevos usuarios
3. **Feedback:** Mensajes cuando intentan realizar acciones no permitidas
4. **Analytics:** Seguimiento de qué contenido ven los guests

### **Funcionalidades Adicionales:**
1. **Favoritos:** Permitir marcar contenido como favorito
2. **Búsqueda:** Funcionalidad de búsqueda en contenido
3. **Filtros:** Filtrar contenido por categorías
4. **Compartir:** Compartir enlaces de contenido

---

## 📞 **Soporte**

Si necesitas ayuda con el usuario guest o quieres implementar funcionalidades adicionales, consulta la documentación completa del sistema de roles y permisos.
