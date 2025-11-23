"""add local model support to ai agents

Revision ID: local_models_001
Revises: ai_governance_001
Create Date: 2025-11-23 15:30:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "local_models_001"
down_revision = "ai_governance_001"
branch_labels = None
depends_on = None


def upgrade():
    """
    Add local model support fields to tbl_ai_agents
    """
    # Add use_local_model column
    op.add_column(
        "tbl_ai_agents",
        sa.Column("use_local_model", sa.Boolean(), nullable=False, server_default="0"),
    )

    # Add local_model_url column
    op.add_column(
        "tbl_ai_agents",
        sa.Column("local_model_url", sa.String(255), nullable=True),
    )

    # Add local_model_name column
    op.add_column(
        "tbl_ai_agents",
        sa.Column("local_model_name", sa.String(100), nullable=True),
    )


def downgrade():
    """
    Remove local model support fields from tbl_ai_agents
    """
    op.drop_column("tbl_ai_agents", "local_model_name")
    op.drop_column("tbl_ai_agents", "local_model_url")
    op.drop_column("tbl_ai_agents", "use_local_model")
