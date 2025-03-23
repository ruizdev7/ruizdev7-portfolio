import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env correspondiente
env = os.getenv("FLASK_ENV", "development")

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
    # ...otras configuraciones...


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = get_database_uri()


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = get_database_uri()


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    # ...otras configuraciones...
