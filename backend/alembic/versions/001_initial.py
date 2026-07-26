"""Initial schema scaffolding

Revision ID: 001_initial
Revises: 
Create Date: 2026-07-25 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This is a placeholder for the initial migration.
    # To generate the full DDL automatically based on the models, run:
    # docker-compose exec backend alembic revision --autogenerate -m "auto_initial"
    pass


def downgrade() -> None:
    pass
