from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from portfolio_app.models.tbl_writer import Writer
from portfolio_app import ma


class SchemaWriter(ma.SQLAlchemySchema):
    class Meta(SQLAlchemySchema.Meta):
        model = Writer
