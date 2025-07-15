import os

# No need to load_dotenv here; it is loaded in app.py


def get_database_uri():
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "default-secret")
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 3600))
    JWT_BLACKLIST_ENABLED = os.getenv("JWT_BLACKLIST_ENABLED", "True") == "True"
    JWT_BLACKLIST_TOKEN_CHECKS = [
        x.strip()
        for x in os.getenv("JWT_BLACKLIST_TOKEN_CHECKS", "access,refresh").split(",")
    ]
    CORS_HEADERS = os.getenv("CORS_HEADERS", "Content-Type")


class DevelopmentConfig(Config):
    DEBUG = True
    FLASK_DEBUG = 1
    SQLALCHEMY_DATABASE_URI = get_database_uri()


class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = get_database_uri()


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = get_database_uri()
