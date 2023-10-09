from portfolio_app import db


class User(db.Model):
    __tablename__ = "tbl_user"
    ccn_user = db.Column(db.Integer, primary_key=True)
    number_id_user = db.Column(db.BigInteger, nullable=False, unique=True)
    first_name_user = db.Column(db.String(60), nullable=False)
    middle_name_user = db.Column(db.String(60), nullable=True)
    last_name_user = db.Column(db.String(60), nullable=True)
    birthdate_user = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    auto_perceived_gender = db.Column(
        db.Integer, db.ForeignKey("tbl_auto_perceived_gender.ccn_auto_perceived_gender")
    )
    email_user = db.Column(db.String(100), nullable=False)
    cellphone_user = db.Column(db.BigInteger, nullable=False)
    terms_and_conditions = db.Column(db.String(10), nullable=False)
    profile_picture_user = db.Column(db.String(255), nullable=True)
    password_user = db.Column(db.String(300), nullable=False)

    def __init__(
        self,
        number_id_user,
        first_name_user,
        middle_name_user,
        last_name_user,
        birthdate_user,
        age,
        auto_perceived_gender,
        email_user,
        cellphone_user,
        terms_and_conditions,
        profile_picture_user,
        password_user,
    ):
        self.number_id_user = number_id_user
        self.first_name_user = first_name_user
        self.middle_name_user = middle_name_user
        self.last_name_user = last_name_user
        self.birthdate_user = birthdate_user
        self.age = age
        self.auto_perceived_gender = auto_perceived_gender
        self.email_user = email_user
        self.cellphone_user = cellphone_user
        self.terms_and_conditions = terms_and_conditions
        self.profile_picture_user = profile_picture_user
        self.password_user = password_user

    def choice_query():
        return User.query

    def __repr__(self):
        return f"User: {self.number_id_user}"
