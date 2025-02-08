# portfolio_app/jwt_callbacks
from portfolio_app import db

from flask import jsonify
from portfolio_app import jwt
from .models.tbl_users import User
from .models.tbl_token_block_list import TokenBlockList


def register_jwt_callbacks(jwt):
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(email=identity).first()

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
        jti = jwt_payload["jti"]
        token = TokenBlockList.query.filter_by(jti=jti).first()
        return token is not None

    @jwt.additional_claims_loader
    def make_additional_claims(identity):
        if identity == "ruizdev7@outlook.com":
            return {"is_staff": True}
        return {"is_staff": False}

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"Message": "Token has expired", "Error": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return (
            jsonify(
                {"Message": "Signature validation failed", "Error": "invalid_token"}
            ),
            401,
        )

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return (
            jsonify(
                {
                    "Message": "Request does not contain a valid token",
                    "Error": "authorization_header",
                }
            ),
            401,
        )
