"""empty message

Revision ID: 5d527978012e
Revises: 20b1dba0cdc3
Create Date: 2023-10-08 15:28:20.184811

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "5d527978012e"
down_revision = "20b1dba0cdc3"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("finalized_epoch_snapshots", schema=None) as batch_op:
        batch_op.add_column(sa.Column("matched_rewards", sa.String(), nullable=False))

    with op.batch_alter_table("rewards", schema=None) as batch_op:
        batch_op.add_column(sa.Column("matched", sa.String(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("rewards", schema=None) as batch_op:
        batch_op.drop_column("matched")

    with op.batch_alter_table("finalized_epoch_snapshots", schema=None) as batch_op:
        batch_op.drop_column("matched_rewards")

    # ### end Alembic commands ###
