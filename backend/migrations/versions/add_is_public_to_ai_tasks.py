"""add is_public to ai_tasks

Revision ID: add_is_public_ai_tasks
Revises: 9120612eef50
Create Date: 2025-11-23 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_is_public_ai_tasks'
down_revision = '9120612eef50'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_public column to tbl_ai_tasks
    op.add_column(
        'tbl_ai_tasks',
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='0')
    )
    # Add company_id for tracking which company published the task
    op.add_column(
        'tbl_ai_tasks',
        sa.Column('company_id', sa.String(36), nullable=True)
    )
    # Add index for faster public task queries
    op.create_index(
        'idx_ai_tasks_is_public',
        'tbl_ai_tasks',
        ['is_public']
    )


def downgrade():
    op.drop_index('idx_ai_tasks_is_public', table_name='tbl_ai_tasks')
    op.drop_column('tbl_ai_tasks', 'company_id')
    op.drop_column('tbl_ai_tasks', 'is_public')

