import os
import base64
from datetime import datetime

from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from flask import jsonify, request, Blueprint, make_response, send_from_directory

from portfolio_app import db
from portfolio_app.models.tbl_categories import Category
from portfolio_app.schemas.schema_categories import SchemaCategory

blueprint_api_category = Blueprint("api_category", __name__, url_prefix="")


# Helper function for serialization
def serialize_query(query_result, schema, many=False):
    schema_instance = schema(many=many)
    return schema_instance.dump(query_result)


@blueprint_api_category.route("/api/v1/categories", methods=["GET"])
@jwt_required()
def get_all_categories():
    query_all_categories = Category.query.all()
    schema_category = SchemaCategory(many=True)
    categories = schema_category.dump(query_all_categories)
    return make_response(jsonify({"Categories": categories}), 200)
