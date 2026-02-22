import { Card, Table, Tag, Spin, Row, Col, Statistic, Select, Alert, Divider, Space } from 'antd'
import { useState } from 'react'
import { AuditOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { useTrialBalance } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

const fmt = (v: number) => v.toLocaleString('ru-RU')

const groupLabels: Record<string, string> = {
    '01': '01 — Основные средства',
    '02': '02 — Износ ОС',
    '04': '04 — НМА',
    '10': '10 — ТМЗ',
    '28': '28 — Готовая продукция',
    '31': '31 — Расходы будущих периодов',
    '40': '40 — Дебиторская задолженность',
    '50': '50 — Денежные средства',
    '60': '60 — Кредиторская задолженность',
    '64': '64 — Расчёты по налогам',
    '67': '67 — Расчёты с персоналом',
    '83': '83 — Собственный капитал',
    '87': '87 — Нерасп. прибыль',
    '90': '90 — Доходы основные',
    '91': '91 — Прочие доходы',
    '94': '94 — Расходы периода',
    '99': '99 — Финансовый результат',
}

const typeColors: Record<string, string> = {
    asset: '#6366f1',
    liability: '#f97316',
    equity: '#22c55e',
    revenue: '#06b6d4',
    expense: '#f43f5e',
    contra_asset: '#8b5cf6',
}

const typeLabels: Record<string, string> = {
    asset: 'Актив',
    liability: 'Пассив',
    equity: 'Капитал',
    revenue: 'Доход',
    expense: 'Расход',
    contra_asset: 'Контрактив',
}

export default function TrialBalance() {
    const { t } = useTranslation()
    const { data, isLoading } = useTrialBalance()
    const [groupFilter, setGroupFilter] = useState<string>('')

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const rows = data?.rows || []
    const filtered = groupFilter ? rows.filter((r: any) => r.group_code === groupFilter) : rows

    const totalOpening = filtered.reduce((s: number, r: any) => s + (r.opening_balance || 0), 0)
    const totalClosing = filtered.reduce((s: number, r: any) => s + (r.closing_balance || 0), 0)

    const groupOptions = [...new Set(rows.map((r: any) => r.group_code))].sort().map((gc: any) => ({
        value: gc as string,
        label: groupLabels[gc as string] || `Группа ${gc}`,
    }))

    const columns = [
        { title: 'Код', dataIndex: 'code', width: 80, render: (v: string) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{v}</span> },
        { title: 'Наименование счёта', dataIndex: 'name', ellipsis: true },
        { title: t('common.type'), dataIndex: 'account_type', width: 100, render: (v: string) => <Tag color={typeColors[v] || '#94a3b8'}>{typeLabels[v] || v}</Tag> },
        { title: 'Раздел', dataIndex: 'group_name', width: 180, render: (v: string) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span> },
        { title: 'Нач. сальдо', dataIndex: 'opening_balance', width: 140, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 500 }}>{fmt(v)}</span> },
        { title: 'Обороты Дт', dataIndex: 'debit_turnover', width: 130, align: 'right' as const, render: (v: number) => v > 0 ? <span style={{ color: '#6366f1', fontWeight: 500 }}>{fmt(v)}</span> : <span style={{ color: '#475569' }}>—</span> },
        { title: 'Обороты Кт', dataIndex: 'credit_turnover', width: 130, align: 'right' as const, render: (v: number) => v > 0 ? <span style={{ color: '#f97316', fontWeight: 500 }}>{fmt(v)}</span> : <span style={{ color: '#475569' }}>—</span> },
        { title: 'Кон. сальдо', dataIndex: 'closing_balance', width: 140, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 700, color: v >= 0 ? '#e2e8f0' : '#f43f5e' }}>{fmt(v)}</span> },
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
                                <Table.Summary.Cell index={0} colSpan={4}>ИТОГО</Table.Summary.Cell>
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
