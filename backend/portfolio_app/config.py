import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    # ...otras configuraciones...


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_SQLALCHEMY_DATABASE_URI")


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("PROD_SQLALCHEMY_DATABASE_URI")
    # ...otras configuraciones...
