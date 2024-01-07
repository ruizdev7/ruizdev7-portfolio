from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class Like(db.Model):
    __tablename__ = "tbl_likes"
    ccn_like = db.Column(db.Integer, primary_key=True)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    ccn_author = db.Column(
        db.Integer,
        db.ForeignKey("tbl_user.ccn_user", ondelete="CASCADE"),
        nullable=False,
    )
    ccn_post = db.Column(
        db.Integer,
        db.ForeignKey("tbl_post.ccn_post", ondelete="CASCADE"),
        nullable=False,
    )

    def __init__(
        self,
        date_posted,
    ):
        self.date_posted = date_posted

    def choice_query():
        return Post.query

    def __repr__(self):
        return f"Comments('{self.ccn_like}')"
