import os
import base64
from datetime import datetime

from flask import jsonify
from flask import request
from flask import Blueprint
from flask import make_response
from flask import send_from_directory

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import create_access_token

from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from portfolio_app import db
from portfolio_app import create_app
from portfolio_app.models.tbl_users import User
from portfolio_app.schemas.schema_user import SchemaUser


blueprint_api_authorization = Blueprint("api_authorization", __name__, url_prefix="")


# Create a route to authenticate your users and return JWTs. The
# create_access_token() function is used to actually generate the JWT.
@blueprint_api_authorization.route("/api/v1/token", methods=["POST"])
def create_token():
    request_data = request.get_json()
    email = request_data["email"]
    password = request_data["password"]
    query_user = User.query.filter_by(email=email).first()

    if query_user == None:
        return make_response(jsonify({"msg": "User not found"}), 401)

    if check_password_hash(query_user.password, password):
        access_token = create_access_token(identity=email)
        return make_response(
            jsonify(
                {
                    "current_user": {
                        "ccn_user": query_user.ccn_user,
                        "token": access_token,
                        "email": query_user.email,
                    }
                }
            )
        )
    else:
        return make_response(jsonify({"msg": "Invalid Password"}), 400)
