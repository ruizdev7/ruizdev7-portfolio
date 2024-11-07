from datetime import datetime
from portfolio_app import db


class User(db.Model):
    __tablename__ = "tbl_user"
    ccn_user = db.Column(db.Integer, primary_key=True)
    name_user = db.Column(db.String(20), nullable=False)
    middle_name_user = db.Column(db.String(20), nullable=True)
    last_name_user = db.Column(db.String(20), nullable=False)

    email_user = db.Column(db.String(100), unique=True, nullable=False)
    password_user = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    posts = db.relationship("Post", backref="tbl_user.ccn_user", lazy=True)
    comments = db.relationship("Comment", backref="tbl_comment.ccn_comment", lazy=True)

    def __init__(
        self,
        name_user,
        middle_name_user,
        last_name_user,
        email_user,
        password_user,
    ):
        self.name_user = name_user
        self.middle_name_user
        self.last_name_user = last_name_user
        self.email_user = email_user
        self.password_user = password_user

    def choice_query():
        return User.query

    def __repr__(self):
        return f"User: {self.email_user}"
