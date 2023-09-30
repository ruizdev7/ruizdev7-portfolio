from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from portfolio_app.models.tbl_reader import Reader


class SchemaWriter(SQLAlchemySchema):
    class Meta(SQLAlchemySchema.Meta):
        model = Reader
        csrf = False

        ccn_reader = fields.Number(dump_only=True)
        ccn_type_id = auto_field()
        number_id_reader = auto_field()
        first_name_reader = auto_field()
        middle_name_reader = auto_field()
        first_last_name_reader = auto_field()
        second_last_name_reader = auto_field()
        birthday_reader = auto_field()
        age = auto_field()
        auto_perceived_gender = auto_field()
        email_reader = auto_field()
        cellphone_reader = auto_field()
        informed_consent_law_1581 = auto_field()
        profile_picture_reader = auto_field()
