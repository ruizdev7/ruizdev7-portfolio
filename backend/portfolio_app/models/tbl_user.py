from datetime import datetime
from portfolio_app import db


class User(db.Model):
    __tablename__ = "tbl_user"
    ccn_user = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(20), nullable=False)
    middle_name = db.Column(db.String(20), nullable=True)
    last_name = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    posts = db.relationship("Post", backref="author", lazy=True)
    comments = db.relationship("Comment", backref="user", lazy=True)

    def __init__(self, first_name, middle_name, last_name, email, password):
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.email = email
        self.password = password

    @staticmethod
    def choice_query():
        return User.query

    def __repr__(self):
        return f"User('{self.first_name} {self.last_name}', Email: '{self.email}')"
