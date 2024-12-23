"""Adding test_001

Revision ID: 701bead2cb00
Revises: 
Create Date: 2024-12-06 21:49:34.133463

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '701bead2cb00'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tbl_categories',
    sa.Column('ccn_category', sa.Integer(), nullable=False),
    sa.Column('category', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('ccn_category'),
    sa.UniqueConstraint('category')
    )
    op.create_table('tbl_user',
    sa.Column('ccn_user', sa.Integer(), nullable=False),
    sa.Column('name_user', sa.String(length=20), nullable=False),
    sa.Column('middle_name_user', sa.String(length=20), nullable=True),
    sa.Column('last_name_user', sa.String(length=20), nullable=False),
    sa.Column('email_user', sa.String(length=100), nullable=False),
    sa.Column('password_user', sa.String(length=300), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('ccn_user'),
    sa.UniqueConstraint('email_user')
    )
    op.create_table('tbl_post',
    sa.Column('ccn_post', sa.Integer(), nullable=False),
    sa.Column('ccn_author', sa.Integer(), nullable=False),
    sa.Column('ccn_category', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('published_at', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('update_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['ccn_author'], ['tbl_user.ccn_user'], ),
    sa.ForeignKeyConstraint(['ccn_category'], ['tbl_categories.ccn_category'], ),
    sa.PrimaryKeyConstraint('ccn_post')
    )
    op.create_table('tbl_comment',
    sa.Column('ccn_comment', sa.Integer(), nullable=False),
    sa.Column('ccn_post', sa.Integer(), nullable=False),
    sa.Column('ccn_author', sa.Integer(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['ccn_author'], ['tbl_user.ccn_user'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['ccn_post'], ['tbl_post.ccn_post'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('ccn_comment')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('tbl_comment')
    op.drop_table('tbl_post')
    op.drop_table('tbl_user')
    op.drop_table('tbl_categories')
    # ### end Alembic commands ###
