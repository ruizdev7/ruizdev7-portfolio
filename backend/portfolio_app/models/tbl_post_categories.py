from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class PostCategory(db.Model):
    __tablename__ = "tbl_post_categories"
    ccn_post = db.Column(
        db.Integer, db.ForeignKey("tbl_post.ccn_post"), primary_key=True
    )
    ccn_category = db.Column(
        db.Integer, db.ForeignKey("tbl_categories.ccn_category"), primary_key=True
    )

    def __init__(self, ccn_post, ccn_category):
        self.ccn_post = ccn_post
        self.ccn_category = ccn_category
