from portfolio_app.models.tbl_project import Project
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema


class SchemaProject(SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        include_relationships = True
        load_instances = True
