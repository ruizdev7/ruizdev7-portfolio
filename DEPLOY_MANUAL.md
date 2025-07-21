# Manual de Deploy CI/CD con GitHub Actions y Docker

Este manual describe el flujo de trabajo para desplegar tu proyecto usando GitHub Actions y Docker, cubriendo los casos de cambios normales, releases con versión y operaciones comunes de mantenimiento.

---

## A) Cambios normales (sin release/tag)

1. **Haz tus cambios en el código**
   ```sh
   # Edita archivos según lo que necesites
   ```

2. **Agrega y haz commit de los cambios**
   ```sh
   git add .
   git commit -m "Descripción de los cambios"
   ```

3. **Sube los cambios a la rama principal**
   ```sh
   git push origin main
   ```

4. **¿Qué sucede?**
   - El workflow de GitHub Actions construirá y subirá imágenes Docker con el hash del commit (si tu workflow está configurado para ello).
   - El deploy en EC2 intentará usar la imagen con el hash del commit.
   - **No se crea una versión formal ni una imagen con tag de versión.**

---

## B) Publicar una nueva versión (release con tag)

1. **Haz tus cambios en el código**
   ```sh
   # Edita archivos según lo que necesites
   ```

2. **Agrega y haz commit de los cambios**
   ```sh
   git add .
   git commit -m "Preparando release vX.Y.Z"
   ```

3. **Sube los cambios a la rama principal**
   ```sh
   git push origin main
   ```

4. **Crea una tag de versión (anotada)**
   ```sh
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   # Ejemplo real:
   # git tag -a v1.0.2 -m "Release v1.0.2"
   ```

5. **Sube la tag a GitHub**
   ```sh
   git push origin vX.Y.Z
   # Ejemplo real:
   # git push origin v1.0.2
   ```

6. **¿Qué sucede?**
   - El workflow de GitHub Actions construirá y subirá imágenes Docker con la tag de versión (`vX.Y.Z`) y, si está configurado, también con el hash del commit.
   - El deploy en EC2 actualizará el `docker-compose.yml` para usar la imagen con la tag de versión y levantará los contenedores con esa versión.
   - **Esta es la forma recomendada para releases formales.**

---

## C) Rollback (volver a una versión anterior)

1. **Identifica la versión/tag a la que quieres volver**  
   Por ejemplo, `v1.0.1`.

2. **Actualiza el `docker-compose.yml` en tu servidor EC2**  
   Cambia la línea de la imagen para backend y frontend:
   ```yaml
   image: ruizdev7/portfolio-backend:v1.0.1
   image: ruizdev7/portfolio-frontend:v1.0.1
   ```

3. **Reinicia los servicios**
   ```sh
   docker compose pull
   docker compose down
   docker compose up -d
   ```

---

## D) Eliminación de tags (versiones) en Git y Docker Hub

### **Eliminar una tag localmente**
```sh
git tag -d v1.0.2
```

### **Eliminar una tag en remoto (GitHub)**
```sh
git push origin --delete v1.0.2
```

### **Eliminar una imagen/tag en Docker Hub**
1. Ve a Docker Hub y entra al repositorio correspondiente.
2. Ve a la pestaña **Tags**.
3. Busca la tag que quieres eliminar y haz clic en el ícono de la papelera.

---

## E) Revisión de logs en EC2

### **Ver logs de los contenedores**
```sh
docker compose logs backend
docker compose logs frontend
```
O para ver todos los logs:
```sh
docker compose logs
```

### **Ver logs en tiempo real**
```sh
docker compose logs -f backend
```

### **Ver el estado de los contenedores**
```sh
docker ps
```

---

## Resumen visual

| Acción                | Comando(s) clave                                 | Resultado en Docker Hub / EC2         |
|-----------------------|--------------------------------------------------|---------------------------------------|
| Commit normal         | `git commit` + `git push origin main`            | Imagen con hash del commit            |
| Release con versión   | `git tag -a vX.Y.Z ...` + `git push origin vX.Y.Z` | Imagen con tag `vX.Y.Z` (y hash si aplica) |
| Rollback              | Editar compose + `docker compose up -d`          | Vuelve a versión anterior             |
| Eliminar tag (Git)    | `git tag -d` + `git push origin --delete`        | Elimina release en GitHub             |
| Eliminar tag (Docker) | Papelera en Docker Hub                           | Elimina imagen/tag en Docker Hub      |

---

**Recuerda:**  
- Siempre revisa la pestaña Actions en GitHub para ver el estado de los workflows.
- En Docker Hub verás las imágenes con el hash del commit y/o la tag de versión, según tu configuración.
- En tu servidor EC2, los contenedores se actualizarán automáticamente si el deploy está bien configurado.

--- 