from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User


class Post(db.Model):
    __tablename__ = "tbl_post"
    ccn_post = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    content = db.Column(db.Text, nullable=False)
    views = db.Column(db.Integer, default=0)

    rel_users = db.Column(
        db.Integer, db.ForeignKey("tbl_user.ccn_user"), nullable=False
    )
    rel_comments = db.relationship("Comment", backref="post", lazy=True)
    rel_likes = db.relationship("Like", backref="post", lazy=True)

    def __init__(
        self,
        title,
        date_posted,
        content,
        views,
    ):
        self.title = title
        self.date_posted = date_posted
        self.content = content
        self.views = views

    def choice_query():
        return Post.query

    def __repr__(self):
        return f"Post('{self.title}', '{self.date_posted}')"
