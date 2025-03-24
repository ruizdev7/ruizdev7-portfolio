import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env correspondiente
env = os.getenv(
    "FLASK_ENV",
)

if env == "production":
    load_dotenv(dotenv_path=".env.production")
elif env == "testing":
    load_dotenv(dotenv_path=".env.testing")
else:
    load_dotenv(dotenv_path=".env.development")


def get_database_uri():
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = 3600
    JWT_REFRESH_TOKEN_EXPIRES = 3600
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    CORS_HEADERS = "Content-Type"


class DevelopmentConfig(Config):
    DEBUG = True
    FLASK_DEBUG = 1
    os.environ["FLASK_DEBUG"] = "1"
    SQLALCHEMY_DATABASE_URI = get_database_uri()


class TestingConfig(Config):
    DEBUG = False
    FLASK_DEBUG = 0
    os.environ["FLASK_DEBUG"] = "0"
    TESTING = True
    SQLALCHEMY_DATABASE_URI = get_database_uri()


class ProductionConfig(Config):
    DEBUG = False
    FLASK_DEBUG = 0
    os.environ["FLASK_DEBUG"] = "0"
    TESTING = True
    SQLALCHEMY_DATABASE_URI = get_database_uri()
