import os
from dotenv import load_dotenv

from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from werkzeug.utils import secure_filename
from flask_swagger_ui import get_swaggerui_blueprint

from portfolio_app.extensions import db, migrate, cors, ma

# Cargar variables de entorno desde .env
load_dotenv()
jwt = JWTManager()


def create_app(test_config=None):
    """Create and set up the application"""
    app = Flask(__name__)

    # Basic set up
    app.config.from_object("config.DevelopmentConfig")

    app.config["JWT_SECRET_KEY"] = "super-secret"
    db.init_app(app)
    migrate = Migrate(app, db)
    migrate.init_app(app, db)
    ma = Marshmallow(app)
    cors = CORS()
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    jwt = JWTManager(app)

    from portfolio_app.models import tbl_posts
    from portfolio_app.models import tbl_categories
    from portfolio_app.models import tbl_comments
    from portfolio_app.models import tbl_users

    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping("test_config")

    os.makedirs(app.instance_path, exist_ok=True)

    # Register JWT callbacks using the newly created 'jwt' instance
    from portfolio_app.jwt_callbacks import register_jwt_callbacks

    register_jwt_callbacks(jwt)  # <-- Pass 'jwt' to the registration function

    from portfolio_app.resources.resource_authorization import (
        blueprint_api_authorization,
    )
    from portfolio_app.resources.resource_users import blueprint_api_user
    from portfolio_app.resources.resource_posts import blueprint_api_post
    from portfolio_app.resources.resource_categories import blueprint_api_category

    app.register_blueprint(blueprint_api_authorization, url_prefix="")
    app.register_blueprint(blueprint_api_user, url_prefix="")
    app.register_blueprint(blueprint_api_post, url_prefix="")
    app.register_blueprint(blueprint_api_category, url_prefix="")

    return app
