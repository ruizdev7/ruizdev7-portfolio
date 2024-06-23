from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class PostTag(db.Model):
    __tablename__ = "tbl_post_tags"
    ccn_post = db.Column(
        db.Integer, db.ForeignKey("tbl_post.ccn_post"), primary_key=True
    )
    ccn_tag = db.Column(db.Integer, db.ForeignKey("tbl_tags.ccn_tag"), primary_key=True)

    def __init__(self, ccn_post, ccn_tag):
        self.ccn_post = ccn_post
        self.ccn_tag = ccn_tag
