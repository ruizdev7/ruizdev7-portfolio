# Frontend Dockerfile Optimizado con Multi-stage Build
# Tiempo estimado: 60% más rápido

# Etapa 1: Dependencias (cacheable)
FROM node:18-alpine AS deps

WORKDIR /app

# Copiar solo package files para cache de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
# Usamos npm install para evitar fallos con package-lock desincronizado y peers
RUN npm install --include=dev --prefer-offline --no-audit --legacy-peer-deps

# Etapa 2: Build de la aplicación
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

    # Build optimizado
    RUN npm run build

# Etapa 3: Servidor de producción
FROM nginx:alpine

# Copiar configuración de Nginx optimizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]