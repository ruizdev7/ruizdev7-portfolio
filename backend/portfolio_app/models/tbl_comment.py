from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class Comment(db.Model):
    __tablename__ = "tbl_comment"
    ccn_comment = db.Column(db.Integer, primary_key=True)
    text_comment = db.Column(db.String(200), nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    rel_authors = db.Column(
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
        text_comment,
        date_posted,
    ):
        self.text_comment = text_comment
        self.date_posted = date_posted

    def choice_query():
        return Post.query

    def __repr__(self):
        return f"Comments('{self.ccn_comment}', '{self.text_comment}')"
