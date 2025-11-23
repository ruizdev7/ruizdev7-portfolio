"""
Policies Model
Stores governance policies for AI agents
"""

from ..extensions import db
from datetime import datetime
import uuid


class Policy(db.Model):
    """Policy model - defines rules for AI agent behavior"""
    
    __tablename__ = 'tbl_policies'
    
    # Primary Key
    policy_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic Info
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Rule Definition (JSON format)
    rule_json = db.Column(db.JSON, nullable=False)
    
    # Enforcement
    enforcement_level = db.Column(
        db.Enum('blocking', 'warning', 'logging', name='enforcement_level_enum'),
        nullable=False,
        default='blocking'
    )
    
    # Scope
    applies_to = db.Column(db.String(50), nullable=True)  # agent_type or 'all'
    
    # Status
    active = db.Column(db.Boolean, default=True)
    
    # Audit Fields
    created_by = db.Column(db.Integer, db.ForeignKey('tbl_users.ccn_user'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Version Control
    version = db.Column(db.Integer, default=1)
    
    # Relationships
    creator = db.relationship('User', backref='created_policies', foreign_keys=[created_by])
    
    def __repr__(self):
        return f'<Policy {self.name} ({self.enforcement_level})>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'policy_id': self.policy_id,
            'name': self.name,
            'description': self.description,
            'rule_json': self.rule_json,
            'enforcement_level': self.enforcement_level,
            'applies_to': self.applies_to,
            'active': self.active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version': self.version
        }

