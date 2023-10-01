from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field, SQLAlchemyAutoSchema
from portfolio_app.models.tbl_writer import Writer


class SchemaWriter(SQLAlchemyAutoSchema):
    class Meta:
        model = Writer
        include_relationships = True
        load_instances = True
