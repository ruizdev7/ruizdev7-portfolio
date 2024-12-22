from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User


class Post(db.Model):
    __tablename__ = "tbl_post"
    ccn_post = db.Column(db.Integer, primary_key=True)
    ccn_author = db.Column(
        db.Integer, db.ForeignKey("tbl_user.ccn_user"), nullable=False
    )
    ccn_category = db.Column(
        db.Integer,
        db.ForeignKey("tbl_categories.ccn_category"),
        nullable=False,
    )
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    published_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
    )

    category = db.relationship("Category", backref=db.backref("posts", lazy=True))

    def __init__(self, ccn_author, ccn_category, title, content):
        self.title = title
        self.content = content
        self.ccn_author = ccn_author
        self.ccn_category = ccn_category

    @staticmethod
    def choice_query():
        return Post.query

    def __repr__(self):
        return f"Post('{self.title}', Published at: '{self.published_at.strftime('%Y-%m-%d %H:%M:%S')}')"
