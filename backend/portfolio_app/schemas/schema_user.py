from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields, Schema
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
