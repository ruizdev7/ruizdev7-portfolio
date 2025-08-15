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
from portfolio_app.schemas.schema_user import SchemaUser
from portfolio_app.models.tbl_token_block_list import TokenBlockList


blueprint_api_authorization = Blueprint("api_authorization", __name__, url_prefix="")


@blueprint_api_authorization.route("/api/v1/token", methods=["POST"])
def create_token():
    print(request.json)
    request_data = request.get_json()
    email = request_data["email"]
    password = request_data["password"]
    query_user = User.query.filter_by(email=email).first()

    if query_user is None:
        return make_response(jsonify({"msg": "User not found"}), 401)

    if check_password_hash(query_user.password, password):
        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)
        user_schema = SchemaUser()
        user_data = user_schema.dump(query_user)

        # Obtener roles y permisos del usuario
        roles = query_user.get_roles()
        permissions = query_user.get_permissions()

        roles_data = []
        for role in roles:
            roles_data.append({"ccn_role": role.ccn_role, "role_name": role.role_name})

        return make_response(
            jsonify(
                {
                    "current_user": {
                        "user_info": user_data,
                        "token": access_token,
                        "refresh_token": refresh_token,
                        "account_id": query_user.account_id,
                        "roles": roles_data,
                        "permissions": permissions,
                    }
                }
            )
        )
    else:
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
