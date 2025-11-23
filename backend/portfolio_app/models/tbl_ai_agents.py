"""
AI Agents Model
Stores configuration for AI agents used in the governance platform
"""

from ..extensions import db
from datetime import datetime
import uuid


class AIAgent(db.Model):
    """AI Agent configuration model"""

    __tablename__ = "tbl_ai_agents"

    # Primary Key
    agent_id = db.Column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # Basic Info
    name = db.Column(db.String(100), nullable=False)
    agent_type = db.Column(
        db.Enum("financial", "legal", "hr", "general", name="agent_type_enum"),
        nullable=False,
        default="general",
    )
    description = db.Column(db.Text, nullable=True)

    # AI Model Config
    model_name = db.Column(db.String(100), nullable=False, default="gpt-4")
    confidence_threshold = db.Column(db.Numeric(3, 2), default=0.70)  # 0.70 = 70%

    # Status
    status = db.Column(
        db.Enum("active", "paused", "disabled", name="agent_status_enum"),
        nullable=False,
        default="active",
    )

    # Audit Fields
    created_by = db.Column(
        db.Integer, db.ForeignKey("tbl_users.ccn_user"), nullable=True
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    tasks = db.relationship(
        "AITask", backref="agent", lazy="dynamic", cascade="all, delete-orphan"
    )
    creator = db.relationship(
        "User", backref="created_agents", foreign_keys=[created_by]
    )

    def __repr__(self):
        return f"<AIAgent {self.name} ({self.agent_type})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "agent_type": self.agent_type,
            "description": self.description,
            "model_name": self.model_name,
            "confidence_threshold": (
                float(self.confidence_threshold) if self.confidence_threshold else 0.70
            ),
            "status": self.status,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "total_tasks": self.tasks.count(),
        }
