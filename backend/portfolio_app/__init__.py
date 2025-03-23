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
from .config import DevelopmentConfig, TestingConfig, ProductionConfig

# Cargar variables de entorno desde .env
load_dotenv()
jwt = JWTManager()


def load_env_variables():
    """Load environment variables based on the environment"""
    env = os.getenv("FLASK_ENV")
    if env == "development":
        load_dotenv(".env.development")
    elif env == "testing":
        load_dotenv(".env.testing")
    elif env == "production":
        load_dotenv(".env.production")
    else:
        load_dotenv(".env")


def print_env_variables():
    """Print all environment variables in a readable format"""
    print("Environment Variables:")
    print(f"FLASK_APP: {os.getenv('FLASK_APP')}")
    print(f"FLASK_ENV: {os.getenv('FLASK_ENV')}")
    print(f"SECRET_KEY: {os.getenv('SECRET_KEY')}")
    print(f"SQLALCHEMY_DATABASE_URI: {os.getenv('SQLALCHEMY_DATABASE_URI')}")
    print(f"TEST_SQLALCHEMY_DATABASE_URI: {os.getenv('TEST_SQLALCHEMY_DATABASE_URI')}")
    print(f"PROD_SQLALCHEMY_DATABASE_URI: {os.getenv('PROD_SQLALCHEMY_DATABASE_URI')}")
    # ...agrega más variables según sea necesario...


def create_app():
    """Create and set up the application"""
    app = Flask(__name__)

    # Cargar las variables de entorno específicas
    load_env_variables()

    # Seleccionar la configuración según el entorno
    env = os.getenv("FLASK_ENV")
    if env == "development":
        app.config.from_object(DevelopmentConfig)
    elif env == "testing":
        app.config.from_object(TestingConfig)
    elif env == "production":
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    # Imprimir las variables de entorno
    print_env_variables()

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
