from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from portfolio_app.models.tbl_like import Like


class SchemaUser(SQLAlchemyAutoSchema):
    class Meta:
        model = Like
        include_relationships = True
        load_instances = True
