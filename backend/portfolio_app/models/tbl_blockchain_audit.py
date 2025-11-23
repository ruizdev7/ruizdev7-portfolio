"""
Blockchain Audit Model
Local index of blockchain transactions for fast queries
"""

from ..extensions import db
from datetime import datetime


class BlockchainAudit(db.Model):
    """Blockchain Audit model - local index of blockchain records"""
    
    __tablename__ = 'tbl_blockchain_audit'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # Event Info
    event_type = db.Column(db.String(50), nullable=False, index=True)
    entity_id = db.Column(db.String(36), nullable=True)  # task_id, approval_id, etc.
    actor_id = db.Column(db.Integer, db.ForeignKey('tbl_users.ccn_user'), nullable=True)
    action = db.Column(db.String(50), nullable=True)
    
    # Data Hash
    data_hash = db.Column(db.String(64), nullable=True)  # SHA-256
    
    # Blockchain Info
    blockchain_tx_hash = db.Column(db.String(66), unique=True, nullable=False, index=True)
    block_number = db.Column(db.BigInteger, nullable=True)
    
    # Timestamp
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    actor = db.relationship('User', backref='blockchain_actions', foreign_keys=[actor_id])
    
    def __repr__(self):
        return f'<BlockchainAudit {self.event_type} - {self.blockchain_tx_hash[:8]}...>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'event_type': self.event_type,
            'entity_id': self.entity_id,
            'actor_id': self.actor_id,
            'actor_name': self.actor.username if self.actor else None,
            'action': self.action,
            'data_hash': self.data_hash,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'block_number': self.block_number,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

