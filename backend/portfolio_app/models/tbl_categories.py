from portfolio_app import db
from datetime import datetime


class Category(db.Model):
    __tablename__ = "tbl_categories"
    ccn_category = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), unique=True, nullable=False)
    description_category = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
    )

    def __init__(self, name, description):
        self.name = name
        self.description = description

    def __repr__(self):
        return f"Category('{self.name}', Description: '{self.description[:30]}...')"
