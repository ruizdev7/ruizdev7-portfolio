# Ejemplos de Tareas que Requieren Aprobación

## Criterios para Aprobación

Una tarea requiere aprobación si cumple **al menos uno** de estos criterios:

1. **Confianza baja**: `confidence < confidence_threshold` (por defecto 0.70)
2. **Datos sensibles**: Contiene SSN, tarjeta de crédito, email, teléfono, o número de cuenta
3. **Tipo de alto riesgo**: `financial_transaction`, `legal_decision`, o `medical_diagnosis`

---

## Ejemplo 1: Tipo de Tarea de Alto Riesgo (MÁS FÁCIL)

**Tipo de Tarea**: `financial_transaction`

**Input Data (JSON)**:
```json
{
  "transaction_type": "wire_transfer",
  "amount": 50000,
  "from_account": "ACC-12345",
  "to_account": "ACC-67890",
  "description": "Payment for services"
}
```

**Por qué requiere aprobación**: El tipo `financial_transaction` está en la lista de tipos de alto riesgo.

---

## Ejemplo 2: Datos Sensibles (FÁCIL)

**Tipo de Tarea**: `financial_analysis` (o cualquier tipo)

**Input Data (JSON)**:
```json
{
  "customer_email": "customer@example.com",
  "transaction_amount": 1000,
  "description": "Monthly subscription"
}
```

**Por qué requiere aprobación**: Contiene un email, que es detectado como dato sensible.

**Otros ejemplos de datos sensibles**:
- Email: `"user@example.com"`
- Teléfono: `"555-123-4567"` o `"5551234567"`
- SSN: `"123-45-6789"`
- Tarjeta de crédito: `"4532-1234-5678-9010"`
- Número de cuenta: Cualquier número de 8-17 dígitos

---

## Ejemplo 3: Combinación (GARANTIZADO)

**Tipo de Tarea**: `financial_transaction`

**Input Data (JSON)**:
```json
{
  "customer_email": "john.doe@example.com",
  "phone": "555-123-4567",
  "transaction_type": "payment",
  "amount": 25000,
  "account_number": "1234567890123456"
}
```

**Por qué requiere aprobación**: 
- Tipo de alto riesgo (`financial_transaction`)
- Datos sensibles (email, teléfono, número de cuenta)

---

## Ejemplo 4: Decisión Legal (ALTO RIESGO)

**Tipo de Tarea**: `legal_decision`

**Input Data (JSON)**:
```json
{
  "case_type": "contract_review",
  "contract_terms": "Review the following terms...",
  "party_a": "Company A",
  "party_b": "Company B"
}
```

**Por qué requiere aprobación**: El tipo `legal_decision` está en la lista de tipos de alto riesgo.

---

## Ejemplo 5: Diagnóstico Médico (ALTO RIESGO)

**Tipo de Tarea**: `medical_diagnosis`

**Input Data (JSON)**:
```json
{
  "symptoms": ["fever", "headache", "fatigue"],
  "patient_age": 45,
  "medical_history": "No significant history"
}
```

**Por qué requiere aprobación**: El tipo `medical_diagnosis` está en la lista de tipos de alto riesgo.

---

## Cómo Probar

1. Ve a **AI Governance > Tasks**
2. Crea una nueva tarea
3. Selecciona un agente
4. Usa uno de los ejemplos de arriba:
   - **Tipo de Tarea**: `financial_transaction`, `legal_decision`, o `medical_diagnosis`
   - **Input Data**: Copia uno de los JSON de arriba
5. Ejecuta la tarea
6. La tarea debería cambiar a estado `awaiting_approval`
7. Ve a **AI Governance > Approvals** para ver la solicitud de aprobación

---

## Verificar Configuración

Si las tareas no requieren aprobación, verifica:

1. **Configuración de Aprobaciones** (`/ai-governance/approval-settings`):
   - Umbral de confianza: Debe ser <= 0.70
   - Tipos de alto riesgo: Debe incluir `financial_transaction`, `legal_decision`, `medical_diagnosis`
   - Requerir aprobación para datos sensibles: Debe estar activado

2. **Logs del Backend**: Revisa los logs para ver:
   - Si se detectaron datos sensibles
   - El score de confianza
   - Si se creó una solicitud de aprobación

---

## Notas

- El sistema detecta automáticamente datos sensibles usando expresiones regulares
- Los tipos de alto riesgo se pueden configurar en Approval Settings
- Si la auto-aprobación está habilitada y la confianza es muy alta (>= 0.95), la tarea se aprobará automáticamente

