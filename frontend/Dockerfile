# Etapa 1: Build de la app
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# EXPOSE 80 para servir la app
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]