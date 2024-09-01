from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class Category(db.Model):
    __tablename__ = "tbl_categories"
    ccn_category = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), unique=True, nullable=False)

    def __init__(self, category):
        self.category = category
