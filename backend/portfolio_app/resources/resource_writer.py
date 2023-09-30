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
from portfolio_app.models.tbl_writer import Writer
from portfolio_app.schemas.schema_writer import SchemaWriter

blueprint_api_writer = Blueprint("api_writer", __name__, url_prefix="")


@blueprint_api_writer.route("/api/v1/writer/picture/<ccn_writer>")
def serve_picture_writer(ccn_writer):
    query_writer = Writer.query.filter_by(ccn_writer=ccn_writer).first()
    image_path = f"portfolio_app/static/images/writer_photos/{query_writer.profile_picture_writer}"

    with open(image_path, "rb") as f:
        image_data = f.read()
        image_b64 = base64.b64encode(image_data)
    return jsonify({"image_b64": image_b64.decode("utf-8")})


def calculate_age(birthday_writer):
    # Assuming birthday_writer is a string in the format 'YYYY-MM-DD'
    # You can adjust the format based on how the date is stored in your database
    try:
        birth_date = datetime.datetime.strptime(birthday_writer, "%Y-%m-%d")
        current_date = datetime.datetime.now()
        age = (
            current_date.year
            - birth_date.year
            - (
                (current_date.month, current_date.day)
                < (birth_date.month, birth_date.day)
            )
        )
        return age
    except ValueError:
        return None  # Invalid date format


@blueprint_api_writer.route("/api/v1/writer", methods=["POST"])
def post_writer():
    picture = request.files["picture_writer"]
    filename = secure_filename(picture.filename)
    picture.save(os.path.join("hhrr_app/static/images/writer_photos", filename))
    age_to_save = calculate_age(birthday_writer=request.form["birthday_writer"])

    # query_for_ccn = writer.query.all()

    # query_validation = writer.query.filter_by(
    #    number_id_writer=request.form["number_id_writer"]
    # ).first()
    # if query_validation:
    #    return make_response(jsonify({"DuplicateError": "El empleado ya existe"}), 405)

    new_writer = Writer(
        ccn_type_id=request.form["ccn_type_id"],
        number_id_writer=request.form["number_id_writer"],
        first_name_writer=request.form["first_name_writer"],
        middle_name_writer=request.form["middle_name_writer"],
        first_last_name_writer=request.form["first_last_name_writer"],
        second_last_name_writer=request.form["second_last_name_writer="],
        date_of_birth_writer=request.form["date_of_birth_writer"],
        age=33,
        auto_perceived_gender=request.form["auto_perceived_gender"],
        email_writer=request.form["email_writer"],
        cellphone_writer=request.form["cellphone_writer"],
        informed_consent_law_1581=request.form["informed_consent_law_1581"],
        profile_picture_writer=filename,
        password_writer=generate_password_hash(request.form["writer_password"]),
    )

    db.session.add(new_writer)
    db.session.commit()
    schema_writer = SchemaWriter(many=False)
    writer = schema_writer.dump(new_writer)

    return make_response(
        jsonify(
            {
                "writers": writer,
                "msg": "The writer has been add succesfully",
                "Success": "true",
            }
        ),
        201,
    )


@blueprint_api_writer.route("/api/v1/writers", methods=["GET"])
def get_all_writers():
    query_all_writers = Writer.query.all()
    schema_writer = SchemaWriter(many=True)
    writers = schema_writer.dump(query_all_writers)
    return make_response(jsonify({"writers": writers}), 200)


@blueprint_api_writer.route("/api/v1/writer/<int:ccn_writer>", methods=["GET"])
def get_writer(ccn_writer):
    query_writer = Writer.query.filter_by(ccn_writer=ccn_writer).first()
    schema_writer = SchemaWriter(many=False)
    writer = schema_writer.dump(query_writer)
    return make_response(jsonify({"writer": writer}), 200)


