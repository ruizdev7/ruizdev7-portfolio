from portfolio_app import db


class User(db.Model):
    __tablename__ = "tbl_loans"
    ccn_loan = db.Column(db.Integer, primary_key=True)
    email_user = db.Column(db.String(100), nullable=False)
    password_user = db.Column(db.String(300), nullable=False)

    posts = db.relationship("Post", backref="tbl_user.ccn_user", lazy=True)
    comments = db.relationship("Comment", backref="tbl_comment.ccn_comment", lazy=True)
    likes = db.relationship("Like", backref="tbl_like.ccn_like", lazy=True)
    # terms_and_conditions = db.Column(db.String(10), nullable=False)
    # profile_picture_user = db.Column(db.String(255), nullable=True)

    def __init__(
        self,
        email_user,
        password_user,
        # terms_and_conditions,
        # profile_picture_user,
    ):
        self.email_user = email_user
        self.password_user = password_user
        # self.terms_and_conditions = terms_and_conditions
        # self.profile_picture_user = profile_picture_user

    def choice_query():
        return User.query

    def __repr__(self):
        return f"User: {self.email_user}"
