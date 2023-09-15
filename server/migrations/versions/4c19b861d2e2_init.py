"""init

Revision ID: 4c19b861d2e2
Revises: d7ed4eefac1a
Create Date: 2023-09-15 13:24:39.228893

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4c19b861d2e2'
down_revision = 'd7ed4eefac1a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('abilities', schema=None) as batch_op:
        batch_op.add_column(sa.Column('damage_bonus', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('abilities', schema=None) as batch_op:
        batch_op.drop_column('damage_bonus')

    # ### end Alembic commands ###
