from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app.models.tbl_role_permissions import RolePermissions
from portfolio_app.models.tbl_user_roles import UserRoles
from portfolio_app import db


class AuthService:
    @staticmethod
    def create_default_roles_and_permissions():
        """Crea roles y permisos por defecto"""

        # Crear roles básicos
        roles_data = [
            {"name": "admin", "description": "Administrador completo"},
            {"name": "moderator", "description": "Moderador"},
            {"name": "user", "description": "Usuario básico"},
            {"name": "guest", "description": "Usuario invitado"},
        ]

        for role_data in roles_data:
            role = Roles.query.filter_by(role_name=role_data["name"]).first()
            if not role:
                role = Roles(role_name=role_data["name"])
                role.save()

        # Crear permisos básicos
        permissions_data = [
            # Posts
            {
                "name": "posts_create",
                "resource": "posts",
                "action": "create",
                "description": "Crear posts",
            },
            {
                "name": "posts_read",
                "resource": "posts",
                "action": "read",
                "description": "Leer posts",
            },
            {
                "name": "posts_update",
                "resource": "posts",
                "action": "update",
                "description": "Actualizar posts",
            },
            {
                "name": "posts_delete",
                "resource": "posts",
                "action": "delete",
                "description": "Eliminar posts",
            },
            # Users
            {
                "name": "users_create",
                "resource": "users",
                "action": "create",
                "description": "Crear usuarios",
            },
            {
                "name": "users_read",
                "resource": "users",
                "action": "read",
                "description": "Leer usuarios",
            },
            {
                "name": "users_update",
                "resource": "users",
                "action": "update",
                "description": "Actualizar usuarios",
            },
            {
                "name": "users_delete",
                "resource": "users",
                "action": "delete",
                "description": "Eliminar usuarios",
            },
            # Pumps
            {
                "name": "pumps_create",
                "resource": "pumps",
                "action": "create",
                "description": "Crear bombas",
            },
            {
                "name": "pumps_read",
                "resource": "pumps",
                "action": "read",
                "description": "Leer bombas",
            },
            {
                "name": "pumps_update",
                "resource": "pumps",
                "action": "update",
                "description": "Actualizar bombas",
            },
            {
                "name": "pumps_delete",
                "resource": "pumps",
                "action": "delete",
                "description": "Eliminar bombas",
            },
            # Categories
            {
                "name": "categories_create",
                "resource": "categories",
                "action": "create",
                "description": "Crear categorías",
            },
            {
                "name": "categories_read",
                "resource": "categories",
                "action": "read",
                "description": "Leer categorías",
            },
            {
                "name": "categories_update",
                "resource": "categories",
                "action": "update",
                "description": "Actualizar categorías",
            },
            {
                "name": "categories_delete",
                "resource": "categories",
                "action": "delete",
                "description": "Eliminar categorías",
            },
            # Comments
            {
                "name": "comments_create",
                "resource": "comments",
                "action": "create",
                "description": "Crear comentarios",
            },
            {
                "name": "comments_read",
                "resource": "comments",
                "action": "read",
                "description": "Leer comentarios",
            },
            {
                "name": "comments_update",
                "resource": "comments",
                "action": "update",
                "description": "Actualizar comentarios",
            },
            {
                "name": "comments_delete",
                "resource": "comments",
                "action": "delete",
                "description": "Eliminar comentarios",
            },
            # Roles
            {
                "name": "roles_create",
                "resource": "roles",
                "action": "create",
                "description": "Crear roles",
            },
            {
                "name": "roles_read",
                "resource": "roles",
                "action": "read",
                "description": "Leer roles",
            },
            {
                "name": "roles_update",
                "resource": "roles",
                "action": "update",
                "description": "Actualizar roles",
            },
            {
                "name": "roles_delete",
                "resource": "roles",
                "action": "delete",
                "description": "Eliminar roles",
            },
        ]

        for perm_data in permissions_data:
            perm = Permissions.query.filter_by(
                permission_name=perm_data["name"]
            ).first()
            if not perm:
                perm = Permissions(
                    permission_name=perm_data["name"],
                    resource=perm_data["resource"],
                    action=perm_data["action"],
                    description=perm_data["description"],
                )
                perm.save()

        # Asignar permisos a roles
        role_permissions = {
            "admin": [
                "posts_create",
                "posts_read",
                "posts_update",
                "posts_delete",
                "users_create",
                "users_read",
                "users_update",
                "users_delete",
                "pumps_create",
                "pumps_read",
                "pumps_update",
                "pumps_delete",
                "categories_create",
                "categories_read",
                "categories_update",
                "categories_delete",
                "comments_create",
                "comments_read",
                "comments_update",
                "comments_delete",
                "roles_create",
                "roles_read",
                "roles_update",
                "roles_delete",
            ],
            "moderator": [
                "posts_create",
                "posts_read",
                "posts_update",
                "users_read",
                "pumps_create",
                "pumps_read",
                "pumps_update",
                "categories_read",
                "comments_create",
                "comments_read",
                "comments_update",
            ],
            "user": [
                "posts_create",
                "posts_read",
                "posts_update",
                "pumps_read",
                "comments_create",
                "comments_read",
                "comments_update",
            ],
            "guest": ["posts_read", "pumps_read", "comments_read"],
        }

        for role_name, permission_names in role_permissions.items():
            role = Roles.query.filter_by(role_name=role_name).first()
            if role:
                for perm_name in permission_names:
                    perm = Permissions.query.filter_by(
                        permission_name=perm_name
                    ).first()
                    if perm:
                        # Verificar si ya existe la relación
                        existing = RolePermissions.query.filter_by(
                            ccn_role=role.ccn_role, ccn_permission=perm.ccn_permission
                        ).first()

                        if not existing:
                            role_perm = RolePermissions(
                                role.ccn_role, perm.ccn_permission
                            )
                            role_perm.save()

    @staticmethod
    def get_user_permissions(user_id):
        """Obtiene todos los permisos de un usuario"""
        user = User.query.get(user_id)
        if not user:
            return []

        return user.get_permissions()

    @staticmethod
    def assign_role_to_user(user_id, role_name):
        """Asigna un rol a un usuario"""
        user = User.query.get(user_id)
        role = Roles.query.filter_by(role_name=role_name).first()

        if not user or not role:
            return False

        # Verificar si ya tiene el rol asignado
        existing_role = UserRoles.query.filter_by(
            ccn_user=user_id, ccn_role=role.ccn_role
        ).first()

        if existing_role:
            return True  # Ya tiene el rol

        user_role = UserRoles(user_id, role.ccn_role)
        user_role.save()
        return True

    @staticmethod
    def remove_role_from_user(user_id, role_name):
        """Remueve un rol de un usuario"""
        role = Roles.query.filter_by(role_name=role_name).first()
        if not role:
            return False

        user_role = UserRoles.query.filter_by(
            ccn_user=user_id, ccn_role=role.ccn_role
        ).first()

        if user_role:
            user_role.delete()
            return True

        return False

    @staticmethod
    def get_user_roles(user_id):
        """Obtiene todos los roles de un usuario"""
        user = User.query.get(user_id)
        if not user:
            return []

        return user.get_roles()

    @staticmethod
    def create_user_with_role(user_data, role_name="user"):
        """Crea un usuario y le asigna un rol por defecto"""
        from werkzeug.security import generate_password_hash

        # Crear el usuario
        user = User(
            first_name=user_data["first_name"],
            middle_name=user_data.get("middle_name"),
            last_name=user_data["last_name"],
            email=user_data["email"],
            password=user_data["password"],
        )
        user.save()

        # Asignar rol por defecto
        AuthService.assign_role_to_user(user.ccn_user, role_name)

        return user
