from portfolio_app import db
from datetime import datetime


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
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
    )

    post = db.relationship("Post", backref="comments", lazy=True)

    def __init__(self, post_id, author_id, content):
        self.post_id = post_id
        self.author_id = author_id
        self.content = content

    @staticmethod
    def choice_query():
        return Comment.query

    def __repr__(self):
        return f"Comment(ID: {self.id}, Author ID: {self.author_id}, Post ID: {self.post_id})"
