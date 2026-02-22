import { Card, Table, Tag, Spin, Row, Col, Statistic, Select, Alert, Divider, Space } from 'antd'
import { useState } from 'react'
import { AuditOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { useTrialBalance } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

const fmt = (v: number) => v.toLocaleString('ru-RU')

const typeColors: Record<string, string> = {
    asset: '#6366f1',
    liability: '#f97316',
    equity: '#22c55e',
    revenue: '#06b6d4',
    expense: '#f43f5e',
    contra_asset: '#8b5cf6',
}

export default function TrialBalance() {
    const { t } = useTranslation()
    const { data, isLoading } = useTrialBalance()
    const [groupFilter, setGroupFilter] = useState<string>('')

    const typeLabels: Record<string, string> = { asset: t('accounting.accounts_by_type.asset'), liability: t('accounting.accounts_by_type.liability'), equity: t('accounting.accounts_by_type.equity'), revenue: t('accounting.accounts_by_type.revenue'), expense: t('accounting.accounts_by_type.expense'), contra_asset: t('accounting.accounts_by_type.contra') }

    const groupLabels: Record<string, string> = {
        '01': t('accounting.account_groups.01'),
        '02': t('accounting.account_groups.02'),
        '04': t('accounting.account_groups.04'),
        '10': t('accounting.account_groups.10'),
        '28': t('accounting.account_groups.28'),
        '31': t('accounting.account_groups.31'),
        '40': t('accounting.account_groups.40'),
        '50': t('accounting.account_groups.50'),
        '60': t('accounting.account_groups.60'),
        '64': t('accounting.account_groups.64'),
        '67': t('accounting.account_groups.67'),
        '83': t('accounting.account_groups.83'),
        '87': t('accounting.account_groups.87'),
        '90': t('accounting.account_groups.90'),
        '91': t('accounting.account_groups.91'),
        '94': t('accounting.account_groups.94'),
        '99': t('accounting.account_groups.99'),
    }

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const rows = data?.rows || []
    const filtered = groupFilter ? rows.filter((r: any) => r.group_code === groupFilter) : rows

    const totalOpening = filtered.reduce((s: number, r: any) => s + (r.opening_balance || 0), 0)
    const totalClosing = filtered.reduce((s: number, r: any) => s + (r.closing_balance || 0), 0)

    const groupOptions = [...new Set(rows.map((r: any) => r.group_code))].sort().map((gc: any) => ({
        value: gc as string,
        label: groupLabels[gc as string] ?? `${t('accounting.group')} ${gc}`,
    }))

    const columns = [
        { title: t('accounting.account_code'), dataIndex: 'code', width: 80, render: (v: string) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{v}</span> },
        { title: t('accounting.account_name'), dataIndex: 'name', ellipsis: true },
        { title: t('common.type'), dataIndex: 'account_type', width: 100, render: (v: string) => <Tag color={typeColors[v] || '#94a3b8'}>{typeLabels[v] || v}</Tag> },
        { title: t('accounting.section'), dataIndex: 'group_name', width: 180, render: (v: string) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span> },
        { title: t('accounting.opening_balance'), dataIndex: 'opening_balance', width: 140, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 500 }}>{fmt(v)}</span> },
        { title: t('accounting.debit_turnover'), dataIndex: 'debit_turnover', width: 130, align: 'right' as const, render: (v: number) => v > 0 ? <span style={{ color: '#6366f1', fontWeight: 500 }}>{fmt(v)}</span> : <span style={{ color: '#475569' }}>—</span> },
        { title: t('accounting.credit_turnover'), dataIndex: 'credit_turnover', width: 130, align: 'right' as const, render: (v: number) => v > 0 ? <span style={{ color: '#f97316', fontWeight: 500 }}>{fmt(v)}</span> : <span style={{ color: '#475569' }}>—</span> },
        { title: t('accounting.closing_balance'), dataIndex: 'closing_balance', width: 140, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 700, color: v >= 0 ? '#e2e8f0' : '#f43f5e' }}>{fmt(v)}</span> },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('accounting.trial_balance_title')}</h1><p>{t('accounting.subtitle')}</p></div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('accounting.total_debit')} value={data?.total_debit || 0} formatter={(v: any) => fmt(Number(v))} suffix="UZS" valueStyle={{ color: '#6366f1' }} /></Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('accounting.total_credit')} value={data?.total_credit || 0} formatter={(v: any) => fmt(Number(v))} suffix="UZS" valueStyle={{ color: '#f97316' }} /></Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('accounting.check_sum')} value={data?.is_balanced ? t('accounting.balanced') : t('accounting.balance_error')} prefix={data?.is_balanced ? <CheckCircleOutlined style={{ color: '#22c55e' }} /> : <WarningOutlined style={{ color: '#f43f5e' }} />} valueStyle={{ color: data?.is_balanced ? '#22c55e' : '#f43f5e', fontSize: 16 }} /></Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('accounting.accounts_count')} value={rows.length} prefix={<AuditOutlined style={{ color: '#8b5cf6' }} />} /></Card>
                </Col>
            </Row>

            {!data?.is_balanced && <Alert type="error" message={t('accounting.balance_warning')} showIcon style={{ marginBottom: 16 }} />}

            <Card title={t('accounting.osv')} extra={
                <Space>
                    <Select placeholder={t('accounting.all_sections')} allowClear options={groupOptions} value={groupFilter || undefined} onChange={v => setGroupFilter(v || '')} style={{ width: 260 }} />
                </Space>
            }>
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="code"
                    pagination={false}
                    size="small"
                    scroll={{ x: 1100 }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ background: 'rgba(99,102,241,0.1)', fontWeight: 700 }}>
                                <Table.Summary.Cell index={0} colSpan={4}>{t('accounting.row_total')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="right">{fmt(totalOpening)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={5} align="right" className="text-primary">{fmt(data?.total_debit || 0)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={6} align="right">{fmt(data?.total_credit || 0)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={7} align="right">{fmt(totalClosing)}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>
        </div>
    )
}
