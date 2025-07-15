import os
from dotenv import load_dotenv

from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow

from portfolio_app.extensions import db, migrate, cors, ma
from .config import DevelopmentConfig, TestingConfig, ProductionConfig

jwt = JWTManager()


def create_app():
    # Cargar variables de entorno desde el archivo .env correspondiente
    env = os.getenv("FLASK_ENV", "development")
    if env == "production":
        app_config = ProductionConfig
    elif env == "testing":
        app_config = TestingConfig
    else:
        app_config = DevelopmentConfig

    """Create and set up the application"""
    app = Flask(__name__)

    app.config.from_object(app_config)

    # Only print config in debug mode (remove in production)
    if app.debug:
        print("Environment Variables:")
        for key, value in app.config.items():
            print(f"{key}: {value}")

    # Initialize extensions using imported instances
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    # Es mejor inicializar CORS solo una vez para evitar conflictos.
    # Puedes combinar ambas configuraciones en una sola llamada así:
    cors.init_app(
        app,
        resources={
            r"/api/*": {"origins": ["http://localhost:5173", "http://frontend:3000"]}
        },
    )
    jwt.init_app(app)

    from portfolio_app.models import tbl_posts
    from portfolio_app.models import tbl_categories
    from portfolio_app.models import tbl_comments
    from portfolio_app.models import tbl_users
    from portfolio_app.models import tbl_token_block_list

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
