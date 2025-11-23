import os
import logging
from pathlib import Path
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables from the appropriate .env file based on FLASK_ENV FIRST
# This must be done before importing config to ensure env vars are available
env = os.getenv("FLASK_ENV", "development")
base_dir = Path(__file__).parent.parent

if env == "production":
    load_dotenv(dotenv_path=base_dir / ".env.production")
elif env == "testing":
    load_dotenv(dotenv_path=base_dir / ".env.testing")
else:
    load_dotenv(dotenv_path=base_dir / ".env.development")

from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow

from portfolio_app.extensions import db, migrate, cors, ma, mail
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
    mail.init_app(app)
    # Es mejor inicializar CORS solo una vez para evitar conflictos.
    # Puedes combinar ambas configuraciones en una sola llamada así:
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://frontend:3000",
                    "https://www.ruizdev7.com",
                    "https://ruizdev7.com",
                ]
            }
        },
        supports_credentials=True,
    )
    jwt.init_app(app)

    from portfolio_app.models import tbl_posts
    from portfolio_app.models import tbl_categories
    from portfolio_app.models import tbl_comments
    from portfolio_app.models import tbl_users
    from portfolio_app.models import tbl_token_block_list
    from portfolio_app.models import tbl_pumps
    from portfolio_app.models import tbl_roles
    from portfolio_app.models import tbl_permissions
    from portfolio_app.models import tbl_role_permissions
    from portfolio_app.models import tbl_user_roles
    from portfolio_app.models import tbl_financial_calculations
    from portfolio_app.models import tbl_contact_messages
    from portfolio_app.models import tbl_audit_logs
    # AI Governance Platform models
    from portfolio_app.models import tbl_ai_agents
    from portfolio_app.models import tbl_ai_tasks
    from portfolio_app.models import tbl_human_approvals
    from portfolio_app.models import tbl_policies
    from portfolio_app.models import tbl_blockchain_audit
    from portfolio_app.models import tbl_mpc_operations
    from portfolio_app.models import tbl_approval_settings

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
    from portfolio_app.resources.resource_pumps import blueprint_api_pump
    from portfolio_app.resources.resource_analysis import blueprint_api_analysis
    from portfolio_app.resources.resource_roles import blueprint_api_roles
    from portfolio_app.resources.resource_swagger import blueprint_api_swagger
    from portfolio_app.resources.resource_financial_calculator import (
        blueprint_api_financial_calculator,
    )
    from portfolio_app.resources.resource_contact import blueprint_api_contact
    from portfolio_app.resources.resource_audit_logs import blueprint_api_audit_logs
    from portfolio_app.resources.resource_ai_governance import blueprint_api_ai_governance

    app.register_blueprint(blueprint_api_authorization, url_prefix="")
    app.register_blueprint(blueprint_api_user, url_prefix="")
    app.register_blueprint(blueprint_api_post, url_prefix="")
    app.register_blueprint(blueprint_api_category, url_prefix="")
    app.register_blueprint(blueprint_api_pump, url_prefix="")
    app.register_blueprint(blueprint_api_analysis, url_prefix="")
    app.register_blueprint(blueprint_api_roles, url_prefix="")
    app.register_blueprint(blueprint_api_swagger, url_prefix="")
    app.register_blueprint(blueprint_api_financial_calculator, url_prefix="")
    app.register_blueprint(blueprint_api_contact, url_prefix="")
    app.register_blueprint(blueprint_api_audit_logs, url_prefix="")
    app.register_blueprint(blueprint_api_ai_governance, url_prefix="")

    # Registrar comandos de Flask
    from portfolio_app.commands import register_commands

    register_commands(app)

    # Configure logging
    if not app.debug and not app.testing:
        # Production logging configuration
        if not os.path.exists("logs"):
            os.mkdir("logs")

        file_handler = RotatingFileHandler(
            "logs/portfolio_app.log", maxBytes=10240000, backupCount=10
        )
        file_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
            )
        )
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info("Portfolio App startup")
    else:
        # Development/testing logging - simpler console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)s: %(message)s")
        )
        console_handler.setLevel(logging.DEBUG if app.debug else logging.INFO)
        app.logger.addHandler(console_handler)
        app.logger.setLevel(logging.DEBUG if app.debug else logging.INFO)

    return app
