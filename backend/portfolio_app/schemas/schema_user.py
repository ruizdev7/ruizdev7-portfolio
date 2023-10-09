from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from portfolio_app.models.tbl_user import User


class SchemaUser(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_relationships = True
        load_instances = True
