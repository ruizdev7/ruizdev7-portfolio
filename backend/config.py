import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


# CONFIGURATION BASE CONFIGURATION
class Config(object):
    DEBUG = False
    TESTING = False
    DB_NAME = os.getenv("DB_NAME", "portfolio_app_pro")
    DB_USERNAME = os.getenv("DB_USERNAME", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SQLALCHEMY_DATABASE_URI",
        "mysql+pymysql://root:root@127.0.0.1:3306/portfolio_app_dev",
    )


# PRODUCTION SERVER CONFIGURATION
class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.getenv("PROD_SECRET_KEY", "super-secret-key")
    DB_NAME = os.getenv("PROD_DB_NAME", "portfolio_app_pro")
    DB_USERNAME = os.getenv("PROD_DB_USERNAME", "root")
    DB_PASSWORD = os.getenv("PROD_DB_PASSWORD", "root")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "PROD_SQLALCHEMY_DATABASE_URI",
        "mysql+pymysql://root:password@mysql_db:3306/portfolio_app_pro",
    )


# DEVELOPMENT SERVER CONFIGURATION
class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False


# TESTING SERVER CONFIGURATION
class TestingConfig(Config):
    TESTING = True
    SESSION_COOKIE_SECURE = False
    SECRET_KEY = os.getenv("TEST_SECRET_KEY", "testsecretkey")
    DB_NAME = os.getenv("TEST_DB_NAME", "portfolio_app_test")
    DB_USERNAME = os.getenv("TEST_DB_USERNAME", "root")
    DB_PASSWORD = os.getenv("TEST_DB_PASSWORD", "root")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TEST_SQLALCHEMY_DATABASE_URI",
        "mysql+pymysql://root:root@127.0.0.1:3306/portfolio_app_test",
    )
