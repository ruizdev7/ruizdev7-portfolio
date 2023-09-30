from datetime import datetime

from portfolio_app import db


class Writer(db.Model):
    __tablename__ = "tbl_writer"
    ccn_writer = db.Column(db.Integer, primary_key=True)
    ccn_type_id = db.Column(db.Integer, db.ForeignKey("tbl_type_id.ccn_type_id"))
    number_id_writer = db.Column(db.BigInteger, nullable=False, unique=True)
    first_name_writer = db.Column(db.String(60), nullable=False)
    middle_name_writer = db.Column(db.String(60), nullable=True)
    first_last_name_writer = db.Column(db.String(60), nullable=False)
    second_last_name_writer = db.Column(db.String(60), nullable=True)
    date_of_birth_writer = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    auto_perceived_gender = db.Column(
        db.Integer, db.ForeignKey("tbl_auto_perceived_gender.ccn_auto_perceived_gender")
    )
    email_writer = db.Column(db.String(100), nullable=False)
    cellphone_writer = db.Column(db.BigInteger, nullable=False)
    informed_consent_law_1581 = db.Column(db.String(10), nullable=False)
    profile_picture_writer = db.Column(db.String(255), nullable=True)
    password_writer = db.Column(db.String(300), nullable=False)

    def __init__(
        self,
        ccn_type_id,
        number_id_writer,
        first_name_writer,
        middle_name_writer,
        first_last_name_writer,
        second_last_name_writer,
        date_of_birth_writer,
        age,
        auto_perceived_gender,
        email_writer,
        cellphone_writer,
        informed_consent_law_1581,
        profile_picture_writer,
        password_writer,
    ):
        self.ccn_type_id = ccn_type_id
        self.number_id_writer = number_id_writer
        self.first_name_writer = first_name_writer
        self.middle_name_writer = middle_name_writer
        self.first_last_name_writer = first_last_name_writer
        self.second_last_name_writer = second_last_name_writer
        self.date_of_birth_writer = date_of_birth_writer
        self.age = age
        self.auto_perceived_gender = auto_perceived_gender
        self.email_writer = email_writer
        self.cellphone_writer = cellphone_writer
        self.informed_consent_law_1581 = informed_consent_law_1581
        self.profile_picture_writer = profile_picture_writer
        self.password_writer = password_writer

    def choice_query():
        return Writer.query

    def __repr__(self):
        return f"Writer: {self.number_id_writer}"
