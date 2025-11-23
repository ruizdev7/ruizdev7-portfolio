#!/usr/bin/env python3
"""
Script para gestionar la seguridad de roles y permisos
"""

from portfolio_app import create_app
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app import db
from werkzeug.security import generate_password_hash


def show_current_security_status():
    """Mostrar el estado actual de seguridad"""
    app = create_app()

    with app.app_context():
        print("🔒 ESTADO ACTUAL DE SEGURIDAD")
        print("=" * 60)

        # Usuarios
        print("\n👥 USUARIOS:")
        users = User.query.all()
        for user in users:
            roles = user.get_roles()
            role_names = [role.role_name for role in roles]
            print(f"  📧 {user.email} ({user.first_name} {user.last_name})")
            print(f"     Roles: {', '.join(role_names) if role_names else 'Sin roles'}")

        # Roles y permisos
        print("\n🎭 ROLES Y PERMISOS:")
        roles = Roles.query.all()
        for role in roles:
            print(f"\n  🔸 {role.role_name.upper()}:")

            # Obtener permisos del rol
            query = db.text(
                """
                SELECT p.resource, p.action
                FROM tbl_role_permissions rp
                JOIN tbl_permissions p ON rp.ccn_permission = p.ccn_permission
                WHERE rp.ccn_role = :role_id
                ORDER BY p.resource, p.action
            """
            )

            permissions = db.session.execute(
                query, {"role_id": role.ccn_role}
            ).fetchall()

            if permissions:
                for perm in permissions:
                    print(f"     ✅ {perm.resource}:{perm.action}")
            else:
                print("     ❌ Sin permisos")


def reset_user_password(email, new_password):
    """Restablecer contraseña de un usuario"""
    app = create_app()

    with app.app_context():
        try:
            user = User.query.filter_by(email=email).first()

            if not user:
                print(f"❌ Usuario {email} no encontrado")
                return False

            hashed_password = generate_password_hash(new_password)
            user.password = hashed_password
            db.session.commit()

            print(f"✅ Contraseña restablecida para {email}")
            print(f"🔑 Nueva contraseña: {new_password}")
            return True

        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
            return False


def assign_role_to_user(email, role_name):
    """Asignar rol a un usuario"""
    app = create_app()

    with app.app_context():
        try:
            user = User.query.filter_by(email=email).first()
            role = Roles.query.filter_by(role_name=role_name).first()

            if not user:
                print(f"❌ Usuario {email} no encontrado")
                return False

            if not role:
                print(f"❌ Rol {role_name} no encontrado")
                return False

            # Verificar si ya tiene el rol
            from portfolio_app.models.tbl_user_roles import UserRoles

            existing_role = UserRoles.query.filter_by(
                ccn_user=user.ccn_user, ccn_role=role.ccn_role
            ).first()

            if existing_role:
                print(f"⚠️  El usuario {email} ya tiene el rol {role_name}")
                return True

            # Asignar el rol
            user_role = UserRoles(ccn_user=user.ccn_user, ccn_role=role.ccn_role)
            db.session.add(user_role)
            db.session.commit()

            print(f"✅ Rol {role_name} asignado a {email}")
            return True

        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
            return False


def show_user_permissions(email):
    """Mostrar permisos de un usuario específico"""
    app = create_app()

    with app.app_context():
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"❌ Usuario {email} no encontrado")
            return

        print(f"\n🔍 PERMISOS DE {email.upper()}:")
        print("=" * 50)

        roles = user.get_roles()
        if not roles:
            print("❌ Usuario sin roles asignados")
            return

        all_permissions = set()
        for role in roles:
            print(f"\n🔸 Rol: {role.role_name}")

            # Obtener permisos del rol
            query = db.text(
                """
                SELECT p.resource, p.action
                FROM tbl_role_permissions rp
                JOIN tbl_permissions p ON rp.ccn_permission = p.ccn_permission
                WHERE rp.ccn_role = :role_id
                ORDER BY p.resource, p.action
            """
            )

            permissions = db.session.execute(
                query, {"role_id": role.ccn_role}
            ).fetchall()

            for perm in permissions:
                perm_str = f"{perm.resource}:{perm.action}"
                all_permissions.add(perm_str)
                print(f"  ✅ {perm_str}")

        print(f"\n📊 TOTAL DE PERMISOS ÚNICOS: {len(all_permissions)}")


def main():
    """Función principal con menú interactivo"""
    print("🔒 GESTOR DE SEGURIDAD - ROLES Y PERMISOS")
    print("=" * 50)

    while True:
        print("\n📋 OPCIONES DISPONIBLES:")
        print("1. Mostrar estado actual de seguridad")
        print("2. Restablecer contraseña de usuario")
        print("3. Asignar rol a usuario")
        print("4. Mostrar permisos de usuario")
        print("5. Salir")

        choice = input("\n🔢 Selecciona una opción (1-5): ").strip()

        if choice == "1":
            show_current_security_status()

        elif choice == "2":
            email = input("📧 Email del usuario: ").strip()
            password = input("🔑 Nueva contraseña: ").strip()
            if email and password:
                reset_user_password(email, password)
            else:
                print("❌ Email y contraseña son requeridos")

        elif choice == "3":
            email = input("📧 Email del usuario: ").strip()
            role = input("🎭 Nombre del rol (admin/moderator/user/guest): ").strip()
            if email and role:
                assign_role_to_user(email, role)
            else:
                print("❌ Email y rol son requeridos")

        elif choice == "4":
            email = input("📧 Email del usuario: ").strip()
            if email:
                show_user_permissions(email)
            else:
                print("❌ Email es requerido")

        elif choice == "5":
            print("👋 ¡Hasta luego!")
            break

        else:
            print("❌ Opción inválida")


if __name__ == "__main__":
    main()
