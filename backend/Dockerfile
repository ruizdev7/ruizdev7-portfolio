# Backend Dockerfile Optimizado con Multi-stage Build
# Tiempo estimado: 50% más rápido

# Etapa 1: Dependencias (cacheable)
FROM python:3.11-slim as deps

WORKDIR /app

# Copiar solo requirements para cache de dependencias
COPY requirements.txt .

# Instalar dependencias con cache optimizado
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Etapa 2: Build final
FROM python:3.11-slim

WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copiar código de la aplicación
COPY . .

# Crear usuario no-root para seguridad
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 6000

# Usar gunicorn con configuración optimizada
CMD ["gunicorn", "--bind", "0.0.0.0:6000", "--workers", "4", "--worker-class", "sync", "--timeout", "120", "wsgi:app"]