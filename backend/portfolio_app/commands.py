"""
Comandos de Flask para gestión de archivos estáticos
"""

import os
import shutil
from pathlib import Path
from flask.cli import with_appcontext
import click
from portfolio_app.models.tbl_pumps import Pump
from portfolio_app import db
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app.services.auth_service import AuthService
from werkzeug.security import generate_password_hash
from portfolio_app.models.tbl_role_permissions import RolePermissions
from portfolio_app.models.tbl_user_roles import UserRoles


@click.command("cleanup-static")
@click.option(
    "--dry-run", is_flag=True, help="Mostrar qué se eliminaría sin hacer cambios"
)
@click.option("--force", is_flag=True, help="Eliminar sin confirmación")
@with_appcontext
def cleanup_static_command(dry_run, force):
    """Limpia directorios vacíos y archivos huérfanos en la carpeta static"""

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


@click.command("init-roles")
@with_appcontext
def init_roles_command():
    """Inicializar roles y permisos por defecto"""
    try:
        click.echo("🔧 Inicializando roles y permisos...")
        AuthService.create_default_roles_and_permissions()
        click.echo("✅ Roles y permisos inicializados exitosamente")

        # Mostrar resumen
        roles_count = Roles.query.count()
        permissions_count = Permissions.query.count()
        click.echo(f"\n📊 Resumen:")
        click.echo(f"   - Roles creados: {roles_count}")
        click.echo(f"   - Permisos creados: {permissions_count}")

    except Exception as e:
        click.echo(f"❌ Error al inicializar roles y permisos: {str(e)}")


@click.command("create-admin")
@click.option(
    "--email", prompt="Email del administrador", help="Email del usuario administrador"
)
@click.option(
    "--password",
    prompt="Contraseña",
    hide_input=True,
    confirmation_prompt=True,
    help="Contraseña del administrador",
)
@click.option("--first-name", prompt="Nombre", help="Nombre del administrador")
@click.option("--last-name", prompt="Apellido", help="Apellido del administrador")
@with_appcontext
def create_admin_command(email, password, first_name, last_name):
    """Crear un usuario administrador"""
    try:
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            click.echo(f"❌ El usuario con email {email} ya existe")
            return

        # Crear el usuario
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=generate_password_hash(password),
        )
        user.save()

        # Asignar rol de administrador
        AuthService.assign_role_to_user(user.ccn_user, "admin")

        click.echo(f"✅ Usuario administrador creado exitosamente:")
        click.echo(f"   - Email: {email}")
        click.echo(f"   - Nombre: {first_name} {last_name}")
        click.echo(f"   - Rol: admin")

    except Exception as e:
        click.echo(f"❌ Error al crear usuario administrador: {str(e)}")


@click.command("create-guest")
@click.option(
    "--email", prompt="Email del usuario guest", help="Email del usuario guest"
)
@click.option(
    "--password",
    prompt="Contraseña",
    hide_input=True,
    confirmation_prompt=True,
    help="Contraseña del usuario guest",
)
@click.option("--first-name", prompt="Nombre", help="Nombre del usuario guest")
@click.option("--last-name", prompt="Apellido", help="Apellido del usuario guest")
@click.option("--middle-name", default="", help="Segundo nombre (opcional)")
@with_appcontext
def create_guest_command(email, password, first_name, last_name, middle_name):
    """Crear un usuario guest con permisos de solo lectura"""
    try:
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            click.echo(f"❌ El usuario con email {email} ya existe")
            return

        # Crear el usuario
        user = User(
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            email=email,
            password=generate_password_hash(password),
        )
        user.save()

        # Asignar rol de guest
        AuthService.assign_role_to_user(user.ccn_user, "guest")

        click.echo(f"✅ Usuario guest creado exitosamente:")
        click.echo(f"   - Email: {email}")
        click.echo(f"   - Nombre: {first_name} {middle_name} {last_name}".strip())
        click.echo(f"   - Rol: guest")
        click.echo(
            f"   - Permisos: Solo lectura (posts.read, pumps.read, comments.read)"
        )

    except Exception as e:
        click.echo(f"❌ Error al crear usuario guest: {str(e)}")


@click.command("assign-role")
@click.option("--user-id", type=int, required=True, help="ID del usuario")
@click.option("--role-name", required=True, help="Nombre del rol")
@with_appcontext
def assign_role_command(user_id, role_name):
    """Asignar un rol a un usuario"""
    try:
        AuthService.assign_role_to_user(user_id, role_name)
        click.echo(f"✅ Rol '{role_name}' asignado exitosamente al usuario {user_id}")
    except Exception as e:
        click.echo(f"❌ Error al asignar rol: {str(e)}")


@click.command("list-roles")
@with_appcontext
def list_roles_command():
    """Listar todos los roles y sus permisos"""
    try:
        roles = Roles.query.all()
        click.echo("📋 Roles del sistema:")
        click.echo("=" * 50)

        for role in roles:
            click.echo(f"\n🔹 Rol: {role.role_name} (ID: {role.ccn_role})")

            # Obtener permisos del rol
            role_permissions = (
                db.session.query(Permissions)
                .join(
                    RolePermissions,
                    Permissions.ccn_permission == RolePermissions.ccn_permission,
                )
                .filter(RolePermissions.ccn_role == role.ccn_role)
                .all()
            )

            if role_permissions:
                click.echo("   Permisos:")
                for perm in role_permissions:
                    click.echo(
                        f"     - {perm.resource}.{perm.action} ({perm.permission_name})"
                    )
            else:
                click.echo("   Sin permisos asignados")

    except Exception as e:
        click.echo(f"❌ Error al listar roles: {str(e)}")


@click.command("list-users")
@with_appcontext
def list_users_command():
    """Listar todos los usuarios"""
    try:
        users = User.query.all()
        click.echo("👥 Usuarios del sistema:")
        click.echo("=" * 50)

        for user in users:
            click.echo(f"\n🔹 Usuario: {user.first_name} {user.last_name}")
            click.echo(f"   - ID: {user.ccn_user}")
            click.echo(f"   - Email: {user.email}")
            click.echo(f"   - Creado: {user.created_at}")

            # Obtener roles del usuario
            user_roles = (
                db.session.query(Roles)
                .join(UserRoles, Roles.ccn_role == UserRoles.ccn_role)
                .filter(UserRoles.ccn_user == user.ccn_user)
                .all()
            )

            if user_roles:
                click.echo("   Roles:")
                for role in user_roles:
                    click.echo(f"     - {role.role_name}")
            else:
                click.echo("   Sin roles asignados")

    except Exception as e:
        click.echo(f"❌ Error al listar usuarios: {str(e)}")


def register_commands(app):
    """Registrar comandos personalizados"""
    app.cli.add_command(cleanup_static_command)
    app.cli.add_command(static_stats_command)
    app.cli.add_command(init_roles_command)
    app.cli.add_command(create_admin_command)
    app.cli.add_command(create_guest_command)
    app.cli.add_command(assign_role_command)
    app.cli.add_command(list_roles_command)
    app.cli.add_command(list_users_command)
