import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


# CONFIGURATION BASE CONFIGURATION
class Config(object):
    DEBUG = False
    TESTING = False
    DB_NAME = os.getenv("DB_NAME")
    DB_USERNAME = os.getenv("DB_USERNAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")


# PRODUCTION SERVER CONFIGURATION
class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.getenv("SECRET_KEY")
    DB_NAME = os.getenv("DB_NAME")
    DB_USERNAME = os.getenv("DB_USERNAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")


# DEVELOPMENT SERVER CONFIGURATION
class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False


# TESTING SERVER CONFIGURATION
class TestingConfig(Config):
    TESTING = True
    SESSION_COOKIE_SECURE = False
    SECRET_KEY = os.getenv("SECRET_KEY")
    DB_NAME = os.getenv("DB_NAME")
    DB_USERNAME = os.getenv("DB_USERNAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
