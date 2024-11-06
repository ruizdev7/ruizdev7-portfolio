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
from portfolio_app.models.tbl_user import User
from portfolio_app.schemas.schema_user import SchemaUser

blueprint_api_user = Blueprint("api_user", __name__, url_prefix="")


@blueprint_api_user.route("/api/v1/user", methods=["POST"])
def post_user():
    request_data = request.get_json()

    username = request_data["username"]
    email_user = request_data["email_user"]
    password_user = generate_password_hash(request_data["password_user"])
    display_name = request_data["display_name"]
    bio = request_data["bio"]

    new_user = User(
        username=username,
        email_user=email_user,
        password_user=password_user,
        display_name=display_name,
        bio=bio,
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


@blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["GET"])
def get_user(ccn_user):
    query_user = User.query.filter_by(ccn_user=ccn_user).first()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(query_user)
    return make_response(jsonify({"user": user}), 200)


@blueprint_api_user.route("/api/v1/users", methods=["GET"])
def get_all_users():
    query_all_users = User.query.all()
    schema_user = SchemaUser(many=True)
    users = schema_user.dump(query_all_users)
    return make_response(jsonify({"Users": users}), 200)


@blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["PUT"])
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


# @jwt_required
@blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["DELETE"])
def delete_user(ccn_user):
    query_user_to_delete = User.query.filter_by(ccn_user=ccn_user).first()
    db.session.delete(query_user_to_delete)
    db.session.commit()
    return make_response(
        jsonify({"Response": "The user has been deleted succesfully"}), 200
    )
