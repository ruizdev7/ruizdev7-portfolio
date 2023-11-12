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
    query_for_ccn = user.query.all()
    query_validation = user.query.filter_by(
        email_user=request.form["email_user"]
    ).first()
    if query_validation:
        return make_response(jsonify({"DuplicateError": "User already exist!!"}), 405)

    new_user = user(
        email_user=request.form["email_user"],
        password_user=generate_password_hash(request.form["password_user"]),
    )

    db.session.add(new_user)
    db.session.commit()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(new_user)

    return make_response(
        jsonify(
            {
                "User": user,
                "msg": "The user has been add succesfully",
            }
        ),
        201,
    )


@blueprint_api_user.route("/api/v1/user/picture/<ccn_user>")
def serve_profile_picture_user(ccn_user):
    query_user = User.query.filter_by(ccn_user=ccn_user).first()
    image_path = (
        f"portfolio_app/static/images/user_photos/{query_user.profile_picture_user}"
    )

    with open(image_path, "rb") as f:
        image_data = f.read()
        image_b64 = base64.b64encode(image_data)
    return jsonify({"image_b64": image_b64.decode("utf-8")})


@blueprint_api_user.route("/api/v1/users", methods=["GET"])
def get_all_users():
    query_all_users = User.query.all()
    schema_user = SchemaUser(many=True)
    users = schema_user.dump(query_all_users)
    return make_response(jsonify({"Users": users}), 200)


@blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["GET"])
def get_user(ccn_user):
    query_user = User.query.filter_by(ccn_user=ccn_user).first()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(query_user)
    return make_response(jsonify({"user": user}), 200)


# @jwt_required
@blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["DELETE"])
def delete_user(ccn_user):
    query_user_to_delete = User.query.filter_by(ccn_user=ccn_user).first()
    db.session.delete(query_user_to_delete)
    db.session.commit()
    return make_response(
        jsonify({"Response": "The user has been deleted succesfully"}), 200
    )


# @jwt_required
# @blueprint_api_user.route("/api/v1/user/<int:ccn_user>", methods=["PUT"])
# def put_user(ccn_user):
#    age_age_range = calculate_age(date_birth_user=request.form["date_birth_user"])
#
#    query_user = user.query.filter_by(ccn_user=ccn_user).first()
#    query_user.number_id_user = request.form["number_id_user"].upper()
#    query_user.first_name_user = request.form["first_name_user"].upper()
#    query_user.middle_name_user = request.form["middle_name_user"].upper()
#
#    query_user.ccn_marital_status = request.form["ccn_marital_status"].upper()
#
#    query_user.first_last_name_user = request.form["first_last_name_user"].upper()
#    query_user.second_last_name_user = request.form[
#        "second_last_name_user"
#    ].upper()
#    query_user.full_name_user = request.form["full_name_user"].upper()
#    query_user.date_birth_user = request.form["date_birth_user"].upper()
#    query_user.age = age_age_range[0]
#    query_user.age_range = age_age_range[1]
#    query_user.auto_perceived_gender = request.form["auto_perceived_gender"].upper()
#    query_user.rh = request.form["rh"]
#    query_user.user_personal_email = request.form["user_personal_email"].upper()
#    query_user.user_personal_cellphone = request.form[
#        "user_personal_cellphone"
#    ].upper()
#    if request.form["user_password"]:
#        query_user.user_password = generate_password_hash(
#            request.form["user_password"]
#        )
#    if len(request.files) != 0:
#        image = request.files["image"]
#        filename = secure_filename(image.filename)
#        image.save(os.path.join("hhrr_app/static/images/user_photos", filename))
#        query_user.image = filename
#
#
#
#
#
#    db.session.commit()
#    user_schema = userSchema(many=False)
#    user_update = user_schema.dump(query_user)
#
#    return make_response(jsonify({"user Updated": user_update}), 200)
#
#
# @jwt_required
# @blueprint_api_user.route(
#    "/api/v1/user/informed_consent_law_1581/<int:ccn_user>", methods=["PUT"]
# )
# def put_informed_consent_law_1581(ccn_user):
#    data = request.get_json()
#    query_user = user.query.filter_by(ccn_user=ccn_user).first()
#    query_user.informed_consent_law_1581 = data["informed_consent_law_1581"]
#    db.session.commit()
#    user_schema = userSchema(many=False)
#    user_update = user_schema.dump(query_user)
#
#    return make_response(jsonify({"user Updated": user_update}), 200)
