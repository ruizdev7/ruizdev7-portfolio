# 🧪 Guía de Testing - AI Governance Platform

## ✅ Pre-requisitos Verificados

- ✅ Backend corriendo en `http://localhost:5000`
- ✅ Frontend corriendo en `http://localhost:5173`
- ✅ MySQL corriendo
- ✅ 6 tablas creadas
- ✅ 12 permisos RBAC inicializados
- ✅ Dashboard React creado

---

## 🚀 Testing Rápido (5 minutos)

### Opción 1: Testing desde el Frontend (Más Fácil)

1. **Abre el navegador:**
   ```
   http://localhost:5173/ai-governance
   ```

2. **Si no estás logueado:**
   - Te redirigirá al login
   - Usa tus credenciales de admin

3. **Verás el Dashboard:**
   - Stats iniciales (todos en 0)
   - Lista de agentes (vacía)
   - Aprobaciones pendientes (vacías)

4. **Para crear datos de prueba:**
   - Usa Postman/Thunder Client (ver Opción 2)
   - O espera a que agreguemos UI para crear agentes

---

### Opción 2: Testing con Postman/Thunder Client

#### Paso 1: Login

```http
POST http://localhost:5000/api/v1/token
Content-Type: application/json

{
  "email": "tu_email@example.com",
  "password": "tu_password"
}
```

**Copia el `access_token` de la respuesta**

#### Paso 2: Crear AI Agent

```http
POST http://localhost:5000/api/v1/ai/agents
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Financial Analyzer",
  "agent_type": "financial",
  "description": "Analyzes financial data",
  "model_name": "gpt-4",
  "confidence_threshold": 0.75
}
```

**Copia el `agent_id` de la respuesta**

#### Paso 3: Ejecutar Tarea Simple

```http
POST http://localhost:5000/api/v1/ai/tasks
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json

{
  "agent_id": "TU_AGENT_ID",
  "task_type": "financial_analysis",
  "task_name": "Q4 Revenue Analysis",
  "input_data": {
    "revenue": 150000,
    "expenses": 95000
  }
}
```

**Resultado esperado:**
- `"mpc_used": false`
- `"requires_approval": false`
- `"status": "completed"`

#### Paso 4: Ejecutar Tarea con Datos Sensibles (MPC)

```http
POST http://localhost:5000/api/v1/ai/tasks
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json

{
  "agent_id": "TU_AGENT_ID",
  "task_type": "data_extraction",
  "task_name": "Extract Customer Info",
  "input_data": {
    "customer_name": "John Doe",
    "ssn": "123-45-6789",
    "email": "john@example.com"
  }
}
```

**Resultado esperado:**
- `"mpc_used": true` ✅
- `"requires_approval": true` ✅
- `"status": "awaiting_approval"` ✅
- `"mpc_metadata"` con info de nodos

#### Paso 5: Ver Aprobaciones

```http
GET http://localhost:5000/api/v1/ai/approvals?assigned_only=true&status=pending
Authorization: Bearer TU_ACCESS_TOKEN
```

#### Paso 6: Aprobar Tarea

```http
POST http://localhost:5000/api/v1/ai/approvals/APPROVAL_ID/approve
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json

{
  "justification": "Reviewed and approved. Data extraction is accurate."
}
```

#### Paso 7: Ver Dashboard Stats

```http
GET http://localhost:5000/api/v1/ai/dashboard/stats
Authorization: Bearer TU_ACCESS_TOKEN
```

#### Paso 8: Ver Blockchain Audit

```http
GET http://localhost:5000/api/v1/ai/blockchain/audit?limit=10
Authorization: Bearer TU_ACCESS_TOKEN
```

---

### Opción 3: Script Automatizado

Ejecuta el script interactivo:

```bash
./test_ai_governance_interactive.sh
```

Te pedirá:
1. Email
2. Password
3. Automáticamente creará agent y ejecutará tarea

---

## 🔍 Verificación de Funcionalidad

### Checklist de Testing

- [ ] **Login funciona**
  - POST `/api/v1/token` retorna access_token

- [ ] **Dashboard carga**
  - GET `/api/v1/ai/dashboard/stats` retorna stats
  - Frontend muestra dashboard sin errores

