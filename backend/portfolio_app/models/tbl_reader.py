from datetime import datetime

from portfolio_app import db


class Reader(db.Model):
    __tablename__ = "tbl_reader"
    ccn_reader = db.Column(db.Integer, primary_key=True)
    ccn_type_id = db.Column(db.Integer, db.ForeignKey("tbl_type_id.ccn_type_id"))
    number_id_reader = db.Column(db.BigInteger, nullable=False, unique=True)
    first_name_reader = db.Column(db.String(60), nullable=False)
    middle_name_reader = db.Column(db.String(60), nullable=True)
    first_last_name_reader = db.Column(db.String(60), nullable=False)
    second_last_name_reader = db.Column(db.String(60), nullable=True)
    birthday_reader = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    auto_perceived_gender = db.Column(
        db.Integer, db.ForeignKey("tbl_auto_perceived_gender.ccn_auto_perceived_gender")
    )
    email_reader = db.Column(db.String(100), nullable=False)
    cellphone_reader = db.Column(db.BigInteger, nullable=False)
    informed_consent_law_1581 = db.Column(db.String(10), nullable=False)
    profile_picture_reader = db.Column(db.String(255), nullable=True)
    password_reader = db.Column(db.String(300), nullable=False)

    def __init__(
        self,
        ccn_reader,
        ccn_type_id,
        number_id_reader,
        first_name_reader,
        middle_name_reader,
        first_last_name_reader,
        second_last_name_reader,
        birthday_reader,
        age,
        auto_perceived_gender,
        email_reader,
        cellphone_reader,
        informed_consent_law_1581,
        profile_picture_reader,
        password_reader,
    ):
        self.ccn_reader = ccn_reader
        self.ccn_type_id = ccn_type_id
        self.number_id_reader = number_id_reader
        self.first_name_reader = first_name_reader
        self.middle_name_reader = middle_name_reader
        self.first_last_name_reader = first_last_name_reader
        self.second_last_name_reader = second_last_name_reader
        self.birthday_reader = birthday_reader
        self.age = age
        self.auto_perceived_gender = auto_perceived_gender
        self.email_reader = email_reader
        self.cellphone_reader = cellphone_reader
        self.informed_consent_law_1581 = informed_consent_law_1581
        self.profile_picture_reader = profile_picture_reader
        self.password_reader = password_reader

    def choice_query():
        return Reader.query

    def __repr__(self):
        return f"Reader: {self.number_id_reader}"
