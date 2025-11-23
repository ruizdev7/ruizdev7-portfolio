# 🧪 Prueba Rápida - Crear AI Agent

## ⚠️ IMPORTANTE: El Token JWT Expira

Los tokens JWT expiran después de **1 hora**. Si recibes 403, **haz login de nuevo** para obtener un token fresco.

---

## 📋 Pasos para Probar

### Paso 1: Login (OBLIGATORIO - hacer esto primero)

**En Postman:**
```http
POST http://localhost:8000/api/v1/token
Content-Type: application/json

{
  "email": "ruizdev7@outlook.com",
  "password": "tu_password"
}
```

**Copia el `access_token` COMPLETO de la respuesta.**

---

### Paso 2: Verificar Permisos (Opcional pero recomendado)

```http
GET http://localhost:8000/api/v1/my-permissions
Authorization: Bearer TU_TOKEN_AQUI
```

**Deberías ver `ai_agents_create` en la lista.**

Si NO lo ves:
```bash
docker compose exec backend flask init-roles
```
Luego **haz login de nuevo**.

---

### Paso 3: Crear Agent

```http
POST http://localhost:8000/api/v1/ai/agents
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json

{
  "name": "Financial Analyzer",
  "agent_type": "financial",
  "description": "Test agent",
  "model_name": "gpt-4",
  "confidence_threshold": 0.75
}
```

**Resultado esperado:**
- ✅ `HTTP 201` o `200`
- ✅ JSON con `agent_id`

**Si recibes 403:**
1. El token expiró → Haz login de nuevo
2. No tienes permisos → Ejecuta `flask init-roles` y haz login de nuevo

---

## 🔧 Solución Rápida al 403

```bash
# 1. Reinicializar permisos
docker compose exec backend flask init-roles

# 2. Reiniciar backend
docker compose restart backend

# 3. HAZ LOGIN DE NUEVO en Postman
# 4. Usa el NUEVO token para crear el agent
```

---

## ✅ Script Automatizado

Ejecuta:
```bash
./test_complete_flow.sh
```

Te pedirá email y password, y hará todo automáticamente.

---

## 🐛 Debug

Si sigues teniendo problemas:

1. **Verificar que el usuario tiene rol admin:**
```bash
docker compose exec mysql mysql -u root -proot -e "
USE portfolio_app_dev;
SELECT u.email, r.role_name 
FROM tbl_users u 
JOIN tbl_user_roles ur ON u.ccn_user = ur.ccn_user 
JOIN tbl_roles r ON ur.ccn_role = r.ccn_role 
WHERE u.email = 'ruizdev7@outlook.com';
"
```

2. **Verificar que el permiso existe:**
```bash
docker compose exec mysql mysql -u root -proot -e "
USE portfolio_app_dev;
SELECT permission_name FROM tbl_permissions 
WHERE permission_name = 'ai_agents_create';
"
```

3. **Ver logs del backend:**
```bash
docker compose logs backend -f
```

Luego intenta crear el agent y verás los logs en tiempo real.

---

## 🎯 Checklist

- [ ] Backend corriendo (`docker compose ps`)
- [ ] Hice login de NUEVO (token fresco)
- [ ] Verifiqué permisos (`/my-permissions`)
- [ ] El token no expiró (menos de 1 hora)
- [ ] Mi usuario tiene rol `admin`
- [ ] El permiso `ai_agents_create` existe

---

**Si completas el checklist y aún recibes 403, comparte los logs del backend.**

