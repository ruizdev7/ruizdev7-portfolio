from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from portfolio_app.models.tbl_comment import Comment


class SchemaComment(SQLAlchemyAutoSchema):
    class Meta:
        model = Comment
        include_relationships = True
        load_instances = True
