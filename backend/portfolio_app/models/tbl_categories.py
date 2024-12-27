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

    posts = db.relationship("Post", back_populates="category")

    def __init__(self, category, description_category):
        self.category = category
        self.description_category = description_category

    def __repr__(self):
        return f"Category('{self.category}', Description: '{self.description_category[:30]}...')"
