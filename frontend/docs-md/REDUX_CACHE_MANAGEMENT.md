# 🔄 Gestión de Cache de Redux Persist

## 📋 Problema que esto soluciona

Cuando restauras la base de datos o actualizas datos importantes, los usuarios pueden seguir viendo datos antiguos cacheados en su navegador por Redux Persist.

---

## ✅ Solución Implementada

El `store.js` ahora está configurado para:

- ✅ **Solo persistir autenticación** (login del usuario)
- ❌ **NO persistir datos de APIs** (bombas, usuarios, posts, etc.)
- ✅ **Versionado automático** para invalidar cache cuando sea necesario
- ✅ **Migración automática** que limpia datos antiguos

---

## 🔧 Cómo invalidar el cache cuando sea necesario

### Caso 1: Restauraste la base de datos

Los usuarios seguirán viendo datos antiguos hasta que se despliegue la nueva versión del frontend.

**Solución:**

1. El nuevo código ya NO cachea datos de APIs
2. Despliega la nueva versión
3. Los usuarios verán datos frescos automáticamente

---

### Caso 2: Necesitas forzar limpieza de cache inmediata

Si necesitas que TODOS los usuarios limpien su cache SIN esperar al siguiente deploy:

**Opción A: Cambiar la versión en `store.js`**

```javascript
const persistConfig = {
  key: "root",
  version: 2, // ⬅️ Incrementar de 1 a 2
  storage,
  // ... resto del código
};
```

Esto invalidará automáticamente el cache de todos los usuarios.

**Opción B: Cambiar la key**

```javascript
const persistConfig = {
  key: "root-v2", // ⬅️ Cambiar de "root" a "root-v2"
  version: 1,
  storage,
  // ... resto del código
};
```

Redux Persist creará un nuevo storage e ignorará el anterior.

---

## 🐛 Debug: Ver qué hay en el cache del navegador

### En el navegador del usuario (DevTools):

```javascript
// Ver todo el localStorage
console.log(localStorage);

// Ver el estado de Redux Persist
console.log(localStorage.getItem('persist:root'));

// Ver el estado parseado
const persistedState = JSON.parse(localStorage.getItem('persist:root'));
console.log(persistedState);

// Ver versión actual
console.log(JSON.parse(persistedState._persist));
```

---

## 🧪 Testing después del cambio

### 1. Test local

```bash
# En desarrollo
npm run dev

# En el navegador:
# 1. Abre DevTools > Application > Local Storage
# 2. Busca "persist:root"
# 3. Verifica que SOLO contiene "auth" y "_persist"
# 4. NO debe contener datos de APIs
```

### 2. Test en producción

```bash
# Después del deploy
# En el navegador de producción:
# 1. Abre https://ruizdev7.com
# 2. Abre DevTools > Console
# 3. Ejecuta:
console.log(JSON.parse(localStorage.getItem('persist:root')));
# Debe mostrar SOLO auth y _persist
```

---

## 📊 Comparación: Antes vs Después

### ❌ Antes (Problemático)

```javascript
whitelist: [
  "auth",
  "pumpApi",      // ❌ Cacheaba 125 bombas antiguas
  "userApi",      // ❌ Cacheaba usuarios antiguos
  "postsApi",     // ❌ Cacheaba posts antiguos
  // ... más APIs
]
```

**Problema:** Datos desincronizados entre BD y UI

### ✅ Después (Corregido)

```javascript
whitelist: [
  "auth",  // ✅ Solo mantiene sesión
]
```

**Resultado:** Datos siempre frescos desde el servidor

---

## 🚨 Cuándo necesitas invalidar cache manualmente

### Escenarios comunes:

1. **Restauraste base de datos** → Incrementar `version`
2. **Cambio mayor en estructura de datos** → Incrementar `version`
3. **Bug crítico en datos cacheados** → Cambiar `key`
4. **Migraste de un servidor a otro** → Incrementar `version`

### Cuándo NO es necesario:

- ✅ Deploy normal de código
- ✅ Actualización de UI/estilos
- ✅ Cambios en lógica de negocio
- ✅ Agregar nuevas features

**Nota:** Con la nueva configuración, raramente necesitarás invalidar cache porque los datos NO se persisten.

---

## 🔄 Proceso completo de invalidación

```bash
# 1. Actualizar versión
# Editar frontend/src/RTK_Query_app/store.js
# Cambiar: version: 1 → version: 2

# 2. Commit y push
git add frontend/src/RTK_Query_app/store.js
git commit -m "chore: invalidar cache de Redux Persist"
git push origin main

# 3. El workflow de GitHub Actions desplegará automáticamente

# 4. Verificar en producción
# Los usuarios verán datos frescos al recargar la página
```

---

## 💡 Tips adicionales

### Limpiar cache individual (para testing)

Si un usuario específico tiene problemas:

1. Pídele que abra DevTools (F12)
2. Application > Local Storage > `https://ruizdev7.com`
3. Click derecho > Clear
4. Recargar (F5)

O ejecutar en consola:
```javascript
localStorage.clear();
location.reload();
```

### Monitorear cache en producción

Agrega esto temporalmente en tu app para debug:

```javascript
// En App.jsx o componente principal
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Redux Persist State:', localStorage.getItem('persist:root'));
  }
}, []);
```

---

## 📚 Referencias

- [Redux Persist Documentation](https://github.com/rt2zz/redux-persist)
- [RTK Query Caching](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior)
- [Versioning & Migration](https://github.com/rt2zz/redux-persist#state-reconciler)

---

## 🎯 Checklist post-restauración de BD

Cuando restaures la base de datos en producción:

- [ ] Importar backup a MySQL
- [ ] Verificar que datos se importaron: `SELECT COUNT(*) FROM tbl_pumps;`
- [ ] Reiniciar backend: `docker compose -f docker-compose.production.yml restart backend`
- [ ] Verificar logs del backend: `docker logs backend --tail 50`
- [ ] (Opcional) Incrementar versión en `store.js` si quieres forzar limpieza
- [ ] Test en navegador: verificar que datos son correctos
- [ ] Limpiar localStorage si ves datos antiguos: `localStorage.clear()`

---

## ⚠️ Importante

Con la nueva configuración, **los datos de APIs NO se cachean en localStorage**. Esto significa:

- ✅ Siempre verás datos actualizados
- ✅ No necesitas invalidar cache frecuentemente
- ✅ Restauraciones de BD se reflejan inmediatamente (después de recargar)
- ⚠️ Primera carga puede ser un poco más lenta (datos desde servidor)

El único dato persistido es **la sesión del usuario** (login), lo cual es correcto.

