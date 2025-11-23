# 🚀 AI Governance Platform - Deployment Guide

## Resumen Ejecutivo

La **AI Governance Platform** está completamente implementada y lista para deployment. Este documento te guiará paso a paso para poner la plataforma en funcionamiento.

---

## 📋 Pre-requisitos

✅ Docker Desktop corriendo  
✅ Docker Compose instalado  
✅ MySQL container activo  
✅ OpenAI API Key configurada (opcional para demo)

---

## 🔧 Paso 1: Aplicar Migraciones de Base de Datos

```bash
# Levantar containers (si no están corriendo)
cd /Users/ruizdev7/Documents/GitHub/ruizdev7-portfolio
docker-compose up -d

# Aplicar migración de AI Governance tables
docker-compose exec backend flask db upgrade

# Verificar que las tablas se crearon
docker-compose exec mysql mysql -u root -p -e "USE portfolio_db; SHOW TABLES LIKE 'tbl_ai%';"
```

**Tablas esperadas:**
- `tbl_ai_agents`
- `tbl_ai_tasks`
- `tbl_human_approvals`
- `tbl_policies`
- `tbl_blockchain_audit`
- `tbl_mpc_operations`

---

## 🔑 Paso 2: Inicializar Permisos RBAC

```bash
# Crear permisos de AI Governance
docker-compose exec backend flask init-roles

# Verificar permisos creados
docker-compose exec mysql mysql -u root -p -e "
USE portfolio_db; 
SELECT permission_name FROM tbl_permissions WHERE resource IN ('ai_agents', 'ai_tasks', 'approvals', 'policies');
"
```

**Permisos esperados (12 nuevos):**
- `ai_agents_create`, `ai_agents_read`, `ai_agents_update`, `ai_agents_delete`
- `ai_tasks_create`, `ai_tasks_read`
- `approvals_read`, `approvals_approve`
- `policies_create`, `policies_read`, `policies_update`, `policies_delete`

---

## 🤖 Paso 3: Crear Tu Primer AI Agent

### Opción A: Via API (Postman/curl)

```bash
# 1. Login para obtener token
curl -X POST http://localhost:5000/api/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "tu_password"
  }'

# 2. Crear AI Agent
curl -X POST http://localhost:5000/api/v1/ai/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Financial Analyzer",
    "agent_type": "financial",
    "description": "Analyzes financial data and detects anomalies",
    "model_name": "gpt-4",
    "confidence_threshold": 0.75,
    "status": "active"
  }'
```

### Opción B: Via Frontend

1. Abre `http://localhost:5173` (o tu puerto de Vite)
2. Login como admin
3. Navega a **AI Governance Dashboard**
4. Click "Create New Agent"
5. Llena el formulario

---

## 🧪 Paso 4: Ejecutar Primera Tarea IA

### Ejemplo 1: Análisis Financiero (Datos NO Sensibles)

```bash
curl -X POST http://localhost:5000/api/v1/ai/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agent_id": "TU_AGENT_ID",
    "task_type": "financial_analysis",
    "task_name": "Q4 Revenue Analysis",
    "input_data": {
      "revenue": 150000,
      "expenses": 95000,
      "quarter": "Q4",
      "year": 2024
    }
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "task_id": "abc-123-def-456",
  "confidence": 0.85,
  "requires_approval": false,
  "status": "completed",
  "result": {
    "output": "Analysis of Q4 2024 shows positive profit margin...",
    "model": "gpt-4"
  },
  "mpc_used": false,
  "blockchain_tx_hash": "0x1234..."
}
```

### Ejemplo 2: Análisis con Datos Sensibles (Activa MPC)

```bash
curl -X POST http://localhost:5000/api/v1/ai/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agent_id": "TU_AGENT_ID",
    "task_type": "data_extraction",
    "task_name": "Extract Customer Info",
    "input_data": {
      "customer_name": "John Doe",
      "ssn": "123-45-6789",
      "credit_card": "4532 1234 5678 9012",
      "email": "john.doe@example.com"
    }
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "task_id": "xyz-789-abc-012",
  "confidence": 0.68,
  "requires_approval": true,
  "status": "awaiting_approval",
  "is_sensitive": true,
  "mpc_used": true,
  "mpc_metadata": {
    "nodes_used": 3,
    "total_nodes": 5,
    "threshold": 3,
    "input_hash": "sha256:...",
    "result_hash": "sha256:..."
  },
  "blockchain_tx_hash": "0x5678..."
}
```

