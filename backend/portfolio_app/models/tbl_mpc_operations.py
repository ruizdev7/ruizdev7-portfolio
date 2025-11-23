"""
MPC Operations Model
Logs Multi-Party Computation operations
"""

from ..extensions import db
from datetime import datetime
import uuid


class MPCOperation(db.Model):
    """MPC Operation model - tracks secure computations"""
    
    __tablename__ = 'tbl_mpc_operations'
    
    # Primary Key
    operation_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Key
    task_id = db.Column(db.String(36), db.ForeignKey('tbl_ai_tasks.task_id'), nullable=True)
    
    # MPC Config
    data_type = db.Column(db.String(50), nullable=True)  # 'pii', 'financial', 'medical'
    num_shares = db.Column(db.Integer, default=5)
    threshold = db.Column(db.Integer, default=3)
    computation_type = db.Column(db.String(50), nullable=True)  # 'aggregate', 'multiply'
    
    # Status
    status = db.Column(
        db.Enum('pending', 'completed', 'failed', name='mpc_status_enum'),
        nullable=False,
        default='pending'
    )
    
    # Result Hashes
    result_hash = db.Column(db.String(64), nullable=True)  # SHA-256
    proof_hash = db.Column(db.String(64), nullable=True)  # ZKP proof hash
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    related_task = db.relationship('AITask', backref='mpc_operations', foreign_keys=[task_id])
    
    def __repr__(self):
        return f'<MPCOperation {self.operation_id} - {self.status}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'operation_id': self.operation_id,
            'task_id': self.task_id,
            'data_type': self.data_type,
            'num_shares': self.num_shares,
            'threshold': self.threshold,
            'computation_type': self.computation_type,
            'status': self.status,
            'result_hash': self.result_hash,
            'proof_hash': self.proof_hash,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

