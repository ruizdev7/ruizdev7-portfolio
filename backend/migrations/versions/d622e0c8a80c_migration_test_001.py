"""Migration test_001

Revision ID: d622e0c8a80c
Revises: 
Create Date: 2024-12-27 17:40:59.064450

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd622e0c8a80c'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tbl_categories',
    sa.Column('ccn_category', sa.Integer(), nullable=False),
    sa.Column('category', sa.String(length=100), nullable=False),
    sa.Column('description_category', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('ccn_category'),
    sa.UniqueConstraint('category')
    )
    op.create_table('tbl_users',
    sa.Column('ccn_user', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(length=20), nullable=False),
    sa.Column('middle_name', sa.String(length=20), nullable=True),
    sa.Column('last_name', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('password', sa.String(length=300), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('ccn_user'),
    sa.UniqueConstraint('email')
    )
    op.create_table('tbl_posts',
    sa.Column('ccn_post', sa.Integer(), nullable=False),
    sa.Column('ccn_author', sa.Integer(), nullable=False),
    sa.Column('ccn_category', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('published_at', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['ccn_author'], ['tbl_users.ccn_user'], ),
    sa.ForeignKeyConstraint(['ccn_category'], ['tbl_categories.ccn_category'], ),
    sa.PrimaryKeyConstraint('ccn_post')
    )
    op.create_table('tbl_comments',
    sa.Column('ccn_comment', sa.Integer(), nullable=False),
    sa.Column('ccn_post', sa.Integer(), nullable=False),
    sa.Column('ccn_author', sa.Integer(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['ccn_author'], ['tbl_users.ccn_user'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['ccn_post'], ['tbl_posts.ccn_post'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('ccn_comment')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('tbl_comments')
    op.drop_table('tbl_posts')
    op.drop_table('tbl_users')
    op.drop_table('tbl_categories')
    # ### end Alembic commands ###
