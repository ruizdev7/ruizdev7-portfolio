# 🔧 Solución al Error 403 al Crear Agente

## Problema
Recibes error `403 Forbidden` al intentar crear un agente en Postman.

## Causa
El token JWT fue generado **ANTES** de que se agregaran los nuevos permisos de AI Governance. El token contiene información antigua.

## ✅ Solución Rápida

### Paso 1: Hacer Login de Nuevo

**En Postman:**
```http
POST http://localhost:5000/api/v1/token
Content-Type: application/json

{
  "email": "tu_email@example.com",
  "password": "tu_password"
}
```

**IMPORTANTE:** Copia el NUEVO `access_token` de la respuesta.

### Paso 2: Usar el Nuevo Token

Ahora usa este nuevo token en el header:

```http
POST http://localhost:5000/api/v1/ai/agents
Authorization: Bearer NUEVO_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Financial Analyzer",
  "agent_type": "financial",
  "confidence_threshold": 0.75
}
```

---

## 🔍 Verificación

Si aún recibes 403 después de hacer login de nuevo:

### 1. Verificar que tienes rol admin

```bash
docker compose exec mysql mysql -u root -proot -e "
USE portfolio_app_dev;
SELECT u.email, r.role_name 
FROM tbl_users u 
JOIN tbl_user_roles ur ON u.ccn_user = ur.ccn_user 
JOIN tbl_roles r ON ur.ccn_role = r.ccn_role 
WHERE u.email = 'tu_email@example.com';
"
```

### 2. Verificar que el permiso existe

```bash
docker compose exec mysql mysql -u root -proot -e "
USE portfolio_app_dev;
SELECT permission_name, resource, action 
FROM tbl_permissions 
WHERE permission_name = 'ai_agents_create';
"
```

### 3. Verificar que admin tiene el permiso

```bash
docker compose exec mysql mysql -u root -proot -e "
USE portfolio_app_dev;
SELECT r.role_name, p.permission_name
FROM tbl_roles r
JOIN tbl_role_permissions rp ON r.ccn_role = rp.ccn_role
JOIN tbl_permissions p ON rp.ccn_permission = p.ccn_permission
WHERE r.role_name = 'admin' AND p.permission_name = 'ai_agents_create';
"
```

### 4. Si el permiso no existe, reinicializar roles

```bash
docker compose exec backend flask init-roles
```

Luego **haz login de nuevo** para obtener un token actualizado.

---

## 📝 Nota Importante

**Cada vez que:**
- Se agregan nuevos permisos
- Se cambian roles de usuario
- Se reinicializan permisos

**Debes hacer login de nuevo** para obtener un token JWT actualizado con los nuevos permisos.

---

## ✅ Checklist

- [ ] Hice login de nuevo después de agregar permisos
- [ ] Estoy usando el token más reciente
- [ ] Mi usuario tiene rol `admin`
- [ ] El permiso `ai_agents_create` existe en la DB
- [ ] El rol `admin` tiene el permiso asignado

---

## 🚀 Prueba Rápida

1. **Login:**
   ```http
   POST /api/v1/token
   {"email": "...", "password": "..."}
   ```

2. **Verificar permisos:**
   ```http
   GET /api/v1/my-permissions
   Authorization: Bearer TOKEN
   ```
   
   Deberías ver `ai_agents_create` en la lista.

3. **Crear agente:**
   ```http
   POST /api/v1/ai/agents
   Authorization: Bearer TOKEN
   {...}
   ```

---

**Si sigues teniendo problemas, ejecuta:**
```bash
docker compose exec backend flask init-roles
docker compose restart backend
```

Luego **haz login de nuevo**.

