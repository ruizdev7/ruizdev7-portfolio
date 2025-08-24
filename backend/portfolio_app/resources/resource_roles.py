from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, current_user
from portfolio_app.decorators.auth_decorators import require_permission
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app.models.tbl_role_permissions import RolePermissions
from portfolio_app.models.tbl_user_roles import UserRoles
from portfolio_app.services.auth_service import AuthService
from portfolio_app import db

blueprint_api_roles = Blueprint("api_roles", __name__, url_prefix="")


@blueprint_api_roles.route("/api/v1/roles", methods=["GET"])
@jwt_required()
@require_permission("roles", "read")
def get_roles():
    """Obtener todos los roles"""
    roles = Roles.query.all()
    roles_data = []

    for role in roles:
        # Contar usuarios asociados a este rol
        users_count = UserRoles.query.filter_by(ccn_role=role.ccn_role).count()

        role_data = {
            "ccn_role": role.ccn_role,
            "role_name": role.role_name,
            "created_at": role.created_at.isoformat(),
            "users_count": users_count,
        }
        roles_data.append(role_data)

    return make_response(jsonify({"roles": roles_data}), 200)


@blueprint_api_roles.route("/api/v1/roles", methods=["POST"])
@jwt_required()
@require_permission("roles", "create")
def create_role():
    """Crear un nuevo rol"""
    data = request.get_json()

    if not data or "role_name" not in data:
        return make_response(jsonify({"error": "role_name es requerido"}), 400)

    # Verificar si el rol ya existe
    existing_role = Roles.query.filter_by(role_name=data["role_name"]).first()
    if existing_role:
        return make_response(jsonify({"error": "El rol ya existe"}), 400)

    role = Roles(role_name=data["role_name"])
    role.save()

    return make_response(
        jsonify(
            {
                "message": "Rol creado exitosamente",
                "role": {
                    "ccn_role": role.ccn_role,
                    "role_name": role.role_name,
                    "created_at": role.created_at.isoformat(),
                },
            }
        ),
        201,
    )


@blueprint_api_roles.route("/api/v1/roles/<int:role_id>", methods=["PUT"])
@jwt_required()
@require_permission("roles", "update")
def update_role(role_id):
    """Actualizar un rol"""
    role = Roles.query.get(role_id)
    if not role:
        return make_response(jsonify({"error": "Rol no encontrado"}), 404)

    data = request.get_json()
    if not data or "role_name" not in data:
        return make_response(jsonify({"error": "role_name es requerido"}), 400)

    role.role_name = data["role_name"]
    db.session.commit()

    return make_response(
        jsonify(
            {
                "message": "Rol actualizado exitosamente",
                "role": {
                    "ccn_role": role.ccn_role,
                    "role_name": role.role_name,
                    "created_at": role.created_at.isoformat(),
                },
            }
        ),
        200,
    )


@blueprint_api_roles.route("/api/v1/roles/<int:role_id>", methods=["DELETE"])
@jwt_required()
@require_permission("roles", "delete")
def delete_role(role_id):
    """Eliminar un rol"""
    role = Roles.query.get(role_id)
    if not role:
        return make_response(jsonify({"error": "Rol no encontrado"}), 404)

    # Verificar si hay usuarios usando este rol
    users_with_role = UserRoles.query.filter_by(ccn_role=role_id).count()
    if users_with_role > 0:
        return make_response(
            jsonify(
                {"error": "No se puede eliminar el rol porque hay usuarios asignados"}
            ),
            400,
        )

    # Eliminar permisos del rol
    RolePermissions.query.filter_by(ccn_role=role_id).delete()

    # Eliminar el rol
    db.session.delete(role)
    db.session.commit()

    return make_response(jsonify({"message": "Rol eliminado exitosamente"}), 200)


@blueprint_api_roles.route("/api/v1/roles/<int:role_id>/permissions", methods=["GET"])
@jwt_required()
@require_permission("roles", "read")
def get_role_permissions(role_id):
    """Obtener permisos de un rol específico"""
    role = Roles.query.get(role_id)
    if not role:
        return make_response(jsonify({"error": "Rol no encontrado"}), 404)

    role_permissions = RolePermissions.query.filter_by(ccn_role=role_id).all()
    permissions_data = []

    for rp in role_permissions:
        permissions_data.append(
            {
                "ccn_permission": rp.permission.ccn_permission,
                "permission_name": rp.permission.permission_name,
                "resource": rp.permission.resource,
                "action": rp.permission.action,
                "description": rp.permission.description,
            }
        )

    return make_response(
        jsonify(
            {
                "role": {"ccn_role": role.ccn_role, "role_name": role.role_name},
                "permissions": permissions_data,
            }
        ),
        200,
    )


@blueprint_api_roles.route("/api/v1/roles/<int:role_id>/permissions", methods=["POST"])
@jwt_required()
@require_permission("roles", "update")
def assign_permission_to_role(role_id):
    """Asignar un permiso a un rol"""
    role = Roles.query.get(role_id)
    if not role:
        return make_response(jsonify({"error": "Rol no encontrado"}), 404)

    data = request.get_json()
    if not data or "permission_id" not in data:
        return make_response(jsonify({"error": "permission_id es requerido"}), 400)

    permission = Permissions.query.get(data["permission_id"])
    if not permission:
        return make_response(jsonify({"error": "Permiso no encontrado"}), 404)

    # Verificar si ya existe la relación
    existing = RolePermissions.query.filter_by(
        ccn_role=role_id, ccn_permission=data["permission_id"]
    ).first()

    if existing:
        return make_response(
            jsonify({"error": "El permiso ya está asignado al rol"}), 400
        )

    role_permission = RolePermissions(role_id, data["permission_id"])
    role_permission.save()

    return make_response(jsonify({"message": "Permiso asignado exitosamente"}), 201)


