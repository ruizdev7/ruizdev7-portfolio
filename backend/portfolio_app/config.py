import os
from datetime import timedelta

# No need to load_dotenv here; it is loaded in app.py


def get_database_uri():
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")

    # Si todas las variables están definidas, construir la URI
    if all([db_user, db_password, db_host, db_port, db_name]):
        return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return None


class Config:
    """Base configuration class."""

    SECRET_KEY = os.environ.get("SECRET_KEY") or "default-secret-key"

    # Database configuration
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "default-jwt-secret"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Aumentado a 24 horas
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=2)  # Aumentado a 7 días
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]

    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join("portfolio_app", "static", "pumps")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    # Email configuration (Outlook/Hotmail)
    MAIL_SERVER = os.environ.get("MAIL_SERVER") or "smtp-mail.outlook.com"
    MAIL_PORT = int(os.environ.get("MAIL_PORT") or 587)
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER") or MAIL_USERNAME
    # Email sending suppression (for testing)
    _mail_suppress = os.environ.get("MAIL_SUPPRESS_SEND", "False")
    MAIL_SUPPRESS_SEND = str(_mail_suppress).lower() in ("true", "1", "yes")

    # OpenAI configuration
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    FLASK_DEBUG = True

    # Database - Usa variables de entorno o fallback para desarrollo local
    SQLALCHEMY_DATABASE_URI = (
        get_database_uri()
        or os.environ.get("DATABASE_URL")
        or "mysql+pymysql://root:root@host.docker.internal:3306/portfolio_app_dev"
    )

    # JWT
    JWT_SECRET_KEY = (
        os.environ.get("JWT_SECRET_KEY") or "default-jwt-secret-development"
    )

    # Email - Enable testing mode by default in development
    _mail_suppress = os.environ.get("MAIL_SUPPRESS_SEND", "True")
    MAIL_SUPPRESS_SEND = str(_mail_suppress).lower() in ("true", "1", "yes")


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
