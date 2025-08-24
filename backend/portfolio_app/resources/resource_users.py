import os
import base64
from datetime import datetime

from flask import jsonify
from flask import request
from flask import Blueprint
from flask import make_response
from flask import send_from_directory

from flask_jwt_extended import jwt_required

from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from portfolio_app import db
from portfolio_app import create_app
from portfolio_app.models.tbl_users import User
from portfolio_app.schemas.schema_user import SchemaUser

blueprint_api_user = Blueprint("api_user", __name__, url_prefix="")


@jwt_required
@blueprint_api_user.route("/api/v1/users", methods=["POST"])
def post_user():

    request_data = request.get_json()

    first_name = request_data["first_name"]
    middle_name = request_data["middle_name"]
    last_name = request_data["last_name"]
    email = request_data["email"]
    password = generate_password_hash(request_data["password"])

    new_user = User(
        first_name,
        middle_name,
        last_name,
        email,
        password,
    )

    db.session.add(new_user)
    db.session.commit()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(new_user)

    return make_response(
        jsonify(
            {
                "New User": user,
                "msg": "The user has been add succesfully",
            }
        ),
        201,
    )


@jwt_required
@blueprint_api_user.route("/api/v1/users/<int:ccn_user>", methods=["GET"])
def get_user(ccn_user):
    query_user = User.query.filter_by(ccn_user=ccn_user).first()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(query_user)
    return make_response(jsonify({"user": user}), 200)


@jwt_required()
@blueprint_api_user.route("/api/v1/users", methods=["GET"])
def get_all_users():
    from portfolio_app.decorators.auth_decorators import require_permission
    from portfolio_app.services.auth_service import AuthService

    # Verificar permisos
    if not require_permission("users", "read"):
        return make_response(
            jsonify({"error": "No tienes permisos para ver usuarios"}), 403
        )

    query_all_users = User.query.all()
    users_data = []

    for user in query_all_users:
        # Obtener roles del usuario
        roles = AuthService.get_user_roles(user.ccn_user)
        roles_data = [
            {"ccn_role": role.ccn_role, "role_name": role.role_name} for role in roles
        ]

        user_data = {
            "ccn_user": user.ccn_user,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "roles": roles_data,
        }
        users_data.append(user_data)

    return make_response(jsonify({"users": users_data}), 200)


@jwt_required
@blueprint_api_user.route("/api/v1/users/<int:ccn_user>", methods=["PUT"])
def put_user(ccn_user):
    request_data = request.get_json()

    if "email_user" not in request_data or "password_user" not in request_data:
        return jsonify({"error": "Email and password are required"}), 400

    email_user = request_data["email_user"]
    password_user = generate_password_hash(request_data["password_user"])

    query_user_to_update = User.query.filter_by(ccn_user=ccn_user).first()

    query_user_to_update.email_user = email_user
    query_user_to_update.password_user = generate_password_hash(password_user)

    db.session.commit()
    user_schema = SchemaUser(many=False)
    user_update = user_schema.dump(query_user_to_update)

    return make_response(jsonify({"user Updated": user_update}), 200)


@jwt_required
@blueprint_api_user.route("/api/v1/users/<int:ccn_user>/email", methods=["PUT"])
def update_user_email(ccn_user):
    request_data = request.get_json()
    new_email = request_data.get("email")

    if not new_email:
        return jsonify({"error": "Email is required"}), 400

    query_user_to_update = User.query.filter_by(ccn_user=ccn_user).first()
    if not query_user_to_update:
        return jsonify({"error": "User not found"}), 404

    query_user_to_update.email = new_email
    db.session.commit()

    user_schema = SchemaUser(many=False)
    user_update = user_schema.dump(query_user_to_update)

    return make_response(jsonify({"user Updated": user_update}), 200)


@jwt_required
@blueprint_api_user.route("/api/v1/users/<int:ccn_user>/password", methods=["PUT"])
def update_user_password(ccn_user):
    request_data = request.get_json()
    new_password = request_data.get("password")

    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    query_user_to_update = User.query.filter_by(ccn_user=ccn_user).first()
    if not query_user_to_update:
        return jsonify({"error": "User not found"}), 404

    query_user_to_update.password = generate_password_hash(new_password)
    db.session.commit()

    user_schema = SchemaUser(many=False)
    user_update = user_schema.dump(query_user_to_update)

    return make_response(jsonify({"user Updated": user_update}), 200)


@jwt_required
@blueprint_api_user.route("/api/v1/users/<int:ccn_user>", methods=["DELETE"])
def delete_user(ccn_user):
    query_user_to_delete = User.query.filter_by(ccn_user=ccn_user).first()
    db.session.delete(query_user_to_delete)
    db.session.commit()
    return make_response(
        jsonify({"Response": "The user has been deleted succesfully"}), 200
    )
