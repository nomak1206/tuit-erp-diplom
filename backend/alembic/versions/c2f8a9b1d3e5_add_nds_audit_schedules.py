"""Add NDS, currency, audit_log, work_schedules, staffing_positions

Revision ID: c2f8a9b1d3e5
Revises: afa519cf45b2
Create Date: 2026-02-28 10:55:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = 'c2f8a9b1d3e5'
down_revision = 'afa519cf45b2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Invoice: NDS and e-factura fields ---
    op.add_column('invoices', sa.Column('nds_rate', sa.Float(), server_default='12.0', nullable=True))
    op.add_column('invoices', sa.Column('nds_amount', sa.Float(), server_default='0.0', nullable=True))
    op.add_column('invoices', sa.Column('currency', sa.String(10), server_default='UZS', nullable=True))
    op.add_column('invoices', sa.Column('supplier_inn', sa.String(20), nullable=True))
    op.add_column('invoices', sa.Column('buyer_inn', sa.String(20), nullable=True))
    op.add_column('invoices', sa.Column('contract_number', sa.String(100), nullable=True))

    # --- audit_logs table already exists from initial migration ---

    # --- Work Schedules table ---
    op.create_table(
        'work_schedules',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('schedule_type', sa.String(50), server_default='five_day'),
        sa.Column('department_id', sa.Integer(), sa.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True),
        sa.Column('start_time', sa.String(10), server_default='09:00'),
        sa.Column('end_time', sa.String(10), server_default='18:00'),
        sa.Column('break_minutes', sa.Integer(), server_default='60'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_work_schedules_id', 'work_schedules', ['id'])

    # --- Staffing Positions table ---
    op.create_table(
        'staffing_positions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('department_id', sa.Integer(), sa.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True),
        sa.Column('position_name', sa.String(255), nullable=False),
        sa.Column('count', sa.Integer(), server_default='1'),
        sa.Column('occupied', sa.Integer(), server_default='0'),
        sa.Column('salary_min', sa.Float(), server_default='0'),
        sa.Column('salary_max', sa.Float(), server_default='0'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_staffing_positions_id', 'staffing_positions', ['id'])


def downgrade() -> None:
    op.drop_table('staffing_positions')
    op.drop_table('work_schedules')
    op.drop_column('invoices', 'contract_number')
    op.drop_column('invoices', 'buyer_inn')
    op.drop_column('invoices', 'supplier_inn')
    op.drop_column('invoices', 'currency')
    op.drop_column('invoices', 'nds_amount')
    op.drop_column('invoices', 'nds_rate')
