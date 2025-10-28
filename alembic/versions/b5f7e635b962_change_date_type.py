"""change date type

Revision ID: b5f7e635b962
Revises: 352276b98124
Create Date: 2025-10-27 21:57:17.317981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5f7e635b962'
down_revision: Union[str, Sequence[str], None] = '352276b98124'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('records', 'date',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('records', 'date',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=True)
