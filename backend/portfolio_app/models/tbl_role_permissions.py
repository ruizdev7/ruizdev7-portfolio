from portfolio_app import db
from datetime import datetime


class RolePermissions(db.Model):
    __tablename__ = "tbl_role_permissions"
    ccn_role_permission = db.Column(db.Integer, primary_key=True)
    ccn_role = db.Column(
        db.Integer, db.ForeignKey("tbl_roles.ccn_role"), nullable=False
    )
    ccn_permission = db.Column(
        db.Integer, db.ForeignKey("tbl_permissions.ccn_permission"), nullable=False
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    # Relaciones
    role = db.relationship("Roles", backref="role_permissions")
    permission = db.relationship("Permissions", backref="role_permissions")

    def __init__(self, ccn_role, ccn_permission):
        self.ccn_role = ccn_role
        self.ccn_permission = ccn_permission

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
