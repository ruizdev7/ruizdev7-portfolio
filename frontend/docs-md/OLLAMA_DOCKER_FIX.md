# Solución: Ollama con Docker

## Problema
Ollama está escuchando solo en `localhost:11434`, lo que impide que los contenedores Docker accedan a él.

## Solución 1: Configurar Ollama para escuchar en todas las interfaces (Recomendado)

### En macOS:

1. **Detener Ollama**:
   ```bash
   pkill ollama
   ```

2. **Configurar variable de entorno y reiniciar**:
   ```bash
   export OLLAMA_HOST=0.0.0.0:11434
   ollama serve
   ```

3. **O hacerlo permanente** (agregar a `~/.zshrc` o `~/.bash_profile`):
   ```bash
   echo 'export OLLAMA_HOST=0.0.0.0:11434' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Reiniciar Ollama**:
   ```bash
   ollama serve
   ```

### Verificar que funciona:

```bash
# Desde tu Mac
curl http://localhost:11434/api/tags

# Desde el contenedor Docker
docker compose exec backend python3 -c "
from openai import OpenAI
client = OpenAI(base_url='http://host.docker.internal:11434/v1', api_key='ollama')
print(client.models.list())
"
```

## Solución 2: Usar variable de entorno en Docker

Agrega a `backend/.env.development`:

```env
OLLAMA_BASE_URL=http://host.docker.internal:11434/v1
```

**Nota**: Esto solo funciona si Ollama está configurado para escuchar en todas las interfaces (Solución 1).

## Solución 3: Usar la IP del host directamente

Si `host.docker.internal` no funciona, puedes usar la IP de tu Mac:

1. **Obtener la IP de tu Mac**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
   ```

2. **Configurar en el agente** o en `.env.development`:
   ```env
   OLLAMA_BASE_URL=http://TU_IP_MAC:11434/v1
   ```

## Verificación

Después de aplicar la Solución 1, verifica:

```bash
# Verificar que Ollama escucha en todas las interfaces
lsof -i :11434
# Debería mostrar: TCP *:11434 (LISTEN) en lugar de TCP localhost:11434

# Probar desde Docker
docker compose exec backend python3 -c "
import requests
r = requests.get('http://host.docker.internal:11434/api/tags')
print(r.json())
"
```

## Seguridad

⚠️ **Nota de seguridad**: Al configurar Ollama para escuchar en `0.0.0.0`, estará accesible desde cualquier dispositivo en tu red local. Esto está bien para desarrollo, pero en producción considera usar un firewall o VPN.

