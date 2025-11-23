"""
Human Approvals Model
Stores human approval/rejection of AI decisions
"""

from ..extensions import db
from datetime import datetime
import uuid


class HumanApproval(db.Model):
    """Human Approval model - tracks supervisor approval of AI decisions"""
    
    __tablename__ = 'tbl_human_approvals'
    
    # Primary Key
    approval_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    task_id = db.Column(db.String(36), db.ForeignKey('tbl_ai_tasks.task_id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('tbl_users.ccn_user'), nullable=False)
    
    # Approval Status
    status = db.Column(
        db.Enum('pending', 'approved', 'rejected', 'modified', name='approval_status_enum'),
        nullable=False,
        default='pending'
    )
    
    # Original AI Output
    original_output = db.Column(db.Text, nullable=True)
    original_output_hash = db.Column(db.String(64), nullable=True)
    
    # Modified Output (if supervisor made changes)
    modified_output = db.Column(db.Text, nullable=True)
    modified_output_hash = db.Column(db.String(64), nullable=True)
    
    # Justification
    justification = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    
    # Blockchain
    blockchain_tx_hash = db.Column(db.String(66), nullable=True)
    
    # SLA tracking
    sla_hours = db.Column(db.Integer, default=4)  # 4 hours SLA
    is_overdue = db.Column(db.Boolean, default=False)
    
    # Relationships
    supervisor = db.relationship('User', backref='approvals', foreign_keys=[assigned_to])
    
    def __repr__(self):
        return f'<HumanApproval {self.approval_id} - {self.status}>'
    
    def to_dict(self, include_outputs=False):
        """Convert to dictionary for JSON serialization"""
        data = {
            'approval_id': self.approval_id,
            'task_id': self.task_id,
            'assigned_to': self.assigned_to,
            'supervisor_name': self.supervisor.username if self.supervisor else None,
            'status': self.status,
            'justification': self.justification,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'sla_hours': self.sla_hours,
            'is_overdue': self.is_overdue
        }
        
        if include_outputs:
            import json
            try:
                data['original_output'] = json.loads(self.original_output) if self.original_output else None
                data['modified_output'] = json.loads(self.modified_output) if self.modified_output else None
            except:
                data['original_output'] = self.original_output
                data['modified_output'] = self.modified_output
        
        return data

