from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User
from portfolio_app.models.tbl_post import Post


class Comment(db.Model):
    __tablename__ = "tbl_comment"
    ccn_comment = db.Column(db.Integer, primary_key=True)
    ccn_post = db.Column(
        db.Integer,
        db.ForeignKey("tbl_post.ccn_post", ondelete="CASCADE"),
        nullable=False,
    )
    ccn_author = db.Column(
        db.Integer,
        db.ForeignKey("tbl_user.ccn_user", ondelete="CASCADE"),
        nullable=False,
    )

    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def __init__(
        self,
        ccn_post,
        ccn_author,
        content,
        created_at,
    ):
        self.ccn_post = ccn_post
        ccn_author = ccn_author
        self.content = content

    def choice_query():
        return Post.query

    def __repr__(self):
        return f"Comments('{self.ccn_comment}', '{self.ccn_author}', '{self.ccn_post}')"
