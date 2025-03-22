import os
from dotenv import load_dotenv

from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow

# from werkzeug.utils import secure_filename
# from flask_swagger_ui import get_swaggerui_blueprint

from portfolio_app.extensions import db, migrate, cors, ma

# Cargar variables de entorno desde .env
load_dotenv()
jwt = JWTManager()


def create_app():
    """Create and set up the application"""
    app = Flask(__name__)

    # Basic set up
    if os.getenv("FLASK_ENV") == "production":
        app.config.from_object("config.ProductionConfig")
    elif os.getenv("FLASK_ENV") == "testing":
        app.config.from_object("config.TestingConfig")
    elif os.getenv("FLASK_ENV") == "development":
        app.config.from_object("config.DevelopmentConfig")
    else:
        app.config.from_object("config.Config")

    # If true this will only allow the cookies that contain your JWTs to be sent
    # over https. In production, this should always be set to True
    app.config["JWT_SECRET_KEY"] = "super-secret"
    # app.config["JWT_COOKIE_SECURE"] = False
    # app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    # app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

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
    from portfolio_app.models import tbl_token_block_list

    # if test_config is None:
    #     app.config.from_pyfile("config.py", silent=True)
    # else:
    #     app.config.from_mapping("test_config")

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
