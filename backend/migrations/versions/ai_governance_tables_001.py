"""add ai governance tables

Revision ID: ai_governance_001
Revises: f123456789ab
Create Date: 2024-11-22 15:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "ai_governance_001"
down_revision = "4a1206fd7d12"  # Last migration (audit_logs)
branch_labels = None
depends_on = None


def upgrade():
    """
    Create AI Governance Platform tables
    """

    # 1. tbl_ai_agents
    op.create_table(
        "tbl_ai_agents",
        sa.Column("agent_id", sa.String(36), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column(
            "agent_type",
            sa.Enum("financial", "legal", "hr", "general", name="agent_type_enum"),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("model_name", sa.String(100), nullable=False, server_default="gpt-4"),
        sa.Column(
            "confidence_threshold",
            sa.Numeric(3, 2),
            nullable=True,
            server_default="0.70",
        ),
        sa.Column(
            "status",
            sa.Enum("active", "paused", "disabled", name="agent_status_enum"),
            nullable=False,
            server_default="active",
        ),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("agent_id"),
        sa.ForeignKeyConstraint(
            ["created_by"], ["tbl_users.ccn_user"], ondelete="SET NULL"
        ),
    )
    op.create_index("idx_agent_status", "tbl_ai_agents", ["status"])
    op.create_index("idx_agent_type", "tbl_ai_agents", ["agent_type"])

    # 2. tbl_ai_tasks
    op.create_table(
        "tbl_ai_tasks",
        sa.Column("task_id", sa.String(36), nullable=False),
        sa.Column("agent_id", sa.String(36), nullable=False),
        sa.Column("submitted_by", sa.Integer(), nullable=True),
        sa.Column("task_type", sa.String(50), nullable=False),
        sa.Column("task_name", sa.String(200), nullable=True),
        sa.Column("input_data_hash", sa.String(64), nullable=True),
        sa.Column("output_data_hash", sa.String(64), nullable=True),
        sa.Column("confidence_score", sa.Numeric(5, 4), nullable=True),
        sa.Column("is_sensitive_data", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("mpc_used", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "processing",
                "awaiting_approval",
                "approved",
                "rejected",
                "completed",
                "failed",
                name="task_status_enum",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("requires_approval", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("blockchain_tx_hash", sa.String(66), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("result_data", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("task_id"),
        sa.ForeignKeyConstraint(
            ["agent_id"], ["tbl_ai_agents.agent_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["submitted_by"], ["tbl_users.ccn_user"], ondelete="SET NULL"
        ),
    )
    op.create_index("idx_task_status", "tbl_ai_tasks", ["status"])
    op.create_index("idx_task_agent", "tbl_ai_tasks", ["agent_id"])
    op.create_index("idx_task_created", "tbl_ai_tasks", ["created_at"])

    # 3. tbl_human_approvals
    op.create_table(
        "tbl_human_approvals",
        sa.Column("approval_id", sa.String(36), nullable=False),
        sa.Column("task_id", sa.String(36), nullable=False),
        sa.Column("assigned_to", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "approved",
                "rejected",
                "modified",
                name="approval_status_enum",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("original_output", sa.Text(), nullable=True),
        sa.Column("original_output_hash", sa.String(64), nullable=True),
        sa.Column("modified_output", sa.Text(), nullable=True),
        sa.Column("modified_output_hash", sa.String(64), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("blockchain_tx_hash", sa.String(66), nullable=True),
        sa.Column("sla_hours", sa.Integer(), nullable=True, server_default="4"),
        sa.Column("is_overdue", sa.Boolean(), nullable=True, server_default="0"),
        sa.PrimaryKeyConstraint("approval_id"),
        sa.ForeignKeyConstraint(
            ["task_id"], ["tbl_ai_tasks.task_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["assigned_to"], ["tbl_users.ccn_user"], ondelete="CASCADE"
        ),
    )
    op.create_index("idx_approval_status", "tbl_human_approvals", ["status"])
    op.create_index("idx_approval_assigned", "tbl_human_approvals", ["assigned_to"])

    # 4. tbl_policies
    op.create_table(
        "tbl_policies",
        sa.Column("policy_id", sa.String(36), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("rule_json", sa.JSON(), nullable=False),
        sa.Column(
            "enforcement_level",
            sa.Enum("blocking", "warning", "logging", name="enforcement_level_enum"),
            nullable=False,
            server_default="blocking",
        ),
        sa.Column("applies_to", sa.String(50), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=True, server_default="1"),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        ),
        sa.Column("version", sa.Integer(), nullable=True, server_default="1"),
        sa.PrimaryKeyConstraint("policy_id"),
        sa.ForeignKeyConstraint(
            ["created_by"], ["tbl_users.ccn_user"], ondelete="SET NULL"
        ),
    )
    op.create_index("idx_policy_active", "tbl_policies", ["active"])

    # 5. tbl_blockchain_audit
    op.create_table(
        "tbl_blockchain_audit",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.String(36), nullable=True),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(50), nullable=True),
        sa.Column("data_hash", sa.String(64), nullable=True),
        sa.Column("blockchain_tx_hash", sa.String(66), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=True),
        sa.Column(
            "timestamp",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["actor_id"], ["tbl_users.ccn_user"], ondelete="SET NULL"
        ),
        sa.UniqueConstraint("blockchain_tx_hash"),
    )
    op.create_index("idx_blockchain_event_type", "tbl_blockchain_audit", ["event_type"])
    op.create_index(
        "idx_blockchain_tx_hash", "tbl_blockchain_audit", ["blockchain_tx_hash"]
    )
    op.create_index("idx_blockchain_timestamp", "tbl_blockchain_audit", ["timestamp"])

    # 6. tbl_mpc_operations
    op.create_table(
        "tbl_mpc_operations",
        sa.Column("operation_id", sa.String(36), nullable=False),
        sa.Column("task_id", sa.String(36), nullable=True),
        sa.Column("data_type", sa.String(50), nullable=True),
        sa.Column("num_shares", sa.Integer(), nullable=True, server_default="5"),
        sa.Column("threshold", sa.Integer(), nullable=True, server_default="3"),
        sa.Column("computation_type", sa.String(50), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "completed", "failed", name="mpc_status_enum"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("result_hash", sa.String(64), nullable=True),
        sa.Column("proof_hash", sa.String(64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("operation_id"),
        sa.ForeignKeyConstraint(
            ["task_id"], ["tbl_ai_tasks.task_id"], ondelete="CASCADE"
        ),
    )
    op.create_index("idx_mpc_task", "tbl_mpc_operations", ["task_id"])
    op.create_index("idx_mpc_status", "tbl_mpc_operations", ["status"])


def downgrade():
    """
    Drop AI Governance Platform tables
    """
    op.drop_table("tbl_mpc_operations")
    op.drop_table("tbl_blockchain_audit")
    op.drop_table("tbl_policies")
    op.drop_table("tbl_human_approvals")
    op.drop_table("tbl_ai_tasks")
    op.drop_table("tbl_ai_agents")
