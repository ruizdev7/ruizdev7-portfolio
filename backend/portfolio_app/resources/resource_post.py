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

from portfolio_app import db
from portfolio_app import create_app
from portfolio_app.models.tbl_post import Post
from portfolio_app.schemas.schema_posts import SchemaPost

blueprint_api_post = Blueprint("api_post", __name__, url_prefix="")

"""
@blueprint_api_project.route("/api/v1/project", methods=["POST"])
def post_project():
    request_data = request.get_json()

    title_project = request_data["title_project"]
    description_project = request_data["description_project"]
    pdf_software_requirement

    new_project = User(email_user=email_user, password_user=password_user)

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
"""


@blueprint_api_post.route("/api/v1/posts", methods=["GET"])
def get_all_posts():
    query_all_posts = Post.query.all()
    print(query_all_posts)
    schema_post = SchemaPost(many=True)
    posts = schema_post.dump(query_all_posts)
    return make_response(jsonify({"Posts": posts}), 200)


"""
@blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["GET"])
def get_user(ccn_user):
    query_user = User.query.filter_by(ccn_user=ccn_user).first()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(query_user)
    return make_response(jsonify({"user": user}), 200)





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
"""
