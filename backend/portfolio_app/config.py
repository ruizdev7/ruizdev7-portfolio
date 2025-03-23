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


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    # ...otras configuraciones...


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    # ...otras configuraciones...
