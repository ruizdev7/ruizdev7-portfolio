from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from portfolio_app.models.tbl_categories import Category


class SchemaCategory(SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        include_relationships = True
        load_instances = True