- [ ] **Crear Agent funciona**
  - POST `/api/v1/ai/agents` crea agent exitosamente

- [ ] **Ejecutar Tarea Simple**
  - POST `/api/v1/ai/tasks` con datos no sensibles
  - Resultado: auto-complete, no requiere aprobación

- [ ] **Ejecutar Tarea Sensible (MPC)**
  - POST `/api/v1/ai/tasks` con SSN/credit card
  - Resultado: `mpc_used: true`, requiere aprobación

- [ ] **Ver Aprobaciones**
  - GET `/api/v1/ai/approvals` lista aprobaciones pendientes

- [ ] **Aprobar Tarea**
  - POST `/api/v1/ai/approvals/{id}/approve` funciona
  - Genera blockchain tx hash

- [ ] **Blockchain Audit**
  - GET `/api/v1/ai/blockchain/audit` muestra transacciones

---

## 🐛 Troubleshooting

### Error: "401 Unauthorized"
- Verifica que el token esté en el header: `Authorization: Bearer TOKEN`
- Verifica que el token no haya expirado (1 hora de validez)
- Haz login de nuevo

### Error: "403 Forbidden"
- Verifica que tu usuario tenga permisos:
  - `ai_agents_read`, `ai_agents_create`
  - `ai_tasks_create`, `ai_tasks_read`
  - `approvals_read`, `approvals_approve`
- Ejecuta: `docker compose exec backend flask init-roles`

### Error: "500 Internal Server Error"
- Revisa logs: `docker compose logs backend --tail 50`
- Verifica que las tablas existan:
  ```bash
  docker compose exec mysql mysql -u root -proot -e "USE portfolio_app_dev; SHOW TABLES LIKE 'tbl_ai%';"
  ```

### Dashboard no carga
- Verifica que estés logueado
- Abre DevTools (F12) y revisa la consola
- Verifica que el endpoint `/api/v1/ai/dashboard/stats` funcione en Postman

### No se crean agentes
- Verifica permisos: necesitas `ai_agents_create`
- Verifica que el backend esté corriendo: `docker compose ps`
- Revisa logs: `docker compose logs backend --tail 20`

---

## 📊 Endpoints Disponibles

### AI Agents
- `GET /api/v1/ai/agents` - Listar agentes
- `GET /api/v1/ai/agents/{id}` - Obtener agente
- `POST /api/v1/ai/agents` - Crear agente
- `PUT /api/v1/ai/agents/{id}` - Actualizar agente
- `DELETE /api/v1/ai/agents/{id}` - Eliminar agente

### AI Tasks
- `GET /api/v1/ai/tasks` - Listar tareas
- `GET /api/v1/ai/tasks/{id}` - Obtener tarea
- `POST /api/v1/ai/tasks` - Ejecutar tarea

### Approvals
- `GET /api/v1/ai/approvals` - Listar aprobaciones
- `GET /api/v1/ai/approvals/{id}` - Obtener aprobación
- `POST /api/v1/ai/approvals/{id}/approve` - Aprobar
- `POST /api/v1/ai/approvals/{id}/reject` - Rechazar

### Dashboard & Compliance
- `GET /api/v1/ai/dashboard/stats` - Estadísticas
- `GET /api/v1/ai/blockchain/audit` - Audit trail

### Policies
- `GET /api/v1/ai/policies` - Listar políticas
- `POST /api/v1/ai/policies` - Crear política

---

## 🎯 Flujo Completo de Demo

1. **Login** → Obtener token
2. **Crear Agent** → Copiar agent_id
3. **Ejecutar Tarea Simple** → Ver auto-complete
4. **Ejecutar Tarea Sensible** → Ver MPC + approval
5. **Ver Aprobación** → Dashboard o API
6. **Aprobar** → Ver blockchain tx
7. **Ver Stats** → Dashboard actualizado
8. **Ver Blockchain Audit** → Ver todas las decisiones

---

## ✅ Éxito

Si puedes completar todos los pasos, **¡la plataforma está funcionando correctamente!**

**Próximos pasos:**
- Crear más agentes de diferentes tipos
- Probar diferentes tipos de tareas
- Configurar políticas personalizadas
- Ver métricas en tiempo real

---

**¿Problemas?** Revisa los logs del backend:
```bash
docker compose logs backend -f
```

