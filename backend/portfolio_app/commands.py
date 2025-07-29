"""
Comandos de Flask para gestión de archivos estáticos
"""

import os
import shutil
from pathlib import Path
from flask.cli import with_appcontext
import click
from portfolio_app.models.tbl_pumps import Pump


@click.command("cleanup-static")
@click.option(
    "--dry-run", is_flag=True, help="Mostrar qué se eliminaría sin hacer cambios"
)
@click.option("--force", is_flag=True, help="Eliminar sin confirmación")
@with_appcontext
def cleanup_static_command(dry_run, force):
    """Limpia directorios vacíos y archivos huérfanos en la carpeta static"""

    from portfolio_app import db

    static_base = Path("portfolio_app/static/pumps")

    if not static_base.exists():
        click.echo("❌ La carpeta static/pumps no existe")
        return

    click.echo("🧹 Iniciando limpieza de carpeta static...")

    # Contadores
    empty_dirs_found = 0
    orphan_dirs_found = 0

    # 1. Encontrar directorios vacíos
    click.echo("\n🔍 Buscando directorios vacíos...")
    empty_dirs = []

    for root, dirs, files in os.walk(static_base, topdown=False):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            if os.path.exists(dir_path) and not os.listdir(dir_path):
                empty_dirs.append(dir_path)
                empty_dirs_found += 1
                click.echo(f"   📁 Directorio vacío encontrado: {dir_path}")

    # 2. Encontrar directorios huérfanos (existen en static pero no en DB)
    click.echo("\n🔍 Verificando consistencia con la base de datos...")

    # Obtener todas las bombas de la base de datos
    pumps = Pump.query.all()
    db_pump_ids = {pump.ccn_pump for pump in pumps}

    # Obtener todos los directorios en static
    static_dirs = {d.name for d in static_base.iterdir() if d.is_dir()}
    orphan_dirs = static_dirs - db_pump_ids

    orphan_dirs_list = []
    for orphan in orphan_dirs:
        orphan_path = static_base / orphan
        orphan_dirs_list.append(str(orphan_path))
        orphan_dirs_found += 1
        click.echo(f"   🗂️ Directorio huérfano encontrado: {orphan_path}")

    # Resumen
    click.echo(f"\n📊 Resumen:")
    click.echo(f"   - Directorios vacíos: {empty_dirs_found}")
    click.echo(f"   - Directorios huérfanos: {orphan_dirs_found}")
    click.echo(f"   - Total a eliminar: {empty_dirs_found + orphan_dirs_found}")

    if empty_dirs_found == 0 and orphan_dirs_found == 0:
        click.echo("\n✅ No se encontraron directorios para eliminar")
        return

    # Confirmar eliminación
    if not force and not dry_run:
        if not click.confirm(
            f"\n¿Deseas eliminar {empty_dirs_found + orphan_dirs_found} directorios?"
        ):
            click.echo("❌ Operación cancelada")
            return

    # Ejecutar eliminación
    if dry_run:
        click.echo("\n🔍 MODO DRY-RUN - No se realizarán cambios")
        return

    click.echo("\n🗑️ Eliminando directorios...")

    # Eliminar directorios vacíos
    for dir_path in empty_dirs:
        try:
            os.rmdir(dir_path)
            click.echo(f"   ✅ Eliminado directorio vacío: {dir_path}")
        except OSError as e:
            click.echo(f"   ❌ Error eliminando {dir_path}: {e}")

    # Eliminar directorios huérfanos
    for dir_path in orphan_dirs_list:
        try:
            shutil.rmtree(dir_path)
            click.echo(f"   ✅ Eliminado directorio huérfano: {dir_path}")
        except Exception as e:
            click.echo(f"   ❌ Error eliminando {dir_path}: {e}")

    click.echo(f"\n🎉 Limpieza completada!")


@click.command("static-stats")
@with_appcontext
def static_stats_command():
    """Muestra estadísticas de la carpeta static"""

    static_base = Path("portfolio_app/static/pumps")

    if not static_base.exists():
        click.echo("❌ La carpeta static/pumps no existe")
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

    # Verificar consistencia con DB
    pumps = Pump.query.all()
    db_pump_ids = {pump.ccn_pump for pump in pumps}
    static_dirs = {d.name for d in static_base.iterdir() if d.is_dir()}
    orphan_dirs = static_dirs - db_pump_ids

    click.echo("📊 Estadísticas de la carpeta Static:")
    click.echo("=" * 40)
    click.echo(f"📁 Total directorios: {total_dirs}")
    click.echo(f"📄 Total archivos: {total_files}")
    click.echo(f"🗂️ Directorios vacíos: {empty_dirs}")
    click.echo(f"🔗 Directorios huérfanos: {len(orphan_dirs)}")
    click.echo(f"💾 Bombas en DB: {len(db_pump_ids)}")
    click.echo(f"📂 Directorios en static: {len(static_dirs)}")

    if orphan_dirs:
        click.echo(f"\n⚠️ Directorios huérfanos:")
        for orphan in orphan_dirs:
            click.echo(f"   - {orphan}")

    if empty_dirs > 0:
        click.echo(
            f"\n💡 Ejecuta 'flask cleanup-static' para limpiar directorios vacíos"
        )


def register_commands(app):
    """Registra los comandos en la aplicación Flask"""
    app.cli.add_command(cleanup_static_command)
    app.cli.add_command(static_stats_command)
