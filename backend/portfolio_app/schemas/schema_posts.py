from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from portfolio_app.models.tbl_post import Post


class SchemaPost(SQLAlchemyAutoSchema):
    class Meta:
        model = Post
        include_relationships = True
        load_instances = True