# @jwt_required
# @blueprint_api_writer.route("/api/v1/writer/<int:ccn_writer>", methods=["PUT"])
# def put_writer(ccn_writer):
#    age_age_range = calculate_age(date_birth_writer=request.form["date_birth_writer"])
#
#    query_writer = writer.query.filter_by(ccn_writer=ccn_writer).first()
#    query_writer.number_id_writer = request.form["number_id_writer"].upper()
#    query_writer.first_name_writer = request.form["first_name_writer"].upper()
#    query_writer.middle_name_writer = request.form["middle_name_writer"].upper()
#
#    query_writer.ccn_marital_status = request.form["ccn_marital_status"].upper()
#
#    query_writer.first_last_name_writer = request.form["first_last_name_writer"].upper()
#    query_writer.second_last_name_writer = request.form[
#        "second_last_name_writer"
#    ].upper()
#    query_writer.full_name_writer = request.form["full_name_writer"].upper()
#    query_writer.date_birth_writer = request.form["date_birth_writer"].upper()
#    query_writer.age = age_age_range[0]
#    query_writer.age_range = age_age_range[1]
#    query_writer.auto_perceived_gender = request.form["auto_perceived_gender"].upper()
#    query_writer.rh = request.form["rh"]
#    query_writer.writer_personal_email = request.form["writer_personal_email"].upper()
#    query_writer.writer_personal_cellphone = request.form[
#        "writer_personal_cellphone"
#    ].upper()
#    if request.form["writer_password"]:
#        query_writer.writer_password = generate_password_hash(
#            request.form["writer_password"]
#        )
#    if len(request.files) != 0:
#        image = request.files["image"]
#        filename = secure_filename(image.filename)
#        image.save(os.path.join("hhrr_app/static/images/writer_photos", filename))
#        query_writer.image = filename
#
#
#
#
#
#    db.session.commit()
#    writer_schema = writerSchema(many=False)
#    writer_update = writer_schema.dump(query_writer)
#
#    return make_response(jsonify({"writer Updated": writer_update}), 200)
#
#
# @jwt_required
# @blueprint_api_writer.route(
#    "/api/v1/writer/informed_consent_law_1581/<int:ccn_writer>", methods=["PUT"]
# )
# def put_informed_consent_law_1581(ccn_writer):
#    data = request.get_json()
#    query_writer = writer.query.filter_by(ccn_writer=ccn_writer).first()
#    query_writer.informed_consent_law_1581 = data["informed_consent_law_1581"]
#    db.session.commit()
#    writer_schema = writerSchema(many=False)
#    writer_update = writer_schema.dump(query_writer)
#
#    return make_response(jsonify({"writer Updated": writer_update}), 200)
#
#
# @jwt_required
# @blueprint_api_writer.route("/api/v1/writer/<int:ccn_writer>", methods=["DELETE"])
# def delete_writer(ccn_writer):
#    query_delete_writer = writer.query.filter_by(ccn_writer=ccn_writer).first()
#    db.session.delete(query_delete_writer)
#    db.session.commit()
#    return make_response(
#        jsonify({"writer Deleted": "The writer has been deleted succesfully"}), 200
#    )
#
#
# @jwt_required
# @blueprint_api_writer.route("/basic-data-writer", defaults={"path": ""})
# @blueprint_api_writer.route("//<path:path>")
# def basic_data_writer(path):
#    app = create_app()
#    if path != "" and os.path.exists(app.static_folder + "/" + path):
#        return send_from_directory(app.static_folder, path)
#    else:
#        return send_from_directory(app.static_folder, "index.html")
#
#
# @jwt_required
# @blueprint_api_writer.route("/api/v1/writer/password/<int:ccn_writer>", methods=["PUT"])
# def put_is_active_writer(ccn_writer):
#    data = request.get_json()
#    query_writer = writer.query.filter_by(ccn_writer=ccn_writer).first()
#
#    if check_password_hash(query_writer.writer_password, data["last_password"]):
#        query_writer.writer_password = generate_password_hash(data["new_password"])
#
#        db.session.commit()
#
#        return make_response(
#            jsonify(
#                {
#                    "writerUpdated": {
#                        "full_name_writer": query_writer.full_name_writer,
#                    }
#                }
#            ),
#            200,
#        )
#    else:
#        return make_response(
#            jsonify(
#                {
#                    "writerUpdatedError": {
#                        "full_name_writer": query_writer.full_name_writer,
#                    }
#                }
#            ),
#            400,
#        )
#
