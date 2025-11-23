#!/usr/bin/env python3
"""
Script de limpieza para la carpeta static de bombas
Elimina directorios vacíos y archivos huérfanos
"""

import os
import sys
import shutil
from pathlib import Path


def cleanup_static_folders():
    """Limpia directorios vacíos y archivos huérfanos en la carpeta static"""

    # Ruta base de la carpeta static
    static_base = Path("portfolio_app/static/pumps")

    if not static_base.exists():
        print("❌ La carpeta static/pumps no existe")
        return

    print("🧹 Iniciando limpieza de carpeta static...")

    # Contadores
    empty_dirs_removed = 0
    orphan_files_removed = 0
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
    print(f"   - Archivos huérfanos eliminados: {orphan_files_removed}")
    print(f"   - Espacio liberado: {total_dirs_before - total_dirs_after} directorios")

    if empty_dirs_removed > 0:
        print(f"\n✅ Limpieza completada exitosamente!")
    else:
        print(f"\nℹ️ No se encontraron directorios vacíos para eliminar")


def verify_database_consistency():
    """Verifica la consistencia entre la base de datos y los archivos"""
    print("\n🔍 Verificando consistencia con la base de datos...")

    try:
        # Importar después de verificar que estamos en el contexto correcto
        import sys

        sys.path.append(".")

        from portfolio_app import create_app
        from portfolio_app.models.tbl_pumps import Pump

        app = create_app()

        with app.app_context():
            # Obtener todas las bombas de la base de datos
            pumps = Pump.query.all()
            db_pump_ids = {pump.ccn_pump for pump in pumps}

            # Obtener todos los directorios en static
            static_base = Path("portfolio_app/static/pumps")
            if static_base.exists():
                static_dirs = {d.name for d in static_base.iterdir() if d.is_dir()}

                # Encontrar directorios huérfanos (existen en static pero no en DB)
                orphan_dirs = static_dirs - db_pump_ids

                if orphan_dirs:
                    print(f"⚠️ Encontrados {len(orphan_dirs)} directorios huérfanos:")
                    for orphan in orphan_dirs:
                        print(f"   - {orphan}")

                    # Preguntar si eliminar
                    response = input(
                        "\n¿Deseas eliminar estos directorios huérfanos? (y/N): "
                    )
                    if response.lower() == "y":
                        for orphan in orphan_dirs:
                            orphan_path = static_base / orphan
                            try:
                                shutil.rmtree(orphan_path)
                                print(f"   ✅ Eliminado: {orphan}")
                            except Exception as e:
                                print(f"   ❌ Error eliminando {orphan}: {e}")
                else:
                    print("✅ No se encontraron directorios huérfanos")
            else:
                print("ℹ️ La carpeta static/pumps no existe")

    except ImportError as e:
        print(f"⚠️ No se pudo verificar la base de datos: {e}")
        print("   Ejecuta este script desde el directorio backend/")


if __name__ == "__main__":
    print("🚀 Script de Limpieza de Carpeta Static")
    print("=" * 50)

    # Cambiar al directorio backend si es necesario
    if not os.path.exists("portfolio_app"):
        print("❌ Ejecuta este script desde el directorio backend/")
        sys.exit(1)

    # Limpiar directorios vacíos
    cleanup_static_folders()

    # Verificar consistencia con la base de datos
    verify_database_consistency()

    print("\n🎉 Proceso de limpieza completado!")
