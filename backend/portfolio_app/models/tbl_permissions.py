from portfolio_app import db
from datetime import datetime


class Permissions(db.Model):
    __tablename__ = "tbl_permissions"
    ccn_permission = db.Column(db.Integer, primary_key=True)
    permission_name = db.Column(db.String(50), nullable=False, unique=True)
    resource = db.Column(db.String(50), nullable=False)  # posts, users, pumps, etc.
    action = db.Column(db.String(20), nullable=False)  # create, read, update, delete
    description = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def __init__(self, permission_name, resource, action, description=None):
        self.permission_name = permission_name
        self.resource = resource
        self.action = action
        self.description = description

    @staticmethod
    def choice_query():
        return Permissions.query

    def __repr__(self):
        return f"Permission('{self.permission_name}')"

    def save(self):
        db.session.add(self)
        db.session.commit()
