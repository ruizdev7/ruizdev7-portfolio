from datetime import datetime
from portfolio_app import db
from werkzeug.security import generate_password_hash


class User(db.Model):
    __tablename__ = "tbl_users"
    ccn_user = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(20), nullable=False)
    middle_name = db.Column(db.String(20), nullable=True)
    last_name = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    account_id = db.Column(db.String(300), nullable=False, unique=True)

    posts = db.relationship("Post", back_populates="author")
    comments = db.relationship("Comment", backref="user", lazy=True)

    def __init__(self, first_name, middle_name, last_name, email, password):
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.created_at = datetime.now()
        self.account_id = self.generate_account_id()

    def generate_account_id(self):
        data = f"{self.email}{self.first_name}{self.last_name}{self.created_at}"
        return generate_password_hash(data)

    @staticmethod
    def choice_query():
        return User.query

    def __repr__(self):
        return f"User('{self.first_name} {self.last_name}', Email: '{self.email}')"