---

## 👨‍💼 Paso 5: Aprobar/Rechazar Tareas

### Ver Aprobaciones Pendientes

```bash
curl -X GET "http://localhost:5000/api/v1/ai/approvals?assigned_only=true&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Aprobar Tarea

```bash
curl -X POST http://localhost:5000/api/v1/ai/approvals/APPROVAL_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "justification": "Reviewed and verified. Data extraction is accurate."
  }'
```

### Rechazar Tarea

```bash
curl -X POST http://localhost:5000/api/v1/ai/approvals/APPROVAL_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "justification": "Sensitive data should not be processed at this time."
  }'
```

---

## 📊 Paso 6: Ver Dashboard y Estadísticas

### Dashboard Stats

```bash
curl -X GET http://localhost:5000/api/v1/ai/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_agents": 3,
    "active_agents": 2,
    "total_tasks": 15,
    "tasks_today": 5,
    "pending_approvals": 2,
    "average_confidence": 0.82,
    "mpc_operations_count": 3,
    "blockchain_blocks": 12,
    "automation_rate": 73.33
  }
}
```

### Blockchain Audit Trail

```bash
curl -X GET "http://localhost:5000/api/v1/ai/blockchain/audit?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Verificación de Funcionalidad

### Test 1: Verificar MPC funciona

```bash
# Ejecutar test unitario de MPC
docker-compose exec backend python -c "
from portfolio_app.services.mpc_service import test_mpc_service
test_mpc_service()
"
```

**Output esperado:**
```
Original data: {'user_id': 12345, 'ssn': '123-45-6789', 'credit_score': 750}

✅ MPC Computation Complete
Nodes used: 3/5
Input hash: a1b2c3d4e5f6...
Result hash: 9z8y7x6w5v4u...
Proof type: shamir-mpc-zkp

✅ Verification: PASSED
```

### Test 2: Verificar Blockchain funciona

```bash
# Ejecutar test unitario de Blockchain
docker-compose exec backend python -c "
from portfolio_app.services.blockchain_service import test_blockchain_service
test_blockchain_service()
"
```

**Output esperado:**
```
✅ Blockchain initialized
Genesis block hash: 0012a4f8b3c9d7e6...

✅ Transaction added: a9f3e2d1c0b5a4f3...
✅ Block mined: #1 - 00a1b2c3d4e5f6g7...

✅ Blockchain valid: True
✅ Transaction found in block #1
   Confirmations: 1
```

### Test 3: Verificar AI Agent funciona

```bash
# Ver logs del backend en tiempo real
docker-compose logs -f backend
```

Ejecuta una tarea y observa los logs:
```
🔒 Task abc-123: Sensitive data detected (['ssn', 'credit_card'])
   Using MPC for privacy protection...
   ✅ MPC complete: 3 nodes used

🤖 Executing AI model: gpt-4
   ✅ Model execution complete (confidence: 68%)

⏳ Task requires human approval (confidence: 68%)

⛓️  Logging to blockchain...
   ✅ Blockchain tx: 0x1234abcd...

📋 Approval request created: approval-xyz-789
```

---

## 🌐 Acceder al Frontend

### Dashboard Principal

```
URL: http://localhost:5173/ai-governance

Features visibles:
- Total de agentes activos
- Tareas ejecutadas hoy
- Aprobaciones pendientes
- Tasa de automatización
- Operaciones MPC
- Bloques blockchain
- Lista de agentes activos
- Cola de aprobaciones pendientes
```

### Navegar desde el menu principal

Si aún no está en el router, agrega a `App.jsx`:

```jsx
import AIGovernanceDashboard from './pages/ai-governance/AIGovernanceDashboard';

// En tus routes:
<Route path="/ai-governance" element={<AIGovernanceDashboard />} />
```

---

## 🐛 Troubleshooting

