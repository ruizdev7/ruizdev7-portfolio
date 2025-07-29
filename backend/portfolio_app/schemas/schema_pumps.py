from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from portfolio_app.models.tbl_pumps import Pump


class SchemaPump(SQLAlchemyAutoSchema):
    class Meta:
        model = Pump
        include_relationships = True
        load_instances = True
