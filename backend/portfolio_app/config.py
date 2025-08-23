import os
from datetime import timedelta

# No need to load_dotenv here; it is loaded in app.py


def get_database_uri():
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


class Config:
    """Base configuration class."""

    SECRET_KEY = os.environ.get("SECRET_KEY") or "default-secret-key"

    # Database configuration
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "default-jwt-secret"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Aumentado a 24 horas
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)  # Aumentado a 7 días
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]

    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join("portfolio_app", "static", "pumps")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    FLASK_DEBUG = True

    # Database
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or "mysql+pymysql://root:root@host.docker.internal:3306/portfolio_app_dev"
    )

    # JWT
    JWT_SECRET_KEY = (
        os.environ.get("JWT_SECRET_KEY") or "default-jwt-secret-development"
    )


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True

    # Database (use SQLite for tests)
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    # JWT
    JWT_SECRET_KEY = "test-jwt-secret"


class ProductionConfig(Config):
    """Production configuration."""

    # Database
    SQLALCHEMY_DATABASE_URI = get_database_uri()

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY must be set in production")

    # Security
    SECRET_KEY = os.environ.get("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production")
