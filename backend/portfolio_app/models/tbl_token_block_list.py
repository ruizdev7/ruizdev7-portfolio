from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_users import User


class TokenBlockList(db.Model):
    __tablename__ = "tbl_token_block_list"
    ccn_token_block_list = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(300), nullable=False)
    create_at = db.Column(db.DateTime(), default=datetime.utcnow())

    def __init__(self, jti):
        self.jti = jti

    @staticmethod
    def choice_query():
        return TokenBlockList.query

    def __repr__(self):
        return f"<Token'{self.jti}')"

    def save(self):
        db.session.add(self)
        db.session.commit()
