import os
import base64
from datetime import datetime

from flask import jsonify
from flask import request
from flask import Blueprint
from flask import make_response
from flask import send_from_directory

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity, get_jwt, current_user, get_jwt_identity
from flask_jwt_extended import create_access_token, create_refresh_token

from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from portfolio_app import db, jwt
from portfolio_app import create_app
from portfolio_app.models.tbl_users import User
from portfolio_app.schemas.schema_user import SchemaUser, AuthResponseSchema
from portfolio_app.models.tbl_token_block_list import TokenBlockList
from portfolio_app.services.audit_log_service import AuditLogService


blueprint_api_authorization = Blueprint("api_authorization", __name__, url_prefix="")


@blueprint_api_authorization.route("/api/v1/token", methods=["POST"])
def create_token():
    print(request.json)
    request_data = request.get_json()
    email = request_data["email"]
    password = request_data["password"]
    query_user = User.query.filter_by(email=email).first()

    if query_user is None:
        # Log failed login attempt
        AuditLogService.log_failed_login(email)
        return make_response(jsonify({"msg": "User not found"}), 401)

    if check_password_hash(query_user.password, password):
        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)

        # Usar schema seguro para datos del usuario
        auth_schema = AuthResponseSchema()
        user_data = auth_schema.dump(query_user)

        # Obtener roles y permisos del usuario
        roles = query_user.get_roles()
        permissions = query_user.get_permissions()

        roles_data = []
        for role in roles:
            roles_data.append({"ccn_role": role.ccn_role, "role_name": role.role_name})

        # Log successful login
        AuditLogService.log_login(
            ccn_user=query_user.ccn_user,
            email=email,
            ip_address=request.remote_addr,
        )

        return make_response(
            jsonify(
                {
                    "current_user": {
                        "user_info": user_data,
                        "token": access_token,
                        "refresh_token": refresh_token,
                        "roles": roles_data,
                        "permissions": permissions,
                    }
                }
            )
        )
    else:
        # Log failed login attempt
        AuditLogService.log_failed_login(email, ip_address=request.remote_addr)
        return make_response(jsonify({"msg": "Invalid Credentials"}), 401)


@blueprint_api_authorization.route("/api/v1/refresh-token", methods=["GET"])
@jwt_required(refresh=True)
def refresh_access_token():
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)
    return jsonify({"New access token": new_access_token})


@blueprint_api_authorization.route("/api/v1/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def logout():
    jwt = get_jwt()
    jti = jwt["jti"]
    token_type = jwt["type"]
    token_b = TokenBlockList(jti=jti)
    token_b.save()

    # Log logout
    identity = get_jwt_identity()
    query_user = User.query.filter_by(email=identity).first()
    if query_user:
        AuditLogService.log_logout(ccn_user=query_user.ccn_user, email=identity)

    return jsonify({"message": f"{token_type} token revoked successfully"}), 200


@blueprint_api_authorization.route("/api/v1/whoami", methods=["GET"])
@jwt_required()
def whoami():
    # current_user is now populated via user_lookup_callback
    roles = current_user.get_roles()
    permissions = current_user.get_permissions()

    roles_data = []
    for role in roles:
        roles_data.append({"ccn_role": role.ccn_role, "role_name": role.role_name})

    return jsonify(
        {
            "email": current_user.email,
            "ccn_user": current_user.ccn_user,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "roles": roles_data,
            "permissions": permissions,
        }
    )


@blueprint_api_authorization.route("/api/v1/debug/permissions", methods=["GET"])
@jwt_required()
def debug_permissions():
    """Endpoint temporal para debug de permisos"""
    try:
        # Obtener el usuario actual
        user = current_user

        # Verificar permisos específicos
        has_pumps_update = user.has_permission("pumps", "update")
        has_pumps_create = user.has_permission("pumps", "create")
        has_pumps_delete = user.has_permission("pumps", "delete")

        # Obtener todos los permisos del usuario
        all_permissions = user.get_permissions()

        # Obtener roles del usuario
        roles = user.get_roles()

        # Verificar si el permiso pumps_update existe en la base de datos
        from portfolio_app.models.tbl_permissions import Permissions

        pumps_update_perm = Permissions.query.filter_by(
            resource="pumps", action="update"
        ).first()

        # Verificar si el rol admin tiene el permiso pumps_update
        from portfolio_app.models.tbl_role_permissions import RolePermissions
        from portfolio_app.models.tbl_roles import Roles

        admin_role = Roles.query.filter_by(role_name="admin").first()
        role_permissions = []

        if admin_role and pumps_update_perm:
            role_perm = RolePermissions.query.filter_by(
                ccn_role=admin_role.ccn_role,
                ccn_permission=pumps_update_perm.ccn_permission,
            ).first()
            role_permissions.append(
                {
                    "role": admin_role.role_name,
                    "permission": f"{pumps_update_perm.resource}:{pumps_update_perm.action}",
                    "exists": role_perm is not None,
                }
            )

        return make_response(
            jsonify(
                {
                    "user_info": {
                        "ccn_user": user.ccn_user,
                        "email": user.email,
                        "name": f"{user.first_name} {user.last_name}",
                    },
                    "permissions_check": {
                        "pumps_update": has_pumps_update,
                        "pumps_create": has_pumps_create,
                        "pumps_delete": has_pumps_delete,
                    },
                    "all_permissions": all_permissions,
                    "roles": [
                        {"ccn_role": role.ccn_role, "role_name": role.role_name}
                        for role in roles
                    ],
                    "debug_info": {
                        "pumps_update_permission_exists": pumps_update_perm is not None,
                        "admin_role_exists": admin_role is not None,
                        "role_permissions": role_permissions,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return make_response(
            jsonify({"error": str(e), "error_type": type(e).__name__}), 500
        )
