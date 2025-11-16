from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields, Schema, validate
from portfolio_app.models.tbl_users import User


class SchemaUser(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        # Excluir campos sensibles
        exclude = ("password", "account_id")
        # No incluir relaciones automáticamente
        include_relationships = False
        load_instances = True


# Schema específico para respuesta de autenticación
class AuthResponseSchema(Schema):
    ccn_user = fields.Int(dump_only=True)
    first_name = fields.Str(dump_only=True)
    middle_name = fields.Str(dump_only=True, allow_none=True)
    last_name = fields.Str(dump_only=True)
    email = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


# Schema para actualizar email
class UpdateEmailSchema(Schema):
    email = fields.Email(
        required=True,
        validate=validate.Length(min=5, max=100),
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format",
        },
    )


# Schema para actualizar contraseña
class UpdatePasswordSchema(Schema):
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=100),
        error_messages={
            "required": "Password is required",
            "invalid": "Password must be at least 8 characters long",
        },
    )
    current_password = fields.Str(
        required=False,
        validate=validate.Length(min=1),
        error_messages={"invalid": "Current password is required"},
    )


# Schema para forgot password
class ForgotPasswordSchema(Schema):
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format",
        },
    )


# Schema para reset password
class ResetPasswordSchema(Schema):
    token = fields.Str(
        required=True,
        validate=validate.Length(min=32),
        error_messages={"required": "Reset token is required"},
    )
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=100),
        error_messages={
            "required": "New password is required",
            "invalid": "Password must be at least 8 characters long",
        },
    )
