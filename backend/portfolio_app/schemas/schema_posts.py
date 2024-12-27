from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from portfolio_app.models.tbl_posts import Post

# from portfolio_app.schemas.schema_user import SchemaUser
# from portfolio_app.schemas.schema_categories import SchemaCategory


class SchemaPost(SQLAlchemyAutoSchema):
    # author = fields.Nested(SchemaUser)
    # category = fields.Nested(SchemaCategory)

    class Meta:
        model = Post
        include_relationships = True
        load_instances = True