### Error: "Module not found: flask"

```bash
# Reinstalar dependencias en container
docker-compose exec backend pip install -r requirements.txt
docker-compose restart backend
```

### Error: "Table doesn't exist"

```bash
# Verificar migración aplicada
docker-compose exec backend flask db current

# Si no hay revision, aplicar manualmente
docker-compose exec backend flask db upgrade
```

### Error: "Permission denied"

```bash
# Verificar que tienes rol admin
docker-compose exec mysql mysql -u root -p -e "
USE portfolio_db;
SELECT u.username, r.role_name 
FROM tbl_users u 
JOIN tbl_user_roles ur ON u.id = ur.user_id 
JOIN tbl_roles r ON ur.role_id = r.ccn_role;
"

# Si no eres admin, ejecutar:
docker-compose exec backend flask init-roles
```

### Error: "OpenAI API key not found"

Para demo sin OpenAI:
- El sistema usa fallback automático
- Las respuestas serán mock data pero funcionales
- MPC y Blockchain seguirán funcionando

Para usar OpenAI real:
```bash
# Agregar a .env.development
echo "OPENAI_API_KEY=sk-your-key-here" >> backend/.env.development
docker-compose restart backend
```

---

## 📈 Métricas de Éxito

Después del deployment, verifica:

✅ **6 tablas** nuevas en MySQL  
✅ **12 permisos** nuevos en RBAC  
✅ **15+ endpoints** API funcionando  
✅ **Dashboard** cargando correctamente  
✅ **MPC** procesando datos sensibles  
✅ **Blockchain** minando bloques  
✅ **Aprobaciones** creándose automáticamente  

---

## 🎯 Demo Flow Completo

### Flujo End-to-End (5 minutos)

1. **Login** como admin → `http://localhost:5173/login`

2. **Ver Dashboard** → `http://localhost:5173/ai-governance`
   - Verás stats iniciales (todos en 0)

3. **Crear Agent** via Postman:
   ```json
   POST /api/v1/ai/agents
   {
     "name": "Demo Financial Agent",
     "agent_type": "financial",
     "confidence_threshold": 0.70
   }
   ```

4. **Ejecutar Tarea Simple** (auto-complete):
   ```json
   POST /api/v1/ai/tasks
   {
     "agent_id": "...",
     "task_type": "financial_analysis",
     "input_data": {"amount": 1000}
   }
   ```
   → Resultado: `status: "completed"`, `requires_approval: false`

5. **Ejecutar Tarea Sensible** (requiere aprobación):
   ```json
   POST /api/v1/ai/tasks
   {
     "agent_id": "...",
     "task_type": "data_extraction",
     "input_data": {
       "ssn": "123-45-6789",
       "name": "Test User"
     }
   }
   ```
   → Resultado: `status: "awaiting_approval"`, `mpc_used: true`

6. **Ver Aprobación Pendiente** en Dashboard
   - Refresh el dashboard
   - Verás "Pending Approvals: 1"

7. **Aprobar/Rechazar** via API o UI

8. **Ver Blockchain Audit**:
   ```bash
   GET /api/v1/ai/blockchain/audit
   ```
   → Verás todas las decisiones registradas

9. **Verificar Stats**:
   ```bash
   GET /api/v1/ai/dashboard/stats
   ```
   → Verás métricas actualizadas

---

## 🚀 ¡Listo para Producción!

La plataforma está **completamente funcional** para:

- ✅ Demo a inversionistas
- ✅ Proof of Concept
- ✅ Testing interno
- ✅ Desarrollo adicional

Para **producción real**, considera:
1. Usar blockchain real (Hyperledger Fabric)
2. Nodos MPC distribuidos
3. OpenAI API key configurada
4. Rate limiting
5. Monitoring (Prometheus/Grafana)
6. SSL/TLS certificates
7. Load balancing

---

## 📞 Soporte

Cualquier problema:
1. Revisar logs: `docker-compose logs backend`
2. Verificar MySQL: `docker-compose exec mysql mysql -u root -p`
3. Revisar permisos: `GET /api/v1/my-permissions`

**¡Todo listo para despegar! 🚀**

