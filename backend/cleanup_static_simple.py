#!/usr/bin/env python3
"""
Script simple de limpieza para la carpeta static de bombas
Elimina directorios vacíos sin dependencias de Flask
"""

import os
import shutil
from pathlib import Path


def cleanup_static_folders():
    """Limpia directorios vacíos en la carpeta static"""

    # Ruta base de la carpeta static
    static_base = Path("portfolio_app/static/pumps")

    if not static_base.exists():
        print("❌ La carpeta static/pumps no existe")
        return

    print("🧹 Iniciando limpieza de carpeta static...")

    # Contadores
    empty_dirs_removed = 0
    total_dirs_before = 0
    total_files_before = 0

    # Contar archivos y directorios antes
    for root, dirs, files in os.walk(static_base):
        total_dirs_before += len(dirs)
        total_files_before += len(files)

    print(f"📊 Estado inicial:")
    print(f"   - Directorios: {total_dirs_before}")
    print(f"   - Archivos: {total_files_before}")

    # Eliminar directorios vacíos
    print("\n🗑️ Eliminando directorios vacíos...")
    for root, dirs, files in os.walk(static_base, topdown=False):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            try:
                if os.path.exists(dir_path) and not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    empty_dirs_removed += 1
                    print(f"   ✅ Eliminado directorio vacío: {dir_path}")
            except OSError as e:
                print(f"   ⚠️ Error eliminando {dir_path}: {e}")

    # Contar archivos y directorios después
    total_dirs_after = 0
    total_files_after = 0

    for root, dirs, files in os.walk(static_base):
        total_dirs_after += len(dirs)
        total_files_after += len(files)

    print(f"\n📊 Estado final:")
    print(f"   - Directorios: {total_dirs_after}")
    print(f"   - Archivos: {total_files_after}")

    print(f"\n🎯 Resumen de limpieza:")
    print(f"   - Directorios vacíos eliminados: {empty_dirs_removed}")
    print(f"   - Espacio liberado: {total_dirs_before - total_dirs_after} directorios")

    if empty_dirs_removed > 0:
        print(f"\n✅ Limpieza completada exitosamente!")
    else:
        print(f"\nℹ️ No se encontraron directorios vacíos para eliminar")


def show_static_stats():
    """Muestra estadísticas de la carpeta static"""

    static_base = Path("portfolio_app/static/pumps")

    if not static_base.exists():
        print("❌ La carpeta static/pumps no existe")
        return

    # Contar archivos y directorios
    total_dirs = 0
    total_files = 0
    empty_dirs = 0

    for root, dirs, files in os.walk(static_base):
        total_dirs += len(dirs)
        total_files += len(files)

    # Contar directorios vacíos
    for root, dirs, files in os.walk(static_base, topdown=False):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            if os.path.exists(dir_path) and not os.listdir(dir_path):
                empty_dirs += 1

    print("📊 Estadísticas de la carpeta Static:")
    print("=" * 40)
    print(f"📁 Total directorios: {total_dirs}")
    print(f"📄 Total archivos: {total_files}")
    print(f"🗂️ Directorios vacíos: {empty_dirs}")

    if empty_dirs > 0:
        print(
            f"\n💡 Ejecuta 'python cleanup_static_simple.py' para limpiar directorios vacíos"
        )


if __name__ == "__main__":
    print("🚀 Script Simple de Limpieza de Carpeta Static")
    print("=" * 50)

    # Mostrar estadísticas
    show_static_stats()

    # Preguntar si limpiar
    response = input("\n¿Deseas limpiar directorios vacíos? (y/N): ")
    if response.lower() == "y":
        cleanup_static_folders()
    else:
        print("❌ Operación cancelada")

    print("\n🎉 Proceso completado!")
