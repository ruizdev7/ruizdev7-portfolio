import os
from dotenv import load_dotenv  # Nuevo: para manejar variables de entorno

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_swagger_ui import get_swaggerui_blueprint

# Cargar variables de entorno desde .env
load_dotenv()

# Inicializar extensiones
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
ma = Marshmallow()


def create_app(test_config=None):
    # Crear y configurar la app
    app = Flask(__name__)

    # Configuración básica
    app.config.from_object("config.DevelopmentConfig")

    # Sobreescribir configuración si se pasa test_config
    if test_config:
        app.config.update(test_config)

    # Configuración de JWT usando variables de entorno
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600)
    )

    # Inicializar extensiones con la app
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": os.getenv("CORS_ALLOWED_ORIGINS", "*")}},
        supports_credentials=True,
    )

    # Importar modelos dentro del contexto de la aplicación
    with app.app_context():
        from portfolio_app.models import (
            tbl_posts,
            tbl_categories,
            tbl_comments,
            tbl_users,
        )

    # Configurar Swagger UI
    SWAGGER_URL = "/api/docs"
    API_URL = "/static/swagger.json"
    swagger_ui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL, API_URL, config={"app_name": "Portfolio API"}
    )
    app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

    # Registrar blueprints con prefijos
    from portfolio_app.resources.resource_authorization import (
        blueprint_api_authorization,
    )
    from portfolio_app.resources.resource_users import blueprint_api_user
    from portfolio_app.resources.resource_posts import blueprint_api_post
    from portfolio_app.resources.resource_categories import blueprint_api_category

    app.register_blueprint(blueprint_api_authorization, url_prefix="/api/auth")
    app.register_blueprint(blueprint_api_user, url_prefix="/api/users")
    app.register_blueprint(blueprint_api_post, url_prefix="/api/posts")
    app.register_blueprint(blueprint_api_category, url_prefix="/api/categories")

    # Endpoint básico de salud
    @app.route("/health")
    def health_check():
        return {"status": "OK", "message": "Service is healthy"}, 200

    return app
