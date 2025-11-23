# Cómo Probar el Envío de Emails

## ¿Qué es el Modo Testing?

El modo testing **NO envía emails reales**. Solo muestra cómo se vería el email en la consola (logs del backend). 

**Ventaja:** Puedes probar sin necesidad de configurar credenciales de Outlook.

## Modo Testing (Recomendado para empezar)

### 1. Configura `.env.development`:

```bash
MAIL_SUPPRESS_SEND=True
FRONTEND_URL=http://localhost:5173
```

**No necesitas** configurar `MAIL_USERNAME`, `MAIL_PASSWORD`, etc. en este modo.

### 2. Reinicia el backend:

```bash
docker compose -f docker-compose.development.yml restart backend
```

### 3. Abre los logs:

```bash
docker compose -f docker-compose.development.yml logs backend --follow
```

### 4. Prueba desde el frontend:

1. Ve a `http://localhost:5173`
2. Settings > Security
3. Click en "Request password reset"
4. Ingresa un email válido de tu base de datos
5. **NO se enviará email**, pero verás en los logs algo como:

```
================================================================================
📧 EMAIL SUPPRESSED (TESTING MODE)
================================================================================
To: usuario@example.com
From: tu-email@outlook.com
Subject: Password Reset Request
--------------------------------------------------------------------------------
BODY (Plain Text):
Password Reset Request

Hello Joseph,

You requested to reset your password...
--------------------------------------------------------------------------------
HTML Content:
<html>...</html>
--------------------------------------------------------------------------------
Reset Token: abc123xyz...
Reset Link: http://localhost:5173/auth/reset-password?token=abc123xyz...
================================================================================
✅ Email would have been sent (but suppressed for testing)
```

---

## Modo Real (Envía emails de verdad)

### 1. Configura `.env.development`:

```bash
MAIL_SUPPRESS_SEND=False
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu-email@outlook.com
MAIL_PASSWORD=tu-contraseña-outlook
MAIL_DEFAULT_SENDER=tu-email@outlook.com
FRONTEND_URL=http://localhost:5173
```

### 2. Reinicia el backend:

```bash
docker compose -f docker-compose.development.yml restart backend
```

### 3. Prueba igual que antes:

Ahora **SÍ se enviará** el email real a la bandeja de entrada del destinatario.

---

## Resumen Rápido

| Modo | MAIL_SUPPRESS_SEND | ¿Envía emails? | ¿Necesita credenciales? |
|------|-------------------|----------------|------------------------|
| **Testing** | `True` | ❌ NO | ❌ NO |
| **Real** | `False` | ✅ SÍ | ✅ SÍ |

---

## Configuración con Gmail (Alternativa más fácil)

Si prefieres usar Gmail en lugar de Outlook (es más fácil de configurar), sigue estos pasos:

### 1. Genera una contraseña de aplicación de Gmail

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Ve a **Seguridad**
3. Activa la **verificación en dos pasos** (si no la tienes activada)
4. Busca **Contraseñas de aplicaciones** y genera una para "Correo"
5. Copia la contraseña de 16 caracteres que te genere

### 2. Configura `.env.development` con Gmail:

```bash
MAIL_SUPPRESS_SEND=False
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicación-generada
MAIL_DEFAULT_SENDER=tu-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

### 3. Reinicia el backend:

```bash
docker compose -f docker-compose.development.yml restart backend
```

### 4. Listo ✅

Ahora los emails se enviarán a través de Gmail.

**Nota:** La contraseña de aplicación es diferente a la contraseña normal de Gmail. Es una contraseña especial de 16 caracteres que debes generar específicamente para esta aplicación.

---

## Recomendación

**Empieza con modo Testing** para verificar que todo funciona correctamente, y luego cambia a modo Real cuando quieras enviar emails de verdad.

**Para producción:** Gmail es más fácil de configurar que Outlook, pero Outlook también funciona bien.

