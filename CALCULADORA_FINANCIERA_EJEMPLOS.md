# 📊 Calculadora Financiera - Ejemplos de Uso

## 🎯 Tipos de Cálculos Disponibles

### 1. **Valor Presente (VP)**
**¿Qué calcula?** El valor actual de una inversión futura.

**Fórmula:** `VP = VF / (1 + r)^n`

**Ejemplo Práctico:**
- **Escenario:** Quieres saber cuánto invertir hoy para tener $50,000 en 5 años
- **Valor Futuro:** $50,000
- **Tasa de Interés:** 8% anual
- **Períodos:** 5 años
- **Resultado:** Necesitas invertir $34,029.16 hoy

**Casos de Uso:**
- Planificación de jubilación
- Objetivos de ahorro a largo plazo
- Evaluación de inversiones futuras

---

### 2. **Valor Futuro (VF)**
**¿Qué calcula?** El valor que tendrá una inversión actual en el futuro.

**Fórmula:** `VF = VP × (1 + r)^n`

**Ejemplo Práctico:**
- **Escenario:** Tienes $10,000 y quieres saber cuánto tendrás en 10 años
- **Valor Presente:** $10,000
- **Tasa de Interés:** 6% anual
- **Períodos:** 10 años
- **Resultado:** Tendrás $17,908.48

**Casos de Uso:**
- Proyección de crecimiento de inversiones
- Planificación de objetivos financieros
- Comparación de opciones de inversión

---

### 3. **Anualidades**
**¿Qué calcula?** El valor presente de una serie de pagos regulares.

**Fórmula:** `VP = P × [(1 - (1 + r)^-n) / r]`

**Ejemplo Práctico:**
- **Escenario:** Quieres saber el valor presente de recibir $1,000 mensuales por 3 años
- **Pago de Anualidad:** $1,000
- **Tasa de Interés:** 5% anual
- **Períodos:** 36 meses
- **Resultado:** El valor presente es $33,365.35

**Casos de Uso:**
- Evaluación de pensiones
- Análisis de rentas vitalicias
- Planificación de ingresos pasivos

---

### 4. **Interés Compuesto**
**¿Qué calcula?** El crecimiento de una inversión con capitalización periódica.

**Fórmula:** `A = P × (1 + r/n)^(n×t)`

**Ejemplo Práctico:**
- **Escenario:** Inviertes $5,000 con capitalización trimestral
- **Inversión Inicial:** $5,000
- **Tasa de Interés:** 7% anual
- **Períodos:** 4 años
- **Frecuencia:** 4 (trimestral)
- **Resultado:** Tendrás $6,598.93

**Casos de Uso:**
- Inversiones en fondos mutuos
- Cuentas de ahorro con capitalización
- Planificación de inversiones a largo plazo

---

### 5. **Amortización**
**¿Qué calcula?** La tabla de pagos de un préstamo con desglose de capital e interés.

**Ejemplo Práctico:**
- **Escenario:** Préstamo hipotecario
- **Monto del Préstamo:** $200,000
- **Tasa de Interés:** 4.5% anual
- **Plazo:** 20 años
- **Resultado:** 
  - Pago mensual: $1,266.71
  - Total de intereses: $103,610.40
  - Total a pagar: $303,610.40

**Casos de Uso:**
- Préstamos hipotecarios
- Préstamos de auto
- Planificación de pagos de deuda

---

## 🚀 Cómo Usar la Calculadora

### Paso 1: Seleccionar Tipo de Cálculo
1. Ve a la sección "Selecciona el Tipo de Cálculo"
2. Haz clic en el tipo que necesitas
3. Lee el ejemplo que aparece en cada tarjeta

### Paso 2: Completar el Formulario
1. **Título:** Dale un nombre descriptivo a tu cálculo
2. **Descripción:** (Opcional) Añade notas adicionales
3. **Campos específicos:** Completa según el tipo de cálculo seleccionado

### Paso 3: Calcular
1. Haz clic en "Calcular"
2. Espera a que se procese el resultado
3. Revisa los detalles del cálculo

### Paso 4: Interpretar Resultados
- **Valor principal:** El resultado principal del cálculo
- **Detalles:** Información adicional como factores de descuento, intereses totales, etc.
- **Tabla de amortización:** (Solo para préstamos) Desglose mes a mes

---

## 💡 Consejos de Uso

### Para Inversiones:
- Usa **Valor Futuro** para proyectar el crecimiento de tus ahorros
- Usa **Valor Presente** para evaluar si una inversión futura vale la pena hoy

### Para Préstamos:
- Usa **Amortización** para entender el costo real de un préstamo
- Compara diferentes tasas y plazos

### Para Planificación:
- Usa **Anualidades** para evaluar ingresos pasivos
- Usa **Interés Compuesto** para maximizar el crecimiento de inversiones

---

## 🔧 Características Técnicas

### Validaciones:
- ✅ Todos los campos numéricos son obligatorios
- ✅ Los valores deben ser positivos
- ✅ Las tasas de interés tienen límites razonables
- ✅ Los períodos de tiempo son enteros

### Seguridad:
- 🔒 Autenticación JWT requerida
- 🔒 Cada usuario solo ve sus propios cálculos
- 🔒 Validación de datos en frontend y backend

### Persistencia:
- 💾 Todos los cálculos se guardan automáticamente
- 💾 Historial completo de cálculos realizados
- 💾 Posibilidad de editar y eliminar cálculos

---

## 📱 Responsive Design

La calculadora está optimizada para:
- 💻 **Desktop:** Experiencia completa con todas las funciones
- 📱 **Mobile:** Interfaz adaptada para pantallas pequeñas
- 🎨 **Tema:** Diseño consistente con el resto de la aplicación

---

## 🆘 Solución de Problemas

### Error: "Datos de entrada inválidos"
- Verifica que todos los campos estén completos
- Asegúrate de que los valores sean números positivos
- Revisa que las tasas de interés estén en porcentaje (ej: 5 para 5%)

### Error: "Error en el cálculo"
- Verifica que la tasa de interés no sea demasiado alta
- Asegúrate de que los períodos sean números enteros
- Revisa que los valores sean realistas

### Problemas de conexión:
- Verifica que estés autenticado
- Asegúrate de que el backend esté funcionando
- Revisa tu conexión a internet

---

¡Disfruta usando la calculadora financiera! 🎉
