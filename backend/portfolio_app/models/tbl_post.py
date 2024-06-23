from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_user import User


class Post(db.Model):
    __tablename__ = "tbl_post"
    ccn_post = db.Column(db.Integer, primary_key=True)
    ccn_author = db.Column(
        db.Integer, db.ForeignKey("tbl_user.ccn_user"), nullable=False
    )
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    update_at = db.Column(
        db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
    )

    comments = db.relationship("Comment", backref="post", lazy=True)
    categories = db.relationship(
        "Category",
        secondary="tbl_post_categories",
        lazy="subquery",
        backref=db.backref("posts", lazy=True),
    )

    def __init__(
        self,
        ccn_author,
        title,
        slug,
        content,
        published_at=None,
    ):
        self.ccn_author = ccn_author
        self.title = title
        self.slug = slug
        self.content = content
        self.published_at = published_at

    def choice_query():
        return Post.query

    def __repr__(self):
        return f"Post('{self.title}', '{self.published_at}')"
