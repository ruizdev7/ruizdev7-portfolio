from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class PostMeta(db.Model):
    __tablename__ = "tbl_post_meta"
    ccn_post_meta = db.Column(db.Integer, primary_key=True)
    ccn_post = db.Column(
        db.Integer, db.ForeignKey("tbl_posts.ccn_post"), nullable=False
    )
    meta_key = db.Column(db.String(255))
    meta_value = db.Column(db.Text)

    def __init__(self, ccn_post, meta_key, meta_value):
        self.ccn_post = ccn_post
        self.meta_key = meta_key
        self.meta_value = meta_value
