from portfolio_app import db
from datetime import datetime
from portfolio_app.models.tbl_users import User


class Roles(db.Model):
    __tablename__ = "tbl_roles"
    ccn_role = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def __init__(self, role_name):
        self.role_name = role_name

    @staticmethod
    def choice_query():
        return Roles.query

    def __repr__(self):
        return f"Role('{self.role_name}')"

    def save(self):
        db.session.add(self)
        db.session.commit()
