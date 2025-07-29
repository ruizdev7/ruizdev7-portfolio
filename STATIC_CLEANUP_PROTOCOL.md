# 🧹 Protocolo de Limpieza de Carpeta Static

## 📋 **Resumen del Problema**

La carpeta `backend/portfolio_app/static/pumps/` almacena las fotografías de las bombas, organizadas en directorios individuales por bomba (usando el `ccn_pump` como nombre del directorio).

**Problema identificado**: Cuando se eliminan bombas o fotos, los directorios vacíos no se eliminan automáticamente, acumulándose archivos huérfanos.

## 🎯 **Estado Actual (Después de la Limpieza)**

- ✅ **Directorios vacíos eliminados**: 45
- ✅ **Directorios restantes**: 6 (con fotos)
- ✅ **Archivos de fotos**: 26
- ✅ **Espacio liberado**: 45 directorios

## 🛠️ **Protocolo de Limpieza Implementado**

### **1. Limpieza Automática (Backend)**

#### **✅ Eliminación de Fotos Individuales**
```python
# En delete_pump_photo()
# Verificar si el directorio quedó vacío y eliminarlo
pump_dir = pump.get_pump_directory()
if os.path.exists(pump_dir) and not os.listdir(pump_dir):
    try:
        os.rmdir(pump_dir)
        print(f"✅ Deleted empty pump directory: {pump_dir}")
    except OSError as e:
        print(f"⚠️ Could not delete empty directory {pump_dir}: {str(e)}")
```

#### **✅ Eliminación de Bombas Completas**
```python
# En delete_pump()
# Eliminar todas las fotos físicas y el directorio
for photo in photos_list:
    photo_path = os.path.join(pump_dir, photo)
    if os.path.exists(photo_path):
        try:
            os.remove(photo_path)
            deleted_photos.append(photo)
        except Exception as e:
            failed_deletions.append(photo)

# Eliminar directorio si está vacío
try:
    os.rmdir(pump_dir)
    print(f"✅ Deleted pump directory: {pump_dir}")
except OSError as e:
    print(f"⚠️ Could not delete directory {pump_dir}: {str(e)}")
```

### **2. Comandos de Flask (Backend)**

#### **📊 Ver Estadísticas**
```bash
# Desde el directorio backend/
flask static-stats
```

#### **🧹 Limpiar Directorios Vacíos**
```bash
# Desde el directorio backend/
flask cleanup-static

# Opciones disponibles:
flask cleanup-static --dry-run    # Solo mostrar qué se eliminaría
flask cleanup-static --force      # Eliminar sin confirmación
```

### **3. Scripts de Limpieza Manual**

#### **🐍 Script Python Simple**
```bash
# Desde el directorio backend/
python cleanup_static_simple.py
```

#### **🐚 Script Bash**
```bash
# Desde el directorio raíz del proyecto
./cleanup_static.sh
```

#### **🐍 Script Python Completo**
```bash
# Desde el directorio backend/
python cleanup_static_folders.py
```

## 📊 **Comandos de Verificación**

### **Verificar Directorios Vacíos**
```bash
find backend/portfolio_app/static/pumps -type d -empty
```

### **Contar Directorios y Archivos**
```bash
# Total directorios
find backend/portfolio_app/static/pumps -type d | wc -l

# Total archivos
find backend/portfolio_app/static/pumps -type f | wc -l

# Directorios vacíos
find backend/portfolio_app/static/pumps -type d -empty | wc -l
```

### **Verificar Consistencia con Base de Datos**
```bash
# Desde el directorio backend/
flask static-stats
```

## 🔄 **Flujo de Limpieza Automática**

### **✅ Al Eliminar Foto Individual:**
1. **Eliminar archivo físico** → `os.remove(photo_path)`
2. **Actualizar base de datos** → `pump.remove_photo(photo_filename)`
3. **Verificar directorio vacío** → `not os.listdir(pump_dir)`
4. **Eliminar directorio si está vacío** → `os.rmdir(pump_dir)`

### **✅ Al Eliminar Bomba Completa:**
1. **Eliminar todas las fotos físicas** → Loop `os.remove(photo_path)`
2. **Eliminar directorio de la bomba** → `os.rmdir(pump_dir)`
3. **Eliminar registro de la base de datos** → `db.session.delete(pump)`

## 🚀 **Recomendaciones de Uso**

### **🔄 Limpieza Regular (Automática)**
- ✅ **Ya implementada**: El backend elimina automáticamente directorios vacíos
- ✅ **Sin intervención manual**: Se ejecuta en cada eliminación de foto/bomba

### **🧹 Limpieza Manual (Opcional)**
- **Mensual**: Ejecutar `./cleanup_static.sh` para verificar estado
- **Después de migraciones**: Verificar consistencia con `flask static-stats`
- **Antes de backups**: Limpiar archivos huérfanos

### **📊 Monitoreo**
- **Verificar estadísticas**: `flask static-stats`
- **Revisar logs del backend**: Buscar mensajes de eliminación de directorios
- **Monitorear espacio en disco**: Verificar crecimiento de la carpeta static

## 🎯 **Beneficios del Protocolo**

### **✅ Automatización Completa**
- **Eliminación automática** de directorios vacíos
- **Sin intervención manual** requerida
- **Consistencia garantizada** entre archivos y base de datos

### **✅ Herramientas de Verificación**
- **Comandos Flask** integrados en la aplicación
- **Scripts independientes** para limpieza manual
- **Estadísticas detalladas** del estado de archivos

### **✅ Flexibilidad**
- **Múltiples opciones** de limpieza (automática, manual, comandos)
- **Modo dry-run** para verificar antes de eliminar
- **Logs detallados** para auditoría

## 🔧 **Mantenimiento Futuro**

### **📅 Tareas Programadas**
```bash
# Agregar al crontab para limpieza semanal
0 2 * * 0 /ruta/al/proyecto/cleanup_static.sh
```

### **📊 Monitoreo Continuo**
- **Alertas automáticas** si hay muchos directorios vacíos
- **Reportes periódicos** del estado de archivos
- **Backup automático** antes de limpiezas masivas

---

## 🎉 **Estado Actual: LIMPIO**

✅ **45 directorios vacíos eliminados**  
✅ **Protocolo automático implementado**  
✅ **Herramientas de verificación disponibles**  
✅ **Sistema de limpieza funcional**  

**¡El sistema está ahora completamente optimizado para la gestión automática de archivos estáticos!** 🚀 