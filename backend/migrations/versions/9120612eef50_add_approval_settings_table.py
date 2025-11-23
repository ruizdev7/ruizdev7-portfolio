"""add_approval_settings_table

Revision ID: 9120612eef50
Revises: local_models_001
Create Date: 2025-11-23 17:47:00.639828

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9120612eef50'
down_revision = 'local_models_001'
branch_labels = None
depends_on = None


def upgrade():
    """
    Create approval settings table
    """
    op.create_table(
        "tbl_approval_settings",
        sa.Column("settings_id", sa.String(36), nullable=False),
        sa.Column(
            "confidence_threshold",
            sa.Numeric(3, 2),
            nullable=False,
            server_default="0.70",
        ),
        sa.Column(
            "high_risk_task_types",
            sa.JSON(),
            nullable=False,
        ),
        sa.Column(
            "approval_sla_hours",
            sa.Integer(),
            nullable=False,
            server_default="4",
        ),
        sa.Column(
            "auto_approve_high_confidence",
            sa.Boolean(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "auto_approve_threshold",
            sa.Numeric(3, 2),
            nullable=True,
        ),
        sa.Column(
            "require_approval_for_sensitive_data",
            sa.Boolean(),
            nullable=False,
            server_default="1",
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
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("settings_id"),
        sa.ForeignKeyConstraint(
            ["created_by"], ["tbl_users.ccn_user"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["updated_by"], ["tbl_users.ccn_user"], ondelete="SET NULL"
        ),
    )


def downgrade():
    """
    Drop approval settings table
    """
    op.drop_table("tbl_approval_settings")
