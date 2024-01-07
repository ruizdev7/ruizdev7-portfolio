import os
from flask import Flask
from flask_cors import CORS, cross_origin
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_swagger_ui import get_swaggerui_blueprint


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
ma = Marshmallow()


def create_app(test_config=None):
    app = Flask(
        __name__,
        # instance_relative_config=True,
        # static_folder="../dist",
        # static_url_path="",
    )

    app.config.from_object("config.DevelopmentConfig")
    app.config["JWT_SECRET_KEY"] = "super-secret"
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    migrate.init_app(app, db)
    ma = Marshmallow(app)
    cors = CORS()
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    from portfolio_app.models import tbl_comment
    from portfolio_app.models import tbl_like
    from portfolio_app.models import tbl_post
    from portfolio_app.models import tbl_user

    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping("test_config")

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from portfolio_app.resources.resource_authorization import (
        blueprint_api_authorization,
    )
    from portfolio_app.resources.resource_user import blueprint_api_user

    app.register_blueprint(blueprint_api_authorization, url_prefix="")

    app.register_blueprint(blueprint_api_user, url_prefix="")

    return app
