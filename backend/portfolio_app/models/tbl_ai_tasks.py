"""
AI Tasks Model
Stores AI tasks executed by agents
"""

from ..extensions import db
from datetime import datetime
import uuid


class AITask(db.Model):
    """AI Task model - represents a task executed by an AI agent"""
    
    __tablename__ = 'tbl_ai_tasks'
    
    # Primary Key
    task_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    agent_id = db.Column(db.String(36), db.ForeignKey('tbl_ai_agents.agent_id'), nullable=False)
    submitted_by = db.Column(db.Integer, db.ForeignKey('tbl_users.ccn_user'), nullable=True)
    
    # Task Info
    task_type = db.Column(db.String(50), nullable=False)
    task_name = db.Column(db.String(200), nullable=True)
    
    # Data Hashes (never store sensitive data directly)
    input_data_hash = db.Column(db.String(64), nullable=True)  # SHA-256
    output_data_hash = db.Column(db.String(64), nullable=True)
    
    # AI Metrics
    confidence_score = db.Column(db.Numeric(5, 4), nullable=True)  # 0.0000 to 1.0000
    is_sensitive_data = db.Column(db.Boolean, default=False)
    mpc_used = db.Column(db.Boolean, default=False)
    
    # Status
    status = db.Column(
        db.Enum(
            'pending', 'processing', 'awaiting_approval', 
            'approved', 'rejected', 'completed', 'failed',
            name='task_status_enum'
        ),
        nullable=False,
        default='pending'
    )
    
    requires_approval = db.Column(db.Boolean, default=False)
    
    # Blockchain
    blockchain_tx_hash = db.Column(db.String(66), nullable=True)  # Ethereum tx hash
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Results (stored as JSON text for flexibility)
    result_data = db.Column(db.Text, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    
    # Relationships
    submitter = db.relationship('User', backref='submitted_tasks', foreign_keys=[submitted_by])
    approval = db.relationship('HumanApproval', backref='task', uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<AITask {self.task_id} - {self.status}>'
    
    def to_dict(self, include_result=False):
        """Convert to dictionary for JSON serialization"""
        data = {
            'task_id': self.task_id,
            'agent_id': self.agent_id,
            'agent_name': self.agent.name if self.agent else None,
            'submitted_by': self.submitted_by,
            'task_type': self.task_type,
            'task_name': self.task_name,
            'confidence_score': float(self.confidence_score) if self.confidence_score else None,
            'is_sensitive_data': self.is_sensitive_data,
            'mpc_used': self.mpc_used,
            'status': self.status,
            'requires_approval': self.requires_approval,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'error_message': self.error_message
        }
        
        if include_result:
            import json
            try:
                data['result'] = json.loads(self.result_data) if self.result_data else None
            except:
                data['result'] = self.result_data
        
        return data