@blueprint_api_roles.route(
    "/api/v1/roles/<int:role_id>/permissions/<int:permission_id>", methods=["DELETE"]
)
@jwt_required()
@require_permission("roles", "update")
def remove_permission_from_role(role_id, permission_id):
    """Remover un permiso de un rol"""
    role_permission = RolePermissions.query.filter_by(
        ccn_role=role_id, ccn_permission=permission_id
    ).first()

    if not role_permission:
        return make_response(jsonify({"error": "Permiso no encontrado en el rol"}), 404)

    role_permission.delete()

    return make_response(jsonify({"message": "Permiso removido exitosamente"}), 200)


@blueprint_api_roles.route("/api/v1/permissions", methods=["GET"])
@jwt_required()
@require_permission("roles", "read")
def get_permissions():
    """Obtener todos los permisos"""
    permissions = Permissions.query.all()
    permissions_data = []

    for perm in permissions:
        perm_data = {
            "ccn_permission": perm.ccn_permission,
            "permission_name": perm.permission_name,
            "resource": perm.resource,
            "action": perm.action,
            "description": perm.description,
            "created_at": perm.created_at.isoformat(),
        }
        permissions_data.append(perm_data)

    return make_response(jsonify({"permissions": permissions_data}), 200)


@blueprint_api_roles.route("/api/v1/users/<int:user_id>/roles", methods=["GET"])
@jwt_required()
@require_permission("users", "read")
def get_user_roles(user_id):
    """Obtener roles de un usuario específico"""
    from portfolio_app.models.tbl_users import User

    user = User.query.get(user_id)
    if not user:
        return make_response(jsonify({"error": "Usuario no encontrado"}), 404)

    roles = AuthService.get_user_roles(user_id)
    roles_data = []

    for role in roles:
        roles_data.append(
            {
                "ccn_role": role.ccn_role,
                "role_name": role.role_name,
                "created_at": role.created_at.isoformat(),
            }
        )

    return make_response(
        jsonify(
            {
                "user": {
                    "ccn_user": user.ccn_user,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "roles": roles_data,
            }
        ),
        200,
    )


@blueprint_api_roles.route("/api/v1/users/<int:user_id>/roles", methods=["POST"])
@jwt_required()
@require_permission("users", "update")
def assign_role_to_user(user_id):
    """Asignar un rol a un usuario"""
    data = request.get_json()
    if not data or "role_name" not in data:
        return make_response(jsonify({"error": "role_name es requerido"}), 400)

    success = AuthService.assign_role_to_user(user_id, data["role_name"])
    if success:
        return make_response(jsonify({"message": "Rol asignado exitosamente"}), 201)
    else:
        return make_response(jsonify({"error": "Error al asignar el rol"}), 400)


@blueprint_api_roles.route(
    "/api/v1/users/<int:user_id>/roles/<role_name>", methods=["DELETE"]
)
@jwt_required()
@require_permission("users", "update")
def remove_role_from_user(user_id, role_name):
    """Remover un rol de un usuario"""
    success = AuthService.remove_role_from_user(user_id, role_name)
    if success:
        return make_response(jsonify({"message": "Rol removido exitosamente"}), 200)
    else:
        return make_response(jsonify({"error": "Error al remover el rol"}), 400)


@blueprint_api_roles.route("/api/v1/users/<int:user_id>/permissions", methods=["GET"])
@jwt_required()
@require_permission("users", "read")
def get_user_permissions(user_id):
    """Obtener permisos de un usuario específico"""
    from portfolio_app.models.tbl_users import User

    user = User.query.get(user_id)
    if not user:
        return make_response(jsonify({"error": "Usuario no encontrado"}), 404)

    permissions = AuthService.get_user_permissions(user_id)

    return make_response(
        jsonify(
            {
                "user": {
                    "ccn_user": user.ccn_user,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "permissions": permissions,
            }
        ),
        200,
    )


@blueprint_api_roles.route("/api/v1/initialize-roles", methods=["POST"])
@jwt_required()
@require_permission("roles", "create")
def initialize_roles():
    """Inicializar roles y permisos por defecto"""
    try:
        AuthService.create_default_roles_and_permissions()
        return make_response(
            jsonify({"message": "Roles y permisos inicializados exitosamente"}), 200
        )
    except Exception as e:
        return make_response(jsonify({"error": f"Error al inicializar: {str(e)}"}), 500)


@blueprint_api_roles.route("/api/v1/my-permissions", methods=["GET"])
@jwt_required()
def get_my_permissions():
    """Obtener permisos del usuario actual"""
    permissions = current_user.get_permissions()
    roles = current_user.get_roles()

    roles_data = []
    for role in roles:
        roles_data.append({"ccn_role": role.ccn_role, "role_name": role.role_name})

    return make_response(
        jsonify(
            {
                "user": {
                    "ccn_user": current_user.ccn_user,
                    "email": current_user.email,
                    "first_name": current_user.first_name,
                    "last_name": current_user.last_name,
                },
                "roles": roles_data,
                "permissions": permissions,
            }
        ),
        200,
    )
