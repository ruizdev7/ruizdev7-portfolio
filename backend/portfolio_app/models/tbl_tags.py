from datetime import datetime
from portfolio_app import db


class Tag(db.Model):
    __tablename__ = "tbl_tags"
    ccn_tag = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(100), unique=True, nullable=False)

    def __init__(self, tag):
        self.tag = tag
