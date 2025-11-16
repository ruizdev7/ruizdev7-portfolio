from typing import Optional, Dict, Any
from portfolio_app import db
from datetime import datetime


class AuditLog(db.Model):
    __tablename__ = "tbl_audit_logs"

    ccn_audit_log = db.Column(db.Integer, primary_key=True)
    ccn_user = db.Column(db.Integer, db.ForeignKey("tbl_users.ccn_user"), nullable=True)
    event_type = db.Column(db.String(50), nullable=False)
    resource = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    additional_data = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    user = db.relationship("User", backref="audit_logs")

    def __init__(
        self,
        ccn_user: Optional[int] = None,
        event_type: str = "",
        resource: str = "",
        action: str = "",
        description: str = "",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        additional_data: Optional[str] = None,
    ):
        self.ccn_user = ccn_user
        self.event_type = event_type
        self.resource = resource
        self.action = action
        self.description = description
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.additional_data = additional_data

    def __repr__(self) -> str:
        return f"AuditLog(user_id={self.ccn_user}, event_type='{self.event_type}', resource='{self.resource}', action='{self.action}')"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ccn_audit_log": self.ccn_audit_log,
            "ccn_user": self.ccn_user,
            "event_type": self.event_type,
            "resource": self.resource,
            "action": self.action,
            "description": self.description,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "additional_data": self.additional_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def save(self) -> None:
        db.session.add(self)
        db.session.commit()

    @staticmethod
    def choice_query():
        # Note: Type hint for SQLAlchemy query needs special handling
        return AuditLog.query
