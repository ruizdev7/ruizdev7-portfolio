import os
import base64
from datetime import datetime

from flask import request
from flask import jsonify
from flask import Blueprint
from flask import make_response
from flask import send_from_directory

from flask_jwt_extended import jwt_required

from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from portfolio_app import create_app


from hhrr_app import db
from hhrr_app.models.tbl_employee import Employee
from hhrr_app.schema.employee_schema import EmployeeSchema
