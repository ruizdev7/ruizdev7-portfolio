# 🔑 Configuración de Secretos de GitHub para Deploy

## ❌ Problema Actual

El secreto `EC2_SSH_KEY_PORTFOLIO` no tiene el formato correcto. GitHub Actions no puede parsear la llave SSH.

**Error típico:** `ssh: no key found` o `error in libcrypto`

---

## ✅ Solución: Actualizar el Secreto Correctamente

### Método 1: Copiar con saltos de línea preservados (Recomendado)

1. **Abre tu terminal y verifica tu llave:**

```bash
# Encuentra tu llave SSH que funciona
ls -la ~/.ssh/

# Debería verse algo como:
# id_rsa, id_ed25519, tu_llave.pem, etc.
```

2. **Verifica que la llave funciona:**

```bash
# Reemplaza con tu llave y tu IP/dominio
ssh -i ~/.ssh/TU_LLAVE.pem ubuntu@TU_IP_EC2 "echo 'Test OK'"

# Si esto funciona, esa es la llave correcta
```

3. **Copia la llave AL PORTAPAPELES con formato correcto:**

```bash
# macOS
cat ~/.ssh/TU_LLAVE.pem | pbcopy

# Linux (requiere xclip)
cat ~/.ssh/TU_LLAVE.pem | xclip -selection clipboard

# Windows (PowerShell)
Get-Content ~/.ssh/TU_LLAVE.pem | Set-Clipboard
```

4. **Ve a GitHub:**
   - Navega a: `https://github.com/ruizdev7/ruizdev7-portfolio/settings/secrets/actions`
   - Click en `EC2_SSH_KEY_PORTFOLIO` > `Update secret`
   - **Pega directamente** desde el portapapeles (Cmd+V / Ctrl+V)
   - **NO MODIFIQUES NADA** después de pegar
   - Click en `Update secret`

---

### Método 2: Usar formato con \n explícitos

Si el Método 1 no funciona, puedes convertir la llave a un formato de una sola línea con `\n`:

```bash
# Convertir la llave a una sola línea con \n
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ~/.ssh/TU_LLAVE.pem | pbcopy
```

Luego pega esto en GitHub Secrets. El workflow lo interpretará correctamente con `printf '%b\n'`.

---

### Método 3: Base64 (Más robusto)

Si los métodos anteriores no funcionan, usa base64:

1. **Codificar tu llave en base64:**

```bash
# macOS / Linux
base64 -i ~/.ssh/TU_LLAVE.pem | tr -d '\n' | pbcopy

# Esto crea una llave codificada en una sola línea
```

2. **En GitHub, crea un NUEVO secreto:**
   - Nombre: `EC2_SSH_KEY_BASE64`
   - Valor: Pega el contenido del portapapeles

3. **Actualiza el workflow** para usar base64:

```yaml
- name: Setup SSH key from base64
  run: |
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    echo "${{ secrets.EC2_SSH_KEY_BASE64 }}" | base64 -d > ~/.ssh/deploy_key
    chmod 600 ~/.ssh/deploy_key
```

---

## 🧪 Verificar el Formato de la Llave

Tu llave SSH debe verse así:

### Llave RSA (AWS .pem típica):
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
(muchas líneas de texto base64)
...xyz123
-----END RSA PRIVATE KEY-----
```

### Llave OpenSSH (ed25519):
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
(muchas líneas de texto base64)
...AAAAAEC
-----END OPENSSH PRIVATE KEY-----
```

**Características importantes:**
- ✅ Debe tener headers y footers (-----BEGIN/END-----)
- ✅ Debe tener múltiples líneas
- ✅ No debe tener espacios al principio o final
- ✅ Cada línea de contenido tiene ~64 caracteres (excepto la última)
- ❌ NO debe estar en una sola línea gigante
- ❌ NO debe tener caracteres extra o modificaciones

---

## 📋 Checklist de Secretos Requeridos

Verifica que tengas todos estos secretos configurados:

| Secreto | Estado | Descripción |
|---------|--------|-------------|
| `EC2_HOST` | ⬜ | IP o dominio de tu EC2 |
| `EC2_USER` | ⬜ | Usuario SSH (ubuntu/ec2-user) |
| `EC2_SSH_KEY_PORTFOLIO` | ⬜ | Llave privada SSH completa |
| `DOCKERHUB_USERNAME` | ⬜ | Tu usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | ⬜ | Token de Docker Hub |

---

## 🔍 Debugging en GitHub Actions

Cuando ejecutes el workflow, verás esta salida:

```
🔍 Verificando formato de la llave...
Líneas detectadas: 27
✅ Formato correcto detectado
-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----
```

Si ves esto, el formato es correcto. Si ves un error, el secreto necesita actualizarse.

---

## 🎯 Test Rápido

Después de actualizar el secreto:

1. Ve a: `https://github.com/ruizdev7/ruizdev7-portfolio/actions`
2. El último workflow debería estar corriendo
3. Click en el workflow > `Deploy to EC2` job
4. Busca la sección "Setup SSH key properly"
5. Deberías ver: ✅ Formato correcto detectado
6. Luego en "Test SSH connection": ✅ Conexión SSH exitosa

Si ambos pasan, el deploy continuará automáticamente.

---

## 🚨 Troubleshooting

### Error: "ssh: no key found"
**Causa:** El secreto tiene formato incorrecto  
**Solución:** Actualizar el secreto usando Método 1 o 2

### Error: "Permission denied (publickey)"
**Causa:** La llave es correcta pero no coincide con el servidor  
**Solución:** Verificar que estás usando la llave correcta que funciona localmente

### Error: "Host key verification failed"
**Causa:** El host EC2 no está en known_hosts  
**Solución:** El workflow ya maneja esto, pero verifica `EC2_HOST` secret

### El workflow muestra: "❌ ERROR: Formato de llave inválido"
**Causa:** La llave no comienza con -----BEGIN  
**Solución:** El secreto está completamente mal, usa Método 1 para copiarlo correctamente

---

## 💡 Tip Pro

Si sigues teniendo problemas, crea un issue en GitHub o contacta al administrador con:
- Screenshot del error en Actions
- Primera línea de tu llave local: `head -1 ~/.ssh/TU_LLAVE.pem`
- Número de líneas: `wc -l ~/.ssh/TU_LLAVE.pem`

**Nunca compartas** la llave completa públicamente.

