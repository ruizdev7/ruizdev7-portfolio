# Configuración de Modelos Locales (Ollama)

Este proyecto ahora soporta modelos locales usando Ollama, lo que te permite ejecutar modelos de IA directamente en tu MacBook sin depender de APIs externas.

## Requisitos

- **Ollama instalado**: [Descargar Ollama](https://ollama.com/download)
- **MacBook con al menos 16GB de RAM** (recomendado)
- **Espacio en disco**: ~15GB para el modelo `gpt-oss-20b`

## Instalación

### 1. Instalar Ollama

```bash
# Descargar e instalar desde https://ollama.com/download
# O usando Homebrew:
brew install ollama
```

### 2. Descargar el modelo gpt-oss-20b

```bash
ollama pull gpt-oss-20b
```

### 3. Verificar que Ollama está corriendo

```bash
# Verificar que el servidor está activo
curl http://localhost:11434/api/tags

# Deberías ver una lista de modelos disponibles
```

## Configuración en el Proyecto

### Opción 1: Usar variable de entorno (Recomendado)

**IMPORTANTE**: Si estás usando Docker, necesitas usar `host.docker.internal` en lugar de `localhost`:

Agrega a tu archivo `.env` del backend:

```env
# Para Docker (acceso al host desde el contenedor)
OLLAMA_BASE_URL=http://host.docker.internal:11434/v1

# Si NO usas Docker (desarrollo local directo)
# OLLAMA_BASE_URL=http://localhost:11434/v1
```

### Opción 2: Configurar en el agente

Al crear o editar un agente en la interfaz, puedes:

1. **Método automático**: Usa `gpt-oss-20b` como nombre del modelo y el sistema detectará automáticamente que es un modelo local.

2. **Método manual**: 
   - Marca `use_local_model = True`
   - Configura `local_model_url = http://localhost:11434/v1`
   - Configura `local_model_name = gpt-oss-20b`

## Uso

### Crear un agente con modelo local

1. Ve a la sección de AI Governance > Agentes
2. Crea un nuevo agente
3. En el campo "Model Name", ingresa: `gpt-oss-20b`
4. El sistema detectará automáticamente que es un modelo local

### Modelos locales soportados

El sistema detecta automáticamente estos modelos como locales:
- `gpt-oss-20b`
- `llama2`
- `llama3`
- `mistral`
- Cualquier modelo que empiece con `local:`

### Verificar que funciona

1. Asegúrate de que Ollama esté corriendo:
   ```bash
   ollama serve
   ```

2. Crea una tarea usando el agente con modelo local
3. La tarea debería ejecutarse usando el modelo local en lugar de OpenAI

## Ventajas de usar modelos locales

✅ **Sin costos de API**: No gastas créditos de OpenAI  
✅ **Privacidad total**: Los datos nunca salen de tu máquina  
✅ **Baja latencia**: Respuestas más rápidas (sin latencia de red)  
✅ **Funciona offline**: No necesitas conexión a internet  
✅ **Sin límites de cuota**: Usa el modelo tanto como quieras  

## Desventajas

⚠️ **Rendimiento**: Puede ser más lento que OpenAI (depende de tu hardware)  
⚠️ **Calidad**: Los modelos locales pueden tener menor calidad que GPT-4  
⚠️ **Recursos**: Consume RAM y CPU de tu MacBook  

## Solución de problemas

### Error: "Connection refused"

- Verifica que Ollama esté corriendo: `ollama serve`
- Verifica la URL: `curl http://localhost:11434/api/tags`

### Error: "Model not found"

- Descarga el modelo: `ollama pull gpt-oss-20b`
- Verifica modelos disponibles: `ollama list`

### El modelo es muy lento

- Cierra otras aplicaciones para liberar RAM
- Considera usar un modelo más pequeño (ej: `llama2:7b`)

## Modelos alternativos más ligeros

Si `gpt-oss-20b` es muy pesado, puedes probar:

```bash
# Modelos más pequeños y rápidos
ollama pull llama2:7b
ollama pull mistral:7b
ollama pull llama3:8b
```

Luego cambia el `local_model_name` en tu agente a uno de estos modelos.

