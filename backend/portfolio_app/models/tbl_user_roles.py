from portfolio_app import db
from datetime import datetime


class UserRoles(db.Model):
    __tablename__ = "tbl_user_roles"
    ccn_user_role = db.Column(db.Integer, primary_key=True)
    ccn_user = db.Column(
        db.Integer, db.ForeignKey("tbl_users.ccn_user"), nullable=False
    )
    ccn_role = db.Column(
        db.Integer, db.ForeignKey("tbl_roles.ccn_role"), nullable=False
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    # Relaciones
    user = db.relationship("User", backref="user_roles")
    role = db.relationship("Roles", backref="user_roles")

    def __init__(self, ccn_user, ccn_role):
        self.ccn_user = ccn_user
        self.ccn_role = ccn_role

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
