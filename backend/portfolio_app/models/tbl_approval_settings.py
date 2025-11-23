"""
Approval Settings Model
Stores global configuration for AI task approval requirements
"""

from ..extensions import db
from datetime import datetime
import uuid


class ApprovalSettings(db.Model):
    """Approval Settings model - global configuration for approval requirements"""
    
    __tablename__ = 'tbl_approval_settings'
    
    # Primary Key (singleton pattern - only one record)
    settings_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Confidence Threshold
    confidence_threshold = db.Column(db.Numeric(3, 2), default=0.70, nullable=False)  # 0.70 = 70%
    
    # High Risk Task Types (JSON array)
    high_risk_task_types = db.Column(db.JSON, nullable=False, default=lambda: [
        "financial_transaction",
        "legal_decision",
        "medical_diagnosis"
    ])
    
    # SLA Configuration
    approval_sla_hours = db.Column(db.Integer, default=4, nullable=False)  # 4 hours SLA
    
    # Auto-approval settings
    auto_approve_high_confidence = db.Column(db.Boolean, default=False, nullable=False)  # Auto-approve if confidence > threshold
    auto_approve_threshold = db.Column(db.Numeric(3, 2), default=0.95, nullable=True)  # 0.95 = 95% for auto-approval
    
    # Sensitive data handling
    require_approval_for_sensitive_data = db.Column(db.Boolean, default=True, nullable=False)
    
    # Audit Fields
    created_by = db.Column(db.Integer, db.ForeignKey('tbl_users.ccn_user'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, db.ForeignKey('tbl_users.ccn_user'), nullable=True)
    
    # Relationships
    creator = db.relationship('User', backref='created_approval_settings', foreign_keys=[created_by])
    updater = db.relationship('User', backref='updated_approval_settings', foreign_keys=[updated_by])
    
    def __repr__(self):
        return f'<ApprovalSettings confidence_threshold={self.confidence_threshold}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "settings_id": self.settings_id,
            "confidence_threshold": float(self.confidence_threshold) if self.confidence_threshold else None,
            "high_risk_task_types": self.high_risk_task_types or [],
            "approval_sla_hours": self.approval_sla_hours,
            "auto_approve_high_confidence": self.auto_approve_high_confidence,
            "auto_approve_threshold": float(self.auto_approve_threshold) if self.auto_approve_threshold else None,
            "require_approval_for_sensitive_data": self.require_approval_for_sensitive_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

